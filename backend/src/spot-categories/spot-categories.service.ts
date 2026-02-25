import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SpotCategoriesService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    // Seed default categories if empty
    const count = await this.prisma.spotCategory.count();
    if (count === 0) {
      const defaults = [
        { name: '景点', key: 'spot', icon: 'MapPin', sortOrder: 1 },
        { name: '美食', key: 'dining', icon: 'Utensils', sortOrder: 2 },
        { name: '酒店', key: 'accommodation', icon: 'Hotel', sortOrder: 3 },
        { name: '购物', key: 'shopping', icon: 'ShoppingBag', sortOrder: 4 },
      ];

      for (const cat of defaults) {
        await this.prisma.spotCategory.create({ data: cat });
      }
      console.log('Seeded default spot categories');
    }

    // Fix existing categories with old keys (migration logic)
    const oldKeys = {
      'attraction': 'spot',
      'food': 'dining',
      'hotel': 'accommodation'
    };

    for (const [oldKey, newKey] of Object.entries(oldKeys)) {
      const oldCat = await this.prisma.spotCategory.findUnique({ where: { key: oldKey } });
      if (oldCat) {
        const newCat = await this.prisma.spotCategory.findUnique({ where: { key: newKey } });
        if (newCat) {
          // If new key already exists, just delete the old one to avoid duplicates
          await this.prisma.spotCategory.delete({ where: { id: oldCat.id } });
          console.log(`Deleted duplicate category with old key ${oldKey}`);
        } else {
          // Otherwise, rename it
          await this.prisma.spotCategory.update({
            where: { id: oldCat.id },
            data: { key: newKey }
          });
          console.log(`Renamed category key from ${oldKey} to ${newKey}`);
        }
      }
    }
  }

  findAll() {
    return this.prisma.spotCategory.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  create(data: { name: string; key: string; icon: string; sortOrder?: number }) {
    return this.prisma.spotCategory.create({
      data,
    });
  }

  update(id: number, data: { name?: string; key?: string; icon?: string; sortOrder?: number }) {
    return this.prisma.spotCategory.update({
      where: { id },
      data,
    });
  }

  remove(id: number) {
    return this.prisma.spotCategory.delete({
      where: { id },
    });
  }
}
