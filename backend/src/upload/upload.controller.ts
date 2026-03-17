import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

@Controller('upload')
export class UploadController {
  @Post()
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        // Determine upload directory based on file type
        const isVideo = file.mimetype.startsWith('video/');
        const uploadDir = isVideo ? './uploads/videos' : './uploads/images';

        // Ensure directory exists
        const absolutePath = path.resolve(process.cwd(), uploadDir);
        if (!fs.existsSync(absolutePath)) {
          fs.mkdirSync(absolutePath, { recursive: true });
        }

        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        // Generate random filename to prevent collisions
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        return cb(null, `${randomName}${extname(file.originalname)}`);
      }
    }),
    fileFilter: (req, file, cb) => {
      // Accept images and videos
      // Added webp for better web performance
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp|mp4|webm|mov|quicktime)$/)) {
        return cb(new BadRequestException('Only image (jpg, png, gif, webp) and video files are allowed!'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 100 * 1024 * 1024 // 100MB max size
    }
  }))
  async uploadFile(@UploadedFile() file: any) { // using any to avoid type issues with multer
    if (!file) {
      throw new BadRequestException('File is required');
    }
    
    // Construct public URL
    // Images: /uploads/images/xxx.jpg
    // Videos: /uploads/videos/xxx.mp4
    const isVideo = file.mimetype.startsWith('video/');
    const subDir = isVideo ? 'videos' : 'images';
    let finalFilename = file.filename;
    let finalMimetype = file.mimetype;
    let finalSize = file.size;

    // Process Image if it's not a video
    if (!isVideo) {
        try {
            const originalPath = file.path;
            const filenameWithoutExt = path.parse(file.filename).name;
            const webpFilename = `${filenameWithoutExt}.webp`;
            const webpPath = path.join(file.destination, webpFilename);

            console.log(`[Upload] Processing image: ${originalPath}`);

            // Convert to WebP using sharp
            await sharp(originalPath)
                .resize(1280, 1280, { // Limit max dimension
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .webp({ quality: 80 }) // 80% quality
                .toFile(webpPath);

            console.log(`[Upload] Converted to WebP: ${webpPath}`);

            // Delete original file to save space (optional, but recommended for saving space)
            // Or keep both and serve webp. Here we replace it to enforce webp usage.
            try {
                fs.unlinkSync(originalPath);
            } catch (unlinkError) {
                console.error('[Upload] Failed to delete original file:', unlinkError);
            }

            // Update return info
            finalFilename = webpFilename;
            finalMimetype = 'image/webp';
            const stats = fs.statSync(webpPath);
            finalSize = stats.size;

        } catch (error) {
            console.error('[Upload] Image processing failed (Sharp error):', error);
            // Fallback to original file if processing fails
            // We LOG explicitly now to debug on server
        }
    }
    
    return {
      url: `/uploads/${subDir}/${finalFilename}`, // Always return relative path
      originalName: file.originalname,
      filename: finalFilename,
      mimetype: finalMimetype,
      size: finalSize
    };
  }
}
