import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class GuidesService {
  constructor(private prisma: PrismaService) {}

  async findAll(includeExpired: boolean = false) {
    const where = includeExpired ? {} : {
      OR: [
        { expiryDate: null },
        { expiryDate: { gt: new Date() } }
      ]
    };
    const guides = await this.prisma.guide.findMany({ 
      where,
      select: {
        id: true,
        name: true,
        gender: true,
        hasCar: true,
        title: true,
        avatar: true,
        intro: true,
        cities: true,
        rank: true,
        isTop: true,
        isGlobal: true,
        category: true,
        photos: true,
        content: true, // 致命修复：加上 content！
        expiryDate: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: [
        { isTop: 'desc' }, // Top items first
        { rank: 'asc' },   // Lower rank number = higher priority
        { createdAt: 'desc' }
      ]
    });
    return guides.map(g => this.transform(g));
  }

  async findOne(id: number) {
    const guide = await this.prisma.guide.findUnique({ where: { id } });
    if (!guide) return null;
    return this.transform(guide);
  }

  async create(data: any) {
    const { id, cities, photos, reviews, ...rest } = data;
    const newId = BigInt(Date.now()); // 手动生成合法的时间戳 BigInt ID
    const guide = await this.prisma.guide.create({
      data: {
        id: newId, // 必须强制传入新 ID
        ...rest,
        cities: JSON.stringify(cities || []),
        photos: JSON.stringify(photos || [])
      }
    });
    return this.transform(guide);
  }

  async update(id: any, data: any) {
    const bigIntId = BigInt(id);
    const { id: _, ...updateData } = data; // 先拿到所有数据
    
    // 对特殊字段进行 JSON 序列化
    if (updateData.cities) updateData.cities = JSON.stringify(updateData.cities);
    if (updateData.photos) updateData.photos = JSON.stringify(updateData.photos);

    console.log('[Step 1] 后端 Guide 接收到的 content 长度:', updateData.content?.length || 0);
    
    const result = await this.prisma.guide.update({
      where: { id: bigIntId },
      data: updateData // 确保 updateData 里含有 content
    });

    // 立即反向查询，验证是否真的入库
    const verify = await this.prisma.guide.findUnique({ where: { id: bigIntId } });
    console.log('[Step 2] 数据库持久化后的 Guide content 长度:', verify?.content?.length || 0);

    return this.transform(result);
  }

  async remove(id: any) {
    const bigIntId = BigInt(id);
    // 1. 先级联删除关联的评论
    await this.prisma.review.deleteMany({ where: { guideId: bigIntId } });
    // 2. 再删除主记录
    await this.prisma.guide.delete({ where: { id: bigIntId } });
    return { success: true };
  }

  private transform(guide: any) {
    return {
      ...guide,
      cities: JSON.parse(guide.cities),
      photos: guide.photos ? JSON.parse(guide.photos) : [],
      content: guide.content || ''
    };
  }
}
