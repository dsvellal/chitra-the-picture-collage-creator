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

let survivors = 0;
if (report.files) {
    Object.entries(report.files).forEach(([fileName, fileData]) => {
        const fileSurvivors = fileData.mutants.filter(m => m.status === 'Survived').length;
        if (fileSurvivors > 0) {
            console.log(`${path.basename(fileName)}: ${fileSurvivors}`);
            survivors += fileSurvivors;
        }
    });
}

console.log(`\nTotal Survived Mutants: ${survivors}`);

if (survivors > THRESHOLD) {
    console.error(`FAILURE: Too many surviving mutants (${survivors} > ${THRESHOLD})`);
    process.exit(1);
} else {
    console.log('SUCCESS: Mutation check passed.');
} process.exit(0);
