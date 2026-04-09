import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import { AdminGuard } from '../auth/admin.guard';

@Controller('upload')
export class UploadController {
  @Post()
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const isVideo = file.mimetype.startsWith('video/');
        const uploadDir = isVideo ? './uploads/videos' : './uploads/images';
        const absolutePath = path.resolve(process.cwd(), uploadDir);
        if (!fs.existsSync(absolutePath)) {
          fs.mkdirSync(absolutePath, { recursive: true });
        }
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        return cb(null, `${randomName}${extname(file.originalname)}`);
      }
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp|mp4|webm|mov|quicktime)$/)) {
        return cb(new BadRequestException('Only image (jpg, png, gif, webp) and video files are allowed!'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 100 * 1024 * 1024 }
  }))
  async uploadFile(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const isVideo = file.mimetype.startsWith('video/');
    const subDir = isVideo ? 'videos' : 'images';
    let finalFilename = file.filename;
    let finalMimetype = file.mimetype;
    let finalSize = file.size;

    if (!isVideo) {
      try {
        const originalPath = file.path;
        const filenameWithoutExt = path.parse(file.filename).name;
        const webpFilename = `${filenameWithoutExt}.webp`;
        const webpPath = path.join(file.destination, webpFilename);
        await sharp(originalPath)
          .resize(1280, 1280, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(webpPath);
        try { fs.unlinkSync(originalPath); } catch {}
        finalFilename = webpFilename;
        finalMimetype = 'image/webp';
        const stats = fs.statSync(webpPath);
        finalSize = stats.size;
      } catch (error) {
        console.error('[Upload] Image processing failed:', error);
      }
    }
    return {
      url: `/uploads/${subDir}/${finalFilename}`,
      originalName: file.originalname,
      filename: finalFilename,
      mimetype: finalMimetype,
      size: finalSize
    };
  }
}
