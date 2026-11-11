const prisma = require('../prisma');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'vaultra_jwt_secret_wood_key_2026';

const VALID_ITEM_TYPES = ['link', 'card_reminder', 'document', 'bill', 'credential', 'note'];

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

function parseMetadata(meta) {
  if (!meta) return null;
  if (typeof meta === 'string') {
    try {
      return JSON.parse(meta);
    } catch {
      return null;
    }
  }
  if (typeof meta === 'object') return meta;
  return null;
}

function validateAndSanitizeCards(cards) {
  if (!Array.isArray(cards)) {
    return { error: 'Pengingat kartu memerlukan daftar kartu (metadata.cards berbentuk array)' };
  }
  if (cards.length < 1) {
    return { error: 'Pengingat kartu memerlukan minimal 1 kartu' };
  }
  if (cards.length > 10) {
    return { error: 'Maksimal 10 nomor kartu yang dapat disimpan per item' };
  }

  const sanitized = [];
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    if (!card || typeof card !== 'object') {
      return { error: `Data kartu ke-${i + 1} tidak valid` };
    }

    // Dukung kedua format key last4 DAN lastDigits
    const rawDigits =
      card.lastDigits !== undefined && card.lastDigits !== null && String(card.lastDigits).trim()
        ? String(card.lastDigits).trim()
        : card.last4 !== undefined && card.last4 !== null
        ? String(card.last4).trim()
        : '';

    if (!rawDigits) {
      return { error: `Kartu ke-${i + 1} harus memiliki 4 digit terakhir` };
    }
    const expiryDate = card.expiryDate !== undefined && card.expiryDate !== null ? String(card.expiryDate).trim() : '';
    if (!expiryDate) {
      return { error: `Kartu ke-${i + 1} harus memiliki tanggal kedaluwarsa` };
    }

    const digits = rawDigits.slice(-4);
    sanitized.push({
      id:
        card.id !== undefined && card.id !== null && String(card.id).trim()
          ? String(card.id).trim()
          : `card_${Date.now()}_${i}`,
      label: card.label !== undefined && card.label !== null ? String(card.label).trim() : '',
      last4: digits,
      lastDigits: digits,
      expiryDate: expiryDate,
    });
  }

  return { sanitized };
}

async function getItems(req, res, next) {
  try {
    const authUser = getAuthenticatedUser(req);

    let whereClause = {};

    if (!authUser) {
      // Guest: Hanya item publik
      whereClause = { isPrivate: false };
    } else if (authUser.role === 'admin') {
      // Admin: Melihat seluruh item
      whereClause = {};
    } else {
      // User login: Publik + privat milik user atau dishare ke user
      const userIdentities = [authUser.username];
      if (authUser.name && authUser.name.trim() && authUser.name !== authUser.username) {
        userIdentities.push(authUser.name.trim());
      }

      whereClause = {
        OR: [
          { isPrivate: false },
          {
            isPrivate: true,
            OR: [
              { creator: { in: userIdentities } },
              { sharedWith: authUser.username },
            ],
          },
        ],
      };
    }

    const items = await prisma.item.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
    });
    return res.json(items);
  } catch (error) {
    next(error);
  }
}

async function getItemById(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID tidak valid' });
    }
    const item = await prisma.item.findUnique({
      where: { id },
    });
    if (!item) {
      return res.status(404).json({ error: 'Kompartemen tidak ditemukan' });
    }

    if (item.isPrivate) {
      const authUser = getAuthenticatedUser(req);
      if (!authUser) {
        return res.status(403).json({ error: 'Kompartemen ini bersifat privat' });
      }
      const isAdmin = authUser.role === 'admin';
      const isOwnerOrShared =
        item.creator === authUser.username ||
        (authUser.name && item.creator === authUser.name) ||
        item.sharedWith === authUser.username;

      if (!isAdmin && !isOwnerOrShared) {
        return res.status(403).json({ error: 'Akses ditolak ke kompartemen privat ini' });
      }
    }

    return res.json(item);
  } catch (error) {
    next(error);
  }
}

