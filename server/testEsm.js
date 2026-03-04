import { PDFParse } from 'pdf-parse';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testV2() {
    try {
        const buffer = fs.readFileSync(path.join(__dirname, 'package.json'));
        const parser = new PDFParse({ data: buffer });
        const textResult = await parser.getText();
        console.log("TEXT PARSED:", textResult.text?.substring(0, 100));
    } catch (e) {
        console.error("V2 ERROR:", e.message);
    }
}
testV2();
