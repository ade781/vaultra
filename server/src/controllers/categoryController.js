const prisma = require('../prisma');
const slugify = require('slugify');

function generateSlug(text) {
  const baseSlug = slugify(text, { lower: true, strict: true, trim: true }) || 'category';
  return baseSlug;
}

async function getCategories(req, res, next) {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { items: true },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return res.json(categories);
  } catch (error) {
    next(error);
  }
}

async function createCategory(req, res, next) {
  try {
    const { name, icon, color } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const trimmedName = name.trim();
    let slug = generateSlug(trimmedName);

    // Ensure slug uniqueness
    const existingSlug = await prisma.category.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    const category = await prisma.category.create({
      data: {
        name: trimmedName,
        slug,
        icon: icon || 'Folder',
        color: color || '#3b82f6',
      },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });

    return res.status(201).json(category);
  } catch (error) {
    next(error);
  }
}

async function updateCategory(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid category ID' });
    }

    const { name, icon, color } = req.body;
    const updateData = {};

    if (name && typeof name === 'string' && name.trim()) {
      const trimmedName = name.trim();
      updateData.name = trimmedName;

      // Update slug
      let slug = generateSlug(trimmedName);
      const existingSlug = await prisma.category.findFirst({
        where: {
          slug,
          NOT: { id },
        },
      });

      if (existingSlug) {
        slug = `${slug}-${Date.now()}`;
      }
      updateData.slug = slug;
    }

    if (icon !== undefined) updateData.icon = icon;
    if (color !== undefined) updateData.color = color;

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: { items: true },
        },
      },
    });

    return res.json(updatedCategory);
  } catch (error) {
    next(error);
  }
}

async function deleteCategory(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid category ID' });
    }

    await prisma.category.delete({
      where: { id },
    });

    return res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
