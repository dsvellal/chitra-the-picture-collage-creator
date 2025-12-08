
const fs = require('fs');
const path = require('path');

const reportPath = path.join(__dirname, '../reports/mutation/mutation.json');

try {
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    const files = report.files;

    const results = [];

    Object.keys(files).forEach(fileName => {
        const fileData = files[fileName];
        const survivors = fileData.mutants.filter(m => m.status === 'Survived').length;
        if (survivors > 0) {
            results.push({ fileName: path.basename(fileName), survivors });
        }
    });

    results.sort((a, b) => b.survivors - a.survivors);

    console.log('Top Survivors by File:');
    results.forEach(r => {
        console.log(`${r.fileName}: ${r.survivors}`);
    });

} catch (e) {
    console.error('Error parsing report:', e.message);
}