async function createItem(req, res, next) {
  try {
    const { type, title, url, metadata, creator, sourceEmail, isPrivate, sharedWith } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Judul kompartemen wajib diisi' });
    }

    // Tipe item (default 'link')
    let itemType = 'link';
    if (type && typeof type === 'string' && type.trim()) {
      const normalizedType = type.trim().toLowerCase();
      if (!VALID_ITEM_TYPES.includes(normalizedType)) {
        return res.status(400).json({ error: `Tipe item tidak valid. Pilihan: ${VALID_ITEM_TYPES.join(', ')}` });
      }
      itemType = normalizedType;
    }

    // URL validation
    let finalUrl = null;
    if (itemType === 'link') {
      if (!url || typeof url !== 'string' || !url.trim()) {
        return res.status(400).json({ error: 'URL kompartemen wajib diisi' });
      }
      finalUrl = url.trim();
    } else {
      if (url && typeof url === 'string' && url.trim()) {
        finalUrl = url.trim();
      }
    }

    // Metadata validation and handling
    let finalMetadata = null;
    const parsedMeta = parseMetadata(metadata);

    if (itemType === 'card_reminder') {
      const cardValidation = validateAndSanitizeCards(parsedMeta ? parsedMeta.cards : null);
      if (cardValidation.error) {
        return res.status(400).json({ error: cardValidation.error });
      }
      finalMetadata = {
        ...(parsedMeta || {}),
        cards: cardValidation.sanitized,
      };
    } else if (parsedMeta) {
      finalMetadata = parsedMeta;
    }

    const authUser = getAuthenticatedUser(req);
    let finalCreator = 'Anonim';

    if (authUser) {
      // Jika user sudah login, otomatis isi dengan nama atau username akun yang login
      const dbUser = await prisma.user.findUnique({ where: { id: authUser.id } });
      finalCreator = (dbUser && (dbUser.name || dbUser.username)) || authUser.name || authUser.username || 'Pengguna';
    } else {
      // Jika user BELUM login, dia WAJIB mengisi nama pembuat
      if (!creator || typeof creator !== 'string' || !creator.trim() || creator.trim().toLowerCase() === 'anonim') {
        return res.status(400).json({ error: 'Nama pembuat wajib diisi karena Anda belum login' });
      }
      finalCreator = creator.trim();
    }

    const item = await prisma.item.create({
      data: {
        title: title.trim(),
        type: itemType,
        url: finalUrl,
        metadata: finalMetadata,
        creator: finalCreator,
        sourceEmail: sourceEmail && typeof sourceEmail === 'string' && sourceEmail.trim() ? sourceEmail.trim() : null,
        isPrivate: Boolean(isPrivate),
        sharedWith: isPrivate && sharedWith && typeof sharedWith === 'string' && sharedWith.trim() ? sharedWith.trim() : null,
      },
    });

    return res.status(201).json(item);
  } catch (error) {
    next(error);
  }
}

