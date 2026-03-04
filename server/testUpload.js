import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testUpload() {
    try {
        console.log("1. Registering dummy user to get JWT...");
        const regRes = await axios.post('http://localhost:5000/api/auth/register', {
            name: "TestUser",
            email: `test${Date.now()}@example.com`,
            password: "Password123!"
        });
        const token = regRes.data.token;
        console.log("Token obtained: ", token.substring(0, 15) + "...");

        // Create a dummy pdf using a trick - just send package.json and label it pdf
        const form = new FormData();
        form.append('jobRole', 'Developer');
        form.append('jobDescription', 'Code stuff');
        form.append('focusArea', 'Core Concepts');
        form.append('difficulty', 'Intermediate');
        form.append('interviewType', 'Mixed');
        form.append('questionStyle', 'Conceptual');
        form.append('interviewMode', 'Timed Mode');
        form.append('companyType', 'Startup');
        form.append('resume', fs.createReadStream(path.join(__dirname, 'package.json')), {
            filename: 'resume.pdf',
            contentType: 'application/pdf'
        });

        console.log("2. Uploading 'PDF' to /api/interview/create...");
        const uploadRes = await axios.post('http://localhost:5000/api/interview/create', form, {
            headers: {
                ...form.getHeaders(),
                Authorization: `Bearer ${token}`
            }
        });

        console.log("Upload Success:", uploadRes.data.success);
    } catch (e) {
        console.log("CRASH DETAIL:");
        console.error(e);
    }
}
testUpload();
