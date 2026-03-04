import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testPdf() {
    try {
        const buffer = fs.readFileSync(path.join(__dirname, 'package.json'));
        const pdfData = await pdfParse(buffer);
        console.log("SUCCESS:", pdfData.text.substring(0, 50));
    } catch (e) {
        console.log("PDF PARSE ERROR:", e.message, e.stack);
    }
}
testPdf();
