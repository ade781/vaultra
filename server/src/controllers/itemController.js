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

async function getItems(req, res, next) {
  try {
    const items = await prisma.item.findMany({
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
      return res.status(404).json({ error: 'Link tidak ditemukan' });
    }
    return res.json(item);
  } catch (error) {
    next(error);
  }
}

async function createItem(req, res, next) {
  try {
    const { title, url, creator, sourceEmail, isPrivate, sharedWith } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Judul link wajib diisi' });
    }

    if (!url || typeof url !== 'string' || !url.trim()) {
      return res.status(400).json({ error: 'Link URL wajib diisi' });
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
        url: url.trim(),
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

    const { title, url, creator, sourceEmail, isPrivate, sharedWith } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Judul link wajib diisi' });
    }

    if (!url || typeof url !== 'string' || !url.trim()) {
      return res.status(400).json({ error: 'Link URL wajib diisi' });
    }

    const existingItem = await prisma.item.findUnique({ where: { id } });
    if (!existingItem) {
      return res.status(404).json({ error: 'Link tidak ditemukan' });
    }

    const authUser = getAuthenticatedUser(req);
    let finalCreator = existingItem.creator;

    if (authUser) {
      if (creator && typeof creator === 'string' && creator.trim()) {
        finalCreator = creator.trim();
      }
    } else {
      if (creator && typeof creator === 'string' && creator.trim()) {
        finalCreator = creator.trim();
      } else if (!finalCreator || finalCreator === 'Anonim') {
        return res.status(400).json({ error: 'Nama pembuat wajib diisi' });
      }
    }

    const item = await prisma.item.update({
      where: { id },
      data: {
        title: title.trim(),
        url: url.trim(),
        creator: finalCreator,
        sourceEmail: sourceEmail && typeof sourceEmail === 'string' && sourceEmail.trim() ? sourceEmail.trim() : null,
        isPrivate: Boolean(isPrivate),
        sharedWith: isPrivate && sharedWith && typeof sharedWith === 'string' && sharedWith.trim() ? sharedWith.trim() : null,
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

    await prisma.item.delete({
      where: { id },
    });

    return res.json({ success: true, message: 'Link berhasil dihapus' });
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