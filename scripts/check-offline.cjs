
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const FILES_TO_CHECK = ['index.html'];
const DIRS_TO_CHECK = ['src'];

let hasError = false;

function scanFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, index) => {
        // Regex for http/https links, but excluding localhost and comments if possible (simple check first)
        // We look for src="http", href="http", url("http"), url('http')
        // We allow http://localhost, http://127.0.0.1
        // We strictly forbid external domains.

        const regex = /(src|href|url)\s*[:=]\s*['"]?(https?:(?!\/\/localhost|(?!\/\/127\.0\.0\.1)))/i;
        const match = line.match(regex);

        if (match) {
            // Ignore if it looks like a comment (simple heuristic)
            if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) {
                return;
            }
            // Ignore xmlns
            if (line.includes('xmlns="http')) return;
            if (line.includes('<!DOCTYPE html')) return; // DOCTYPE often has http url

            console.error(`[OFFLINE VIOLATION] Found external link in ${path.relative(ROOT_DIR, filePath)}:${index + 1}`);
            console.error(`  Line: ${line.trim()}`);
            hasError = true;
        }
    });
}

function scanDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            scanDir(fullPath);
        } else if (/\.(ts|tsx|js|jsx|html|css|scss)$/.test(file)) {
            scanFile(fullPath);
        }
    });
}

console.log('Running Offline Check...');

FILES_TO_CHECK.forEach(f => {
    const p = path.join(ROOT_DIR, f);
    if (fs.existsSync(p)) scanFile(p);
});

DIRS_TO_CHECK.forEach(d => {
    const p = path.join(ROOT_DIR, d);
    if (fs.existsSync(p)) scanDir(p);
});

if (hasError) {
    console.error('FAILED: External network references found. The project must be offline-capable.');
    process.exit(1);
} else {
    console.log('PASSED: No obvious external network references found.');
    process.exit(0);
}
