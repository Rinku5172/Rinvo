const { PDFDocument } = require('pdf-lib');

async function test() {
    try {
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage();
        page.drawText('Test');

        console.log('Type of encrypt:', typeof pdfDoc.encrypt);

        if (typeof pdfDoc.encrypt === 'function') {
            await pdfDoc.encrypt({ userPassword: 'test' });
            console.log('Encryption successful');
        } else {
            console.error('encrypt method missing!');
        }
    } catch (e) {
        console.error('Error:', e);
    }
}

test();
