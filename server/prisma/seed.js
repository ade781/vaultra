const { PrismaClient } = require('@prisma/client');
const slugify = require('slugify');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for Vaultra...');

  // 1. Create Default Categories
  const categoriesData = [
    { name: 'Kuliah & Pendidikan', icon: 'BookOpen', color: '#10b981' },
    { name: 'Pekerjaan & Karir', icon: 'Briefcase', color: '#3b82f6' },
    { name: 'Proyek & Coding', icon: 'Code', color: '#8b5cf6' },
    { name: 'Arsip & Berkas', icon: 'Archive', color: '#f59e0b' },
    { name: 'Inspirasi & Desain', icon: 'Palette', color: '#ec4899' },
  ];

  const createdCategories = [];
  for (const cat of categoriesData) {
    const slug = slugify(cat.name, { lower: true, strict: true });
    const category = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: {
        name: cat.name,
        slug,
        icon: cat.icon,
        color: cat.color,
      },
    });
    createdCategories.push(category);
  }
  console.log(`✅ Seeded ${createdCategories.length} categories.`);

  // 2. Create Default Tags
  const tagNames = ['skripsi', 'penting', 'referensi', 'template', 'draft', 'final', '2026'];
  const createdTags = [];
  for (const name of tagNames) {
    const tag = await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    createdTags.push(tag);
  }
  console.log(`✅ Seeded ${createdTags.length} tags.`);

  // 3. Create Sample Items if table is empty
  const itemCount = await prisma.item.count();
  if (itemCount === 0) {
    const catKuliah = createdCategories.find(c => c.name.includes('Kuliah'));
    const catKerja = createdCategories.find(c => c.name.includes('Pekerjaan'));
    const catProyek = createdCategories.find(c => c.name.includes('Proyek'));

    const sampleItems = [
      {
        title: 'Folder Bahan Kuliah Semester Akhir',
        url: 'https://drive.google.com/drive/folders/1aBcDeFgHiJkLmNoPqRsTuVwXyZ_Folder',
        description: 'Kumpulan materi kuliah, slide perkuliahan, dan jurnal pendukung.',
        itemType: 'GDRIVE',
        driveType: 'FOLDER',
        categoryId: catKuliah?.id,
        tags: ['kuliah', 'referensi'],
      },
      {
        title: 'Laporan Tugas Akhir / Skripsi 2026',
        url: 'https://docs.google.com/document/d/1XyZ_DocSampleId12345/edit',
        description: 'Draft naskah lengkap dari Bab 1 hingga Bab 5 berserta lampiran.',
        itemType: 'GDRIVE',
        driveType: 'DOC',
        categoryId: catKuliah?.id,
        tags: ['skripsi', 'final', 'penting'],
      },
      {
        title: 'Master Spreadsheet Rencana Kerja & Anggaran',
        url: 'https://docs.google.com/spreadsheets/d/1XyZ_SheetSampleId67890/edit',
        description: 'Tabel perhitungan RAB proyek, timeline mingguan, dan KPI bulanan.',
        itemType: 'GDRIVE',
        driveType: 'SHEET',
        categoryId: catKerja?.id,
        tags: ['penting', 'template'],
      },
      {
        title: 'Pitch Deck & Presentasi Desain Vaultra',
        url: 'https://docs.google.com/presentation/d/1XyZ_SlideSampleId54321/edit',
        description: 'Slide visual presentasi arsitektur sistem dan konsep UI/UX.',
        itemType: 'GDRIVE',
        driveType: 'SLIDE',
        categoryId: catProyek?.id,
        tags: ['template', 'final'],
      },
      {
        title: 'Backup Aset Grafis & Dataset.zip',
        url: 'https://drive.google.com/file/d/1XyZ_ArchiveSampleId99999/view',
        description: 'Arsip terkompresi berisi gambar ikon, mockups, dan dataset survey.',
        itemType: 'GDRIVE',
        driveType: 'ARCHIVE',
        categoryId: catProyek?.id,
        tags: ['referensi'],
      },
    ];

    for (const item of sampleItems) {
      const itemTags = item.tags.map(tName => ({
        tag: {
          connect: { name: tName },
        },
      }));

      await prisma.item.create({
        data: {
          title: item.title,
          url: item.url,
          description: item.description,
          itemType: item.itemType,
          driveType: item.driveType,
          categoryId: item.categoryId,
          tags: {
            create: itemTags,
          },
        },
      });
    }
    console.log(`✅ Seeded ${sampleItems.length} sample items.`);
  } else {
    console.log(`ℹ️ Items table already has ${itemCount} items, skipping item seed.`);
  }

  console.log('✨ Seeding completed successfully!');
}

main()
  .catch(e => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
