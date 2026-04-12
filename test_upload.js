
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

async function testUpload() {
    try {
        // 1. Login
        const loginRes = await axios.post('http://localhost:5000/api/login', {
            email: 'guest@gmail.com',
            password: 'any'
        });
        const token = loginRes.data.token;
        console.log('Token acquired:', token);

        // 2. Upload
        const form = new FormData();
        form.append('zipFile', fs.createReadStream(path.join(__dirname, 'tmp_test/test.zip')));
        form.append('name', 'autotest-1');

        const uploadRes = await axios.post('http://localhost:5000/api/projects/upload', form, {
            headers: {
                ...form.getHeaders(),
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Upload Result:', JSON.stringify(uploadRes.data, null, 2));
        const url = uploadRes.data.url;
        console.log('Checking URL:', url);

        // 3. Check URL
        setTimeout(async () => {
            try {
                const siteRes = await axios.get(url);
                console.log('Site Access Status:', siteRes.status);
                // console.log('Site Content Snippet:', siteRes.data.substring(0, 100));
            } catch (err) {
                console.error('Site Access Failed:', err.response ? err.response.data : err.message);
            }
        }, 2000);

    } catch (err) {
        console.error('Test Failed:', err.response ? err.response.data : err.message);
    }
}

testUpload();
