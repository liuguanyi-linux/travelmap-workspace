import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import * as path from 'path';

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
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|mp4|webm|mov|quicktime)$/)) {
        return cb(new BadRequestException('Only image and video files are allowed!'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 100 * 1024 * 1024 // 100MB max size
    }
  }))
  uploadFile(@UploadedFile() file: any) { // using any to avoid type issues with multer
    if (!file) {
      throw new BadRequestException('File is required');
    }
    
    // Construct public URL
    // Images: /uploads/images/xxx.jpg
    // Videos: /uploads/videos/xxx.mp4
    const isVideo = file.mimetype.startsWith('video/');
    const subDir = isVideo ? 'videos' : 'images';
    
    return {
      url: `/uploads/${subDir}/${file.filename}`,
      originalName: file.originalname,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size
    };
  }
}
