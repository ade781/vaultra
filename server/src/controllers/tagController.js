const prisma = require('../prisma');

async function getTags(req, res, next) {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: { items: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return res.json(tags);
  } catch (error) {
    next(error);
  }
}

async function createTag(req, res, next) {
  try {
    const { name } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Tag name is required' });
    }

    const trimmedName = name.trim().toLowerCase();

    // Find existing or create
    let tag = await prisma.tag.findUnique({
      where: { name: trimmedName },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });

    if (tag) {
      return res.status(200).json(tag);
    }

    tag = await prisma.tag.create({
      data: { name: trimmedName },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });

    return res.status(201).json(tag);
  } catch (error) {
    next(error);
  }
}

async function deleteTag(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid tag ID' });
    }

    await prisma.tag.delete({
      where: { id },
    });

    return res.json({ success: true, message: 'Tag deleted successfully' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTags,
  createTag,
  deleteTag,
};
