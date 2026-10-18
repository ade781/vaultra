const http = require('http');
const app = require('./src/server');

const TEST_PORT = 5005;

async function request(path, options = {}) {
  const url = `http://localhost:${TEST_PORT}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    data = text;
  }

  return {
    status: response.status,
    ok: response.ok,
    data,
  };
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    throw new Error(message);
  }
  console.log(`✅ ${message}`);
}

async function runTests() {
  const server = app.listen(TEST_PORT, () => {
    console.log(`🧪 Test server running on http://localhost:${TEST_PORT}`);
  });

  try {
    console.log('\n--- 1. HEALTH CHECK ---');
    const health = await request('/api/health');
    assert(health.status === 200, 'Health check returns 200');
    assert(health.data.status === 'ok', 'Health status is "ok"');

    console.log('\n--- 2. CATEGORIES CRUD ---');
    const catCreate = await request('/api/categories', {
      method: 'POST',
      body: { name: 'Kuliah Test', icon: 'Book', color: '#10b981' },
    });
    assert(catCreate.status === 201, 'Category created with 201');
    assert(catCreate.data.name === 'Kuliah Test', 'Category name matches');
    assert(catCreate.data.slug === 'kuliah-test', 'Category slug generated correctly');
    const catId = catCreate.data.id;

    const catList = await request('/api/categories');
    assert(catList.status === 200, 'Categories list returns 200');
    assert(Array.isArray(catList.data), 'Categories response is an array');
    const foundCat = catList.data.find(c => c.id === catId);
    assert(Boolean(foundCat), 'Created category found in list');
    assert(foundCat._count !== undefined, 'Category includes _count');

    const catUpdate = await request(`/api/categories/${catId}`, {
      method: 'PUT',
      body: { name: 'Kuliah Updated', color: '#3b82f6' },
    });
    assert(catUpdate.status === 200, 'Category updated with 200');
    assert(catUpdate.data.name === 'Kuliah Updated', 'Category name updated');
    assert(catUpdate.data.slug === 'kuliah-updated', 'Category slug updated');

    console.log('\n--- 3. TAGS CRUD ---');
    const tagCreate = await request('/api/tags', {
      method: 'POST',
      body: { name: 'skripsi' },
    });
    assert(tagCreate.status === 201 || tagCreate.status === 200, 'Tag created/fetched');
    const tagId = tagCreate.data.id;

    const tagList = await request('/api/tags');
    assert(tagList.status === 200, 'Tags list returns 200');
    assert(Array.isArray(tagList.data), 'Tags response is an array');
    assert(tagList.data.some(t => t.id === tagId), 'Created tag in list');

    console.log('\n--- 4. ITEMS CRUD & AUTO-DETECTION ---');
    // Test 1: Folder
    const item1 = await request('/api/items', {
      method: 'POST',
      body: {
        title: 'Folder Bahan Kuliah',
        url: 'https://drive.google.com/drive/folders/1ABCxyz789',
        description: 'Kumpulan materi kuliah semester akhir',
        categoryId: catId,
        tagNames: ['skripsi', 'kuliah', 'referensi'],
      },
    });
    assert(item1.status === 201, 'Item 1 created with 201');
    assert(item1.data.driveType === 'FOLDER', 'driveType correctly detected as FOLDER');
    assert(item1.data.itemType === 'GDRIVE', 'itemType correctly detected as GDRIVE');
    assert(item1.data.tags.length === 3, 'Item 1 has 3 tags connected');
    const item1Id = item1.data.id;

    // Test 2: Document
    const item2 = await request('/api/items', {
      method: 'POST',
      body: {
        title: 'Draft Bab 1 Proposal',
        url: 'https://docs.google.com/document/d/1DOCxyz123/edit',
        description: 'Draft pendahuluan proposal',
        categoryId: catId,
        tagNames: ['skripsi', 'draft'],
      },
    });
    assert(item2.status === 201, 'Item 2 created with 201');
    assert(item2.data.driveType === 'DOC', 'driveType correctly detected as DOC');

    // Test 3: Spreadsheet
    const item3 = await request('/api/items', {
      method: 'POST',
      body: {
        title: 'Data Penelitian SPSS',
        url: 'https://docs.google.com/spreadsheets/d/1SHEETxyz456/edit',
        description: 'Hasil survey responden',
        categoryId: catId,
        tagNames: ['penelitian'],
      },
    });
    assert(item3.status === 201, 'Item 3 created with 201');
    assert(item3.data.driveType === 'SHEET', 'driveType correctly detected as SHEET');

    // Test 4: Presentation
    const item4 = await request('/api/items', {
      method: 'POST',
      body: {
        title: 'Slide Sidang Skripsi',
        url: 'https://docs.google.com/presentation/d/1SLIDExyz789/edit',
        description: 'Slide PPT untuk ujian',
        categoryId: catId,
        tagNames: ['sidang', 'final'],
      },
    });
    assert(item4.status === 201, 'Item 4 created with 201');
    assert(item4.data.driveType === 'SLIDE', 'driveType correctly detected as SLIDE');

    // Test 5: Archive
    const item5 = await request('/api/items', {
      method: 'POST',
      body: {
        title: 'Backup Data Mentah.zip',
        url: 'https://drive.google.com/file/d/1ZIPxyz/view',
        description: 'File archive zip',
        categoryId: catId,
      },
    });
    assert(item5.status === 201, 'Item 5 created with 201');
    assert(item5.data.driveType === 'ARCHIVE', 'driveType correctly detected as ARCHIVE');

    console.log('\n--- 5. ITEMS FILTERING & SEARCH ---');
    const allItems = await request('/api/items');
    assert(allItems.status === 200, 'GET /api/items returns 200');
    assert(allItems.data.length >= 5, 'All created items returned');

    const searchRes = await request('/api/items?search=Proposal');
    assert(searchRes.status === 200, 'Search request returns 200');
    assert(searchRes.data.length === 1 && searchRes.data[0].id === item2.data.id, 'Search filter matches item2');

    const catFilterRes = await request(`/api/items?categoryId=${catId}`);
    assert(catFilterRes.status === 200, 'Category filter returns 200');
    assert(catFilterRes.data.length >= 5, 'Category filter returned matching items');

    const driveTypeFilterRes = await request('/api/items?driveType=SHEET');
    assert(driveTypeFilterRes.status === 200, 'DriveType filter returns 200');
    assert(driveTypeFilterRes.data.some(i => i.id === item3.data.id), 'DriveType filter returned SHEET item');

    const tagFilterRes = await request(`/api/items?tagId=${tagId}`);
    assert(tagFilterRes.status === 200, 'Tag filter returns 200');
    assert(tagFilterRes.data.length >= 2, 'Tag filter returned tagged items');

    console.log('\n--- 6. ITEMS UPDATE & DELETE ---');
    const updatedItem1 = await request(`/api/items/${item1Id}`, {
      method: 'PUT',
      body: {
        title: 'Folder Bahan Kuliah Semester 8',
        tagNames: ['arsip-2026'],
      },
    });
    assert(updatedItem1.status === 200, 'Item updated with 200');
    assert(updatedItem1.data.title === 'Folder Bahan Kuliah Semester 8', 'Item title updated');
    assert(updatedItem1.data.tags.length === 1 && updatedItem1.data.tags[0].tag.name === 'arsip-2026', 'Tags synced on update');

    // Clean up test items
    for (const item of [item1.data, item2.data, item3.data, item4.data, item5.data]) {
      const del = await request(`/api/items/${item.id}`, { method: 'DELETE' });
      assert(del.status === 200, `Item ${item.id} deleted`);
    }

    // Clean up category
    const delCat = await request(`/api/categories/${catId}`, { method: 'DELETE' });
    assert(delCat.status === 200, 'Test category deleted');

    console.log('\n========================================');
    console.log('🎉 ALL BACKEND TESTS PASSED SUCCESSFULLY!');
    console.log('========================================\n');
  } finally {
    server.close();
  }
}

runTests().catch(err => {
  console.error('\n❌ Test Suite Failed:', err);
  process.exit(1);
});
