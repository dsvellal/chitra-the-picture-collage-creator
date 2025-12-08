const fs = require('fs');
const path = require('path');
const config = require('../config/thresholds.json');

const reportPath = path.join(__dirname, '..', 'reports', 'mutation', 'mutation.json');
const THRESHOLD = config.mutation;

console.log(`Checking mutation score (Threshold: ${THRESHOLD} survivors allowed)...`);

if (!fs.existsSync(reportPath)) {
    console.error('Mutation report not found at:', reportPath);
    process.exit(1);
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const survivors = report.files ? Object.values(report.files).reduce((acc, file) => {
    return acc + file.mutants.filter(m => m.status === 'Survived').length;
}, 0) : 0;

console.log(`Survived Mutants: ${survivors}`);

if (survivors > THRESHOLD) {
    console.error(`FAILURE: Too many surviving mutants (${survivors} > ${THRESHOLD})`);
    process.exit(1);
} else {
    console.log('SUCCESS: Mutation check passed.');
} process.exit(0);
