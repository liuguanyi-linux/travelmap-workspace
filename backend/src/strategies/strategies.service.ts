import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class StrategiesService {
  constructor(private prisma: PrismaService) {}

  async findAll(includeExpired: boolean = false) {
    const where = includeExpired ? {} : {
      OR: [
        { expiryDate: null },
        { expiryDate: { gt: new Date() } }
      ]
    };
    const strategies = await this.prisma.strategy.findMany({ where });
    return strategies.map(s => this.transform(s));
  }

  async findOne(id: number) {
    const strategy = await this.prisma.strategy.findUnique({ where: { id } });
    if (!strategy) return null;
    return this.transform(strategy);
  }

  async create(data: any) {
    const { id, spots, tags, photos, videos, reviews, ...rest } = data;
    const newId = BigInt(Date.now()); // 手动生成合法的时间戳 BigInt ID
    const strategy = await this.prisma.strategy.create({
      data: {
        id: newId, // 必须强制传入新 ID
        ...rest,
        spots: JSON.stringify(spots || []),
        tags: JSON.stringify(tags || []),
        photos: JSON.stringify(photos || []),
        videos: JSON.stringify(videos || [])
      }
    });
    return this.transform(strategy);
  }

  async update(id: any, data: any) {
    const bigIntId = BigInt(id);
    const { id: _, ...updateData } = data; // 先拿到所有数据
    
    // 对特殊字段进行 JSON 序列化
    if (updateData.spots) updateData.spots = JSON.stringify(updateData.spots);
    if (updateData.tags) updateData.tags = JSON.stringify(updateData.tags);
    if (updateData.videos) updateData.videos = JSON.stringify(updateData.videos);
    
    if (updateData.photos !== undefined) {
      if (Array.isArray(updateData.photos)) {
        updateData.photos = JSON.stringify(updateData.photos);
      } else if (typeof updateData.photos === 'string') {
        try {
          const parsed = JSON.parse(updateData.photos);
          updateData.photos = Array.isArray(parsed) ? updateData.photos : JSON.stringify([updateData.photos]);
        } catch {
          updateData.photos = JSON.stringify([updateData.photos]);
        }
      }
    }

    console.log('[Step 1] 后端 Strategy 接收到的 content 长度:', updateData.content?.length || 0);
    
    const result = await this.prisma.strategy.update({
      where: { id: bigIntId },
      data: updateData // 确保 updateData 里含有 content
    });

    // 立即反向查询，验证是否真的入库
    const verify = await this.prisma.strategy.findUnique({ where: { id: bigIntId } });
    console.log('[Step 2] 数据库持久化后的 Strategy content 长度:', verify?.content?.length || 0);

    return this.transform(result);
  }

  async remove(id: any) {
    const bigIntId = BigInt(id);
    // 1. 先级联删除关联的评论
    await this.prisma.review.deleteMany({ where: { strategyId: bigIntId } });
    // 2. 再删除主记录
    await this.prisma.strategy.delete({ where: { id: bigIntId } });
    return { success: true };
  }

  private transform(strategy: any) {
    return {
      ...strategy,
      spots: JSON.parse(strategy.spots),
      tags: JSON.parse(strategy.tags),
      photos: strategy.photos ? JSON.parse(strategy.photos) : [],
      videos: strategy.videos ? JSON.parse(strategy.videos) : [],
      content: strategy.content || ''
    };
  }
}
