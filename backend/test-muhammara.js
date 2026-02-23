const muhammara = require('muhammara');
const fs = require('fs');
const path = require('path');

// Create a simple PDF using pdf-lib first (simulate the locked intermediate step)
const { PDFDocument } = require('pdf-lib');

async function test() {
    try {
        console.log('Creating source PDF...');
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage();
        page.drawText('This will be encrypted');
        const pdfBytes = await pdfDoc.save();
        fs.writeFileSync('test-source.pdf', pdfBytes);

        console.log('Encrypting using muhammara...');
        const recipe = new muhammara.Recipe('test-source.pdf', 'test-encrypted.pdf');

        recipe
            .encrypt({
                userPassword: 'user123',
                ownerPassword: 'owner123',
                userProtectionFlag: 4
            })
            .endPDF();

        console.log('Encryption successful! Check test-encrypted.pdf');
    } catch (e) {
        console.error('Error:', e);
    }
}

test();
