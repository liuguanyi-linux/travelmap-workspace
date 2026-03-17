
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const OLD_URL = 'http://110.42.143.48/api';

async function main() {
  console.log('Starting DB Cleanup...');

  // 1. Clean Spots
  const spots = await prisma.spot.findMany();
  let spotCount = 0;
  for (const spot of spots) {
    if (spot.photos && spot.photos.includes(OLD_URL)) {
      const newPhotos = spot.photos.replaceAll(OLD_URL, '');
      await prisma.spot.update({
        where: { id: spot.id },
        data: { photos: newPhotos }
      });
      spotCount++;
    }
  }
  console.log(`Updated ${spotCount} spots.`);

  // 2. Clean Guides
  const guides = await prisma.guide.findMany();
  let guideCount = 0;
  for (const guide of guides) {
    let needsUpdate = false;
    let data = {};

    if (guide.avatar && guide.avatar.includes(OLD_URL)) {
        data.avatar = guide.avatar.replaceAll(OLD_URL, '');
        needsUpdate = true;
    }
    if (guide.photos && guide.photos.includes(OLD_URL)) {
        data.photos = guide.photos.replaceAll(OLD_URL, '');
        needsUpdate = true;
    }

    if (needsUpdate) {
      await prisma.guide.update({
        where: { id: guide.id },
        data: data
      });
      guideCount++;
    }
  }
  console.log(`Updated ${guideCount} guides.`);

  // 3. Clean Strategies
  const strategies = await prisma.strategy.findMany();
  let strategyCount = 0;
  for (const st of strategies) {
    let needsUpdate = false;
    let data = {};

    if (st.image && st.image.includes(OLD_URL)) {
        data.image = st.image.replaceAll(OLD_URL, '');
        needsUpdate = true;
    }
    if (st.photos && st.photos.includes(OLD_URL)) {
        data.photos = st.photos.replaceAll(OLD_URL, '');
        needsUpdate = true;
    }

    if (needsUpdate) {
      await prisma.strategy.update({
        where: { id: st.id },
        data: data
      });
      strategyCount++;
    }
  }
  console.log(`Updated ${strategyCount} strategies.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
