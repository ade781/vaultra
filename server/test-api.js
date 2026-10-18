const app = require('./src/server');

const TEST_PORT = 5099;
const BASE_URL = `http://localhost:${TEST_PORT}`;

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
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
  } catch {
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
    console.error(`[FAIL] ${message}`);
    throw new Error(message);
  }
  console.log(`[PASS] ${message}`);
}

async function runTests() {
  const server = app.listen(TEST_PORT, () => {
    console.log(`Test server running on ${BASE_URL}`);
  });

  try {
    console.log('\n--- 1. HEALTH CHECK ---');
    const health = await request('/api/health');
    assert(health.status === 200, 'Health check returns 200');
    assert(health.data.status === 'ok', 'Health status is "ok"');

    console.log('\n--- 2. ROLES & AUTHENTICATION ---');
    // Test login initial seed admin with admin / admin123
    const adminLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { username: 'admin', password: 'admin123' },
    });
    assert(adminLogin.status === 200, 'Admin login with admin123 returns 200');
    assert(adminLogin.data.user.role === 'admin', 'Admin user role is admin');
    assert(adminLogin.data.user.isInitial === true, 'Admin user is marked as isInitial');
    const adminToken = adminLogin.data.token;

    // Test login regular user with user / user123
    const userLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { username: 'user', password: 'user123' },
    });
    assert(userLogin.status === 200, 'User login with user123 returns 200');
    assert(userLogin.data.user.role === 'user', 'Regular user role is user');
    const userToken = userLogin.data.token;

    console.log('\n--- 3. CREATOR AUTO-STAMP & VALIDATION ---');
    // A. Guest without creator -> should fail with 400
    const guestFail = await request('/api/items', {
      method: 'POST',
      body: {
        title: 'Tautan Tanpa Pembuat',
        url: 'https://example.com/test',
        creator: '',
      },
    });
    assert(guestFail.status === 400, 'Guest without creator returns 400');

    // B. Guest with creator -> should succeed
    const guestOk = await request('/api/items', {
      method: 'POST',
      body: {
        title: 'Tautan Tamu Sah',
        url: 'https://example.com/guest-link',
        creator: 'Tamu Rahasia',
      },
    });
    assert(guestOk.status === 201, 'Guest with creator returns 201');
    assert(guestOk.data.creator === 'Tamu Rahasia', 'Guest creator matches inputted value');
    const guestItemId = guestOk.data.id;

    // C. Logged in user -> should automatically stamp logged in username/name
    const loggedInCreate = await request('/api/items', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: {
        title: 'Tautan Member Login',
        url: 'https://example.com/member-link',
      },
    });
    assert(loggedInCreate.status === 201, 'Logged-in user creation returns 201');
    assert(
      loggedInCreate.data.creator === 'Pengguna Vaultra' || loggedInCreate.data.creator === 'user',
      'Creator is automatically stamped from logged-in user'
    );
    const memberItemId = loggedInCreate.data.id;

    // Cleanup items
    await request(`/api/items/${guestItemId}`, { method: 'DELETE' });
    await request(`/api/items/${memberItemId}`, { method: 'DELETE' });

    console.log('\n--- 4. REPLACE INITIAL ADMIN & AUTO-DELETE ---');
    // Replace initial admin with a new permanent admin
    const replaceRes = await request('/api/auth/replace-initial-admin', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        newUsername: 'superade7',
        newName: 'Ade Pratama Super Admin',
        newPassword: 'newadminpass123',
      },
    });
    assert(replaceRes.status === 201, 'Replace initial admin returns 201');
    assert(replaceRes.data.user.username === 'superade7', 'New admin username matches');
    assert(replaceRes.data.user.role === 'admin', 'New user role is admin');
    assert(replaceRes.data.user.isInitial === false, 'New user isInitial is false');

    // Verify old "admin" seed user is DELETED
    const oldAdminLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { username: 'admin', password: 'admin123' },
    });
    assert(oldAdminLogin.status === 401, 'Old seed admin is completely deleted from database');

    // Verify new admin can log in
    const newAdminLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { username: 'superade7', password: 'newadminpass123' },
    });
    assert(newAdminLogin.status === 200, 'New admin can login with new credentials');
    assert(newAdminLogin.data.user.isInitial === false, 'New admin is not isInitial');

    console.log('\n========================================');
    console.log('ALL API TESTS (ROLES, SEED ADMIN DELETION, CREATOR) PASSED!');
    console.log('========================================\n');
  } finally {
    server.close();
  }
}

runTests().catch((err) => {
  console.error('\nTest Suite Failed:', err);
  process.exit(1);
});