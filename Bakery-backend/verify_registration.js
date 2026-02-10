const https = require('http');

const makeRequest = (postData, path = '/api/auth/register') => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve({ statusCode: res.statusCode, body: data });
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        req.write(postData);
        req.end();
    });
};

const runTest = async () => {
    const email = `test${Date.now()}@example.com`;
    const password = 'password123';
    const name = 'Test User';

    console.log(`Running test with email: ${email}`);

    try {

        const postData = JSON.stringify({ name, email, password });
        console.log('Test 1: Registering new user...');
        const res1 = await makeRequest(postData);
        console.log(`Response 1 Status: ${res1.statusCode}`);
        console.log(`Response 1 Body: ${res1.body}`);

        if (res1.statusCode !== 201) {
            console.error('FAILED: Expected 201 for new user registration');
        } else {
            console.log('PASSED: New user registered');
        }


        console.log('Test 2: Registering duplicate user...');
        const res2 = await makeRequest(postData);
        console.log(`Response 2 Status: ${res2.statusCode}`);
        console.log(`Response 2 Body: ${res2.body}`);

        if (res2.statusCode !== 400) {
            console.error('FAILED: Expected 400 for duplicate user');
        } else {
            console.log('PASSED: Duplicate user prevented');
        }

    } catch (e) {
        console.error('Error running test:', e);
    }
};

runTest();
