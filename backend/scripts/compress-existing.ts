
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

const UPLOADS_DIR = path.join(__dirname, '../uploads/images');

async function compressExistingImages() {
  console.log(`Scanning directory: ${UPLOADS_DIR}`);
  
  if (!fs.existsSync(UPLOADS_DIR)) {
    console.error('Uploads directory not found!');
    return;
  }

  const files = fs.readdirSync(UPLOADS_DIR);
  let processed = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of files) {
    if (file.match(/\.(jpg|jpeg|png)$/i)) {
      const filePath = path.join(UPLOADS_DIR, file);
      const stats = fs.statSync(filePath);

      // Only process if larger than 500KB to save time, or just process all?
      // User said "max 1.7MB", so let's process anything > 300KB
      if (stats.size > 300 * 1024) {
        console.log(`Processing ${file} (${(stats.size / 1024).toFixed(2)} KB)...`);
        
        try {
            // Create a temp file
            const tempPath = filePath + '.tmp';
            
            // Compress but keep format (to avoid breaking DB links)
            // Or convert to WebP? 
            // If we convert to WebP, we change extension, breaking DB.
            // So we will Optimize the JPEG/PNG in place.
            
            const image = sharp(filePath);
            const metadata = await image.metadata();
            
            // Resize if needed
            if ((metadata.width || 0) > 1280 || (metadata.height || 0) > 1280) {
                image.resize(1280, 1280, { fit: 'inside', withoutEnlargement: true });
            }

            if (file.toLowerCase().endsWith('.png')) {
                await image.png({ quality: 80 }).toFile(tempPath);
            } else {
                await image.jpeg({ quality: 80 }).toFile(tempPath);
            }

            // Replace original
            fs.unlinkSync(filePath);
            fs.renameSync(tempPath, filePath);
            
            const newStats = fs.statSync(filePath);
            console.log(`  -> Compressed to ${(newStats.size / 1024).toFixed(2)} KB`);
            processed++;
        } catch (err) {
            console.error(`  -> Failed to process ${file}:`, err);
            errors++;
        }
      } else {
        skipped++;
      }
    }
  }

  console.log(`\nDone! Processed: ${processed}, Skipped: ${skipped}, Errors: ${errors}`);
}

compressExistingImages();
