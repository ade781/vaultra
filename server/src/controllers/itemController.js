const prisma = require('../prisma');

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
    const { title, url, creator } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Judul link wajib diisi' });
    }

    if (!url || typeof url !== 'string' || !url.trim()) {
      return res.status(400).json({ error: 'Link URL wajib diisi' });
    }

    const item = await prisma.item.create({
      data: {
        title: title.trim(),
        url: url.trim(),
        creator: creator && typeof creator === 'string' && creator.trim() ? creator.trim() : 'Anonim',
      },
    });

    return res.status(201).json(item);
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
  deleteItem,
};
