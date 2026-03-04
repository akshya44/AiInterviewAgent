import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function trigger() {
    console.log("Awaiting API to boot...");
    await new Promise(r => setTimeout(r, 4000));
    try {
        const regRes = await axios.post('http://localhost:5001/api/auth/register', {
            name: "Test", email: `test${Date.now()}@test.com`, password: "Pass!"
        });
        const form = new FormData();
        form.append('jobRole', 'Dev');
        form.append('jobDescription', 'Desc');
        form.append('resume', fs.createReadStream(path.join(__dirname, 'package.json')), { filename: 'test.pdf', contentType: 'application/pdf' });

        await axios.post('http://localhost:5001/api/interview/create', form, {
            headers: { ...form.getHeaders(), Authorization: `Bearer ${regRes.data.token}` }
        });
    } catch (e) { }
    process.exit(0);
}
trigger();
