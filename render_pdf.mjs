import { createCanvas, Image } from 'canvas';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const workerPath = path.resolve('./node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs');
pdfjs.GlobalWorkerOptions.workerSrc = `file://${workerPath}`;

const standardFontDataUrl = path.resolve('./node_modules/pdfjs-dist/standard_fonts/');

const PDF_PATH = 'F:/Projeto Orbt Breands/orbit-proposal-generator-app/PDF/Orbit Brand - Proposta XPM9IK8Q5PTL4GLTBU3X - Dra Natally Torres - 01-03-2026.pdf';
const OUT_DIR = 'C:/Users/grupo/.gemini/antigravity/brain/60254239-1bd8-463a-811f-62cb448726b1';

async function main() {
    const data = await fs.readFile(PDF_PATH);
    const doc = await pdfjs.getDocument({
        data: new Uint8Array(data),
        disableWorker: true,
        standardFontDataUrl: `file://${standardFontDataUrl}/`,
        useSystemFonts: true,
    }).promise;

    console.log('Total pages:', doc.numPages);

    for (let i = 1; i <= doc.numPages; i++) {
        try {
            const page = await doc.getPage(i);
            const viewport = page.getViewport({ scale: 2.0 });
            const canvas = createCanvas(viewport.width, viewport.height);
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, viewport.width, viewport.height);

            const renderTask = page.render({
                canvasContext: ctx,
                viewport,
                intent: 'print',
            });

            try {
                await renderTask.promise;
            } catch (renderErr) {
                console.warn(`Page ${i} render warning:`, renderErr.message);
            }

            const buf = canvas.toBuffer('image/png');
            const outPath = path.join(OUT_DIR, `pdf_page_${i}.png`);
            await fs.writeFile(outPath, buf);
            console.log('Saved page', i, '->', outPath);
        } catch (pageErr) {
            console.error('Error on page', i, ':', pageErr.message);
        }
    }
    console.log('Done!');
}

main().catch(console.error);
