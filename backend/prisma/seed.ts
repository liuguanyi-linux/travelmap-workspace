import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // 1. Seed Default City
  const seoul = await prisma.city.upsert({
    where: { name: '首尔' },
    update: {},
    create: {
      name: '首尔',
      lng: 126.9780,
      lat: 37.5665,
      zoom: 12,
    },
  });
  console.log('Seeded City:', seoul);

  // 2. Seed Spot Categories
  const spotCategories = [
    { name: '景点', key: 'spot', icon: 'MapPin', sortOrder: 1 },
    { name: '美食', key: 'dining', icon: 'Utensils', sortOrder: 2 },
    { name: '住宿', key: 'accommodation', icon: 'Hotel', sortOrder: 3 },
    { name: '购物', key: 'shopping', icon: 'ShoppingBag', sortOrder: 4 },
    { name: '交通', key: 'transport', icon: 'Train', sortOrder: 5 },
  ];

  for (const cat of spotCategories) {
    const category = await prisma.spotCategory.upsert({
      where: { key: cat.key },
      update: { icon: cat.icon, sortOrder: cat.sortOrder },
      create: cat,
    });
    console.log(`Seeded SpotCategory: ${category.name}`);
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

  // 4. Seed Contact Info (Optional default)
  const contact = await prisma.contactInfo.upsert({
    where: { id: 1 },
    update: {},
    create: {
      phone: '123-456-7890',
      email: 'contact@travelmap.com',
      address: 'Seoul, South Korea',
    },
  });
  console.log('Seeded ContactInfo');

  // 5. Recover Missing Cities from Spots
  // If user deleted a city but spots still reference it, re-create the city so spots become visible.
  const spots = await prisma.spot.findMany({ select: { city: true } });
  const uniqueCities = [...new Set(spots.map(s => s.city).filter(Boolean))];

  for (const cityName of uniqueCities) {
    // Check if city exists
    const cityExists = await prisma.city.findUnique({ where: { name: cityName } });
    if (!cityExists) {
        // Create city with default Seoul coordinates as fallback
        await prisma.city.create({
            data: {
                name: cityName,
                lng: 126.9780, 
                lat: 37.5665,
                zoom: 12,
            }
        });
        console.log(`Recovered missing city from existing spots: ${cityName}`);
    }
  }

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
