const https = require('http'); // Using http since localhost

const API_URL = 'http://localhost:5000/api/v1';

async function request(url, method, body, token) {
    const headers = {
        'Content-Type': 'application/json'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const config = {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
    };

    // Using native fetch if available (Node 18+)
    if (global.fetch) {
        const res = await fetch(url, config);
        const data = await res.json();
        if (!res.ok) {
            const error = new Error(data.message || 'Request failed');
            error.response = { status: res.status, data };
            throw error;
        }
        return { data };
    } else {
        throw new Error("Node version too old, fetch not found");
    }
}

async function verifyFlow() {
    try {
        console.log('--- Starting Admin-Client Workflow Verification ---');

        // 1. Login as Admin
        console.log('\n1. Logging in as Admin...');
        const adminLogin = await request(`${API_URL}/auth/login`, 'POST', {
            email: 'laxmanlaxman1629@gmail.com',
            password: 'password123'
        });
        const adminToken = adminLogin.data.data.accessToken;
        console.log('✅ Admin Logged In');

        // 2. Create Project + Client
        console.log('\n2. Creating Project with Client...');
        const uniqueSuffix = Date.now().toString().slice(-4);
        const clientUsername = `client_${uniqueSuffix}`;
        const clientPassword = 'TempPassword123!';

        const createPayload = {
            name: `Test Project ${uniqueSuffix}`,
            key: `TST${uniqueSuffix}`,
            description: 'Test Description',
            visibility: 'PRIVATE',
            addClient: true,
            clientDetails: {
                name: 'Test Client',
                email: `client${uniqueSuffix}@example.com`,
                username: clientUsername,
                password: clientPassword,
                accessLevel: 'VIEW_ONLY'
            },
            clientConfig: { showBudget: true }
        };

        const createRes = await request(`${API_URL}/projects`, 'POST', createPayload, adminToken);
        const projectId = createRes.data.data.project.id;
        console.log(`✅ Project Created (ID: ${projectId})`);

        // 3. Login as New Client (Verify Force Password Change)
        console.log('\n3. Logging in as New Client...');
        const clientLogin = await request(`${API_URL}/auth/login`, 'POST', {
            username: clientUsername,
            password: clientPassword
        });

        if (clientLogin.data.data.forcePasswordChange !== true) {
            throw new Error('❌ forcePasswordChange flag missing or false');
        }
        const clientTempToken = clientLogin.data.data.accessToken;
        console.log('✅ Client Logged In (Force Password Change flag detected)');

        // 4. Change Password
        console.log('\n4. Changing Password...');
        const newPassword = 'NewPassword123!';
        await request(`${API_URL}/auth/change-password`, 'POST', {
            oldPassword: clientPassword,
            newPassword: newPassword
        }, clientTempToken);
        console.log('✅ Password Changed');

        // 5. Login with New Password
        console.log('\n5. Logging in with New Password...');
        const clientNewLogin = await request(`${API_URL}/auth/login`, 'POST', {
            username: clientUsername,
            password: newPassword
        });

        if (clientNewLogin.data.data.forcePasswordChange === true) {
            throw new Error('❌ forcePasswordChange flag still true after change');
        }
        const clientNewToken = clientNewLogin.data.data.accessToken;
        console.log('✅ Client Logged In (Permanent)');

        // 6. Verify Access to Project
        console.log('\n6. Verifying Project Access...');
        const projectRes = await request(`${API_URL}/projects/${projectId}`, 'GET', undefined, clientNewToken);

        if (projectRes.data.data.project.id === projectId) {
            console.log('✅ Client can access assigned project');
        } else {
            throw new Error('❌ Client could not retrieve project details');
        }

        console.log('\n--- Verification SUCCESSFUL ---');
    } catch (error) {
        console.error('\n❌ Verification FAILED');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
        process.exit(1);
    }
}

verifyFlow();
