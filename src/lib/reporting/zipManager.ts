import { ZipArchive } from 'archiver';
import fs from 'fs';
import path from 'path';

export const zipReports = (reportsDir: string, jobId: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const zipPath = path.join(reportsDir, `${jobId}.zip`);
    const output = fs.createWriteStream(zipPath);
    const archive = new ZipArchive({
      zlib: { level: 9 } // maximum compression
    });

    output.on('close', () => {
      // Clean up the generated files EXCEPT the zip file
      const files = fs.readdirSync(reportsDir);
      for (const file of files) {
        const fullPath = path.join(reportsDir, file);
        if (fullPath !== zipPath) {
          if (fs.lstatSync(fullPath).isDirectory()) {
            fs.rmSync(fullPath, { recursive: true, force: true });
          } else {
            fs.unlinkSync(fullPath);
          }
        }
      }

      // Set timeout for 10 minutes (600,000 ms) to delete the entire directory
      setTimeout(() => {
        try {
          if (fs.existsSync(reportsDir)) {
            fs.rmSync(reportsDir, { recursive: true, force: true });
            console.log(`[Cleanup] Deleted expired report directory: ${reportsDir}`);
          }
        } catch (e) {
          console.error(`Failed to delete directory ${reportsDir}:`, e);
        }
      }, 600000); // 10 minutes

      resolve(zipPath);
    });

    archive.on('error', (err: any) => {
      reject(err);
    });

    archive.pipe(output);

    // Append files from directory, except the zip itself
    archive.glob('**/*', {
      cwd: reportsDir,
      ignore: [`${jobId}.zip`]
    });

    archive.finalize();
  });
};
