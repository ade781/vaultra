const prisma = require('../prisma');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'vaultra_jwt_secret_wood_key_2026';

function getAuthenticatedUser(req) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      return jwt.verify(token, JWT_SECRET);
    }
  } catch {
    // Ignore invalid token
  }
  return null;
}

/**
 * Export backup data
 * Admin: Full backup (semua item)
 * User: Item milik user yang bersangkutan
 */
async function exportBackup(req, res, next) {
  try {
    const authUser = getAuthenticatedUser(req);
    if (!authUser) {
      return res.status(401).json({ error: 'Autentikasi diperlukan untuk mengekspor cadangan' });
    }

    let whereClause = {};
    if (authUser.role !== 'admin') {
      const userIdentities = [authUser.username];
      if (authUser.name && authUser.name.trim() && authUser.name !== authUser.username) {
        userIdentities.push(authUser.name.trim());
      }
      whereClause = {
        creator: { in: userIdentities },
      };
    }

    const items = await prisma.item.findMany({
      where: whereClause,
      orderBy: {
        id: 'asc',
      },
    });

    const backupPayload = {
      vaultraVersion: '1.0.0',
      exportedAt: new Date().toISOString(),
      itemCount: items.length,
      items: items,
    };

    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `vaultra-backup-${dateStr}.json`;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(JSON.stringify(backupPayload, null, 2));
  } catch (error) {
    next(error);
  }
}

/**
 * Restore backup data
 * Memvalidasi data JSON, melakukan insert/upsert di dalam transaksi Prisma,
 * dan mereset sequence PostgreSQL agar penomoran ID berikutnya tetap konsisten.
 */
async function restoreBackup(req, res, next) {
  try {
    const authUser = getAuthenticatedUser(req);
    if (!authUser) {
      return res.status(401).json({ error: 'Autentikasi diperlukan untuk memulihkan cadangan' });
    }

    const rawData = req.body;
    const items = Array.isArray(rawData) ? rawData : (rawData && Array.isArray(rawData.items) ? rawData.items : null);

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Format data cadangan tidak valid atau daftar kompartemen kosong' });
    }

    const isAdmin = authUser.role === 'admin';
    let restoredCount = 0;

    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        if (!item || typeof item !== 'object') continue;
        const title = item.title && typeof item.title === 'string' ? item.title.trim() : null;
        if (!title) continue;

        const type = item.type && typeof item.type === 'string' ? item.type.trim() : 'link';
        const url = item.url && typeof item.url === 'string' ? item.url.trim() : null;
        const metadata = item.metadata !== undefined ? item.metadata : null;
        const sourceEmail = item.sourceEmail && typeof item.sourceEmail === 'string' ? item.sourceEmail.trim() : null;
        const isPrivate = Boolean(item.isPrivate);
        const sharedWith = item.sharedWith && typeof item.sharedWith === 'string' ? item.sharedWith.trim() : null;

        // Tentukan creator: admin dapat memulihkan creator asli, user biasa memakai identitasnya
        let creator = isAdmin
          ? (item.creator && typeof item.creator === 'string' ? item.creator.trim() : authUser.username)
          : authUser.name || authUser.username;

        const id = item.id && Number.isInteger(Number(item.id)) ? Number(item.id) : null;

        const dataPayload = {
          title,
          type,
          url,
          metadata,
          creator,
          sourceEmail,
          isPrivate,
          sharedWith,
          ...(item.createdAt ? { createdAt: new Date(item.createdAt) } : {}),
          ...(item.updatedAt ? { updatedAt: new Date(item.updatedAt) } : {}),
        };

        if (id && isAdmin) {
          // Upsert dengan ID spesifik (khusus admin mode agar mempertahankan referensi ID lama)
          await tx.item.upsert({
            where: { id },
            create: {
              id,
              ...dataPayload,
            },
            update: dataPayload,
          });
        } else {
          // Buat entri baru
          await tx.item.create({
            data: dataPayload,
          });
        }

        restoredCount++;
      }

      // Reset sequence PostgreSQL agar id autoincrement berikutnya berada di atas max(id)
      try {
        await tx.$executeRawUnsafe(`
          SELECT setval(pg_get_serial_sequence('"Item"', 'id'), coalesce(max(id), 1)) FROM "Item";
        `);
      } catch (seqErr) {
        console.warn('Peringatan: Gagal mereset sequence autoincrement:', seqErr.message);
      }
    });

    return res.json({
      success: true,
      message: `Berhasil memulihkan ${restoredCount} kompartemen`,
      restoredCount,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  exportBackup,
  restoreBackup,
};