async function updateItem(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID tidak valid' });
    }

    const existingItem = await prisma.item.findUnique({ where: { id } });
    if (!existingItem) {
      return res.status(404).json({ error: 'Kompartemen tidak ditemukan' });
    }

    const authUser = getAuthenticatedUser(req);
    const isAdmin = authUser && authUser.role === 'admin';
    const isOwner =
      authUser &&
      (existingItem.creator === authUser.username || (authUser.name && existingItem.creator === authUser.name));

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        error: 'Akses ditolak: Hanya pemilik kompartemen atau admin yang dapat mengubah item ini',
      });
    }

    const { type, title, url, metadata, creator, sourceEmail, isPrivate, sharedWith } = req.body;

    // Title validation
    let finalTitle = existingItem.title;
    if (title !== undefined) {
      if (!title || typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ error: 'Judul kompartemen wajib diisi' });
      }
      finalTitle = title.trim();
    }

    // Type validation
    let finalType = existingItem.type || 'link';
    if (type !== undefined) {
      if (typeof type !== 'string' || !VALID_ITEM_TYPES.includes(type.trim().toLowerCase())) {
        return res.status(400).json({ error: `Tipe item tidak valid. Pilihan: ${VALID_ITEM_TYPES.join(', ')}` });
      }
      finalType = type.trim().toLowerCase();
    }

    // URL validation
    let finalUrl = existingItem.url;
    if (finalType === 'link') {
      if (url !== undefined) {
        if (!url || typeof url !== 'string' || !url.trim()) {
          return res.status(400).json({ error: 'URL kompartemen wajib diisi' });
        }
        finalUrl = url.trim();
      } else if (!finalUrl) {
        return res.status(400).json({ error: 'URL kompartemen wajib diisi untuk tipe link' });
      }
    } else {
      if (url !== undefined) {
        finalUrl = url && typeof url === 'string' && url.trim() ? url.trim() : null;
      }
    }

    // Metadata validation
    let finalMetadata = existingItem.metadata;
    if (metadata !== undefined) {
      const parsedMeta = parseMetadata(metadata);
      if (finalType === 'card_reminder') {
        const cardValidation = validateAndSanitizeCards(parsedMeta ? parsedMeta.cards : null);
        if (cardValidation.error) {
          return res.status(400).json({ error: cardValidation.error });
        }
        finalMetadata = {
          ...(parsedMeta || {}),
          cards: cardValidation.sanitized,
        };
      } else {
        finalMetadata = parsedMeta;
      }
    } else if (type !== undefined && finalType === 'card_reminder' && existingItem.type !== 'card_reminder') {
      return res.status(400).json({ error: 'Pengingat kartu memerlukan daftar kartu (metadata.cards)' });
    }

    // Creator logic
    let finalCreator = existingItem.creator;
    if (isAdmin && creator && typeof creator === 'string' && creator.trim()) {
      finalCreator = creator.trim();
    }

    const finalIsPrivate = isPrivate !== undefined ? Boolean(isPrivate) : existingItem.isPrivate;
    const finalSharedWith = finalIsPrivate
      ? sharedWith !== undefined
        ? sharedWith && typeof sharedWith === 'string' && sharedWith.trim()
          ? sharedWith.trim()
          : null
        : existingItem.sharedWith
      : null;

    const finalSourceEmail =
      sourceEmail !== undefined
        ? sourceEmail && typeof sourceEmail === 'string' && sourceEmail.trim()
          ? sourceEmail.trim()
          : null
        : existingItem.sourceEmail;

    const item = await prisma.item.update({
      where: { id },
      data: {
        title: finalTitle,
        type: finalType,
        url: finalUrl,
        metadata: finalMetadata,
        creator: finalCreator,
        sourceEmail: finalSourceEmail,
        isPrivate: finalIsPrivate,
        sharedWith: finalSharedWith,
      },
    });

    return res.json(item);
  } catch (error) {
    next(error);
  }
}

async function deleteItem(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID tidak valid' });
    }

    const existingItem = await prisma.item.findUnique({
      where: { id },
    });

    if (!existingItem) {
      return res.status(404).json({ error: 'Kompartemen tidak ditemukan' });
    }

    const authUser = getAuthenticatedUser(req);
    const isAdmin = authUser && authUser.role === 'admin';
    const isOwner =
      authUser &&
      (existingItem.creator === authUser.username || (authUser.name && existingItem.creator === authUser.name));

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        error: 'Akses ditolak: Hanya pemilik kompartemen atau admin yang dapat menghapus item ini',
      });
    }

    await prisma.item.delete({
      where: { id },
    });

    return res.json({ success: true, message: 'Kompartemen berhasil dihapus' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
};
