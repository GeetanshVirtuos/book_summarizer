import { spawn } from 'child_process';

export async function summarize_text(text) {
    return new Promise((resolve, reject) => {
        const py = spawn('python3', [
            './ml_engine/summarize_text_cli.py'
        ], {
            cwd: process.cwd()
        });

        let summary = '';
        let error = '';

        py.stdout.on('data', (data) => {
            summary += data.toString();
        });

        py.stderr.on('data', (data) => {
            error += data.toString();
        });

        py.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(error || `Python process exited with code ${code}`));
            } else {
                resolve(summary.trim());
            }
        });

        py.stdin.write(text);
        py.stdin.end();
    });
}

