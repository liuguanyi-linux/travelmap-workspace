import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // 1. Seed Cities (Only requested cities)
  const cities = [
    { name: '北京', nameEn: 'Beijing', nameKo: '베이징', lng: 116.4074, lat: 39.9042, zoom: 12 },
    { name: '上海', nameEn: 'Shanghai', nameKo: '상하이', lng: 121.4737, lat: 31.2304, zoom: 12 },
    { name: '广州', nameEn: 'Guangzhou', nameKo: '광저우', lng: 113.2644, lat: 23.1291, zoom: 12 },
    { name: '深圳', nameEn: 'Shenzhen', nameKo: '선전', lng: 114.0579, lat: 22.5431, zoom: 12 },
    { name: '青岛', nameEn: 'Qingdao', nameKo: '칭다오', lng: 120.3826, lat: 36.0671, zoom: 12 },
  ];

  // Optional: Remove cities that are not in the list (Be careful with this in production!)
  // In this specific case, user wants only these cities.
  const cityNames = cities.map(c => c.name);
  console.log('Cleaning up extra cities...');
  const deleteResult = await prisma.city.deleteMany({
      where: {
          name: {
              notIn: cityNames
          }
      }
  });
  console.log(`Deleted ${deleteResult.count} extra cities.`);

  for (const c of cities) {
    const city = await prisma.city.upsert({
      where: { name: c.name },
      update: {
        nameEn: c.nameEn,
        nameKo: c.nameKo,
        // We do NOT update lng/lat/zoom to preserve user adjustments
      },
      create: {
        name: c.name,
        nameEn: c.nameEn,
        nameKo: c.nameKo,
        lng: c.lng,
        lat: c.lat,
        zoom: c.zoom,
      },
    });
    console.log(`Seeded/Updated City: ${city.name}`);
  }

  // 2. Seed Spot Categories
  const spotCategories = [
    { name: '景点', key: 'spot', icon: 'MapPin', sortOrder: 1 },
    { name: '美食', key: 'dining', icon: 'Utensils', sortOrder: 2 },
    { name: '住宿', key: 'accommodation', icon: 'Hotel', sortOrder: 3 },
    { name: '购物', key: 'shopping', icon: 'ShoppingBag', sortOrder: 4 },
    { name: '交通', key: 'transport', icon: 'Train', sortOrder: 5 },
    { name: '机场', key: 'airport', icon: 'Plane', sortOrder: 6 },
    { name: '高铁', key: 'high_speed_rail', icon: 'TrainFront', sortOrder: 7 },
  ];

  for (const cat of spotCategories) {
    const existing = await prisma.spotCategory.findUnique({ where: { key: cat.key } });
    if (!existing) {
      await prisma.spotCategory.create({ data: cat });
      console.log(`Created SpotCategory: ${cat.name} (${cat.key})`);
    } else {
      console.log(`SpotCategory ${cat.name} (${cat.key}) already exists, skipping.`);
    }
  }

  // 3. Seed Strategy Categories
  const strategyCategories = ['必玩路线', '当地体验', '实用攻略'];
  
  for (const name of strategyCategories) {
    const category = await prisma.strategyCategory.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    console.log(`Seeded StrategyCategory: ${category.name}`);
  }

  // 4. Seed Contact Info
  await prisma.contactInfo.upsert({
    where: { id: 1 },
    update: {}, // Don't overwrite existing contact info
    create: {
      phone: '123-456-7890',
      email: 'contact@travelmap.com',
      address: 'Seoul, South Korea',
    },
  });
  console.log('Seeded ContactInfo');

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
