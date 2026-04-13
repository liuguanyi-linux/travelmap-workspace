const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
  const data = JSON.parse(fs.readFileSync('./backup.json', 'utf8'));
  const enterprises = data.enterprises || [];
  
  console.log(`Found ${enterprises.length} enterprises in backup.`);
  
  for (const ent of enterprises) {
    const existing = await prisma.enterprise.findUnique({ where: { id: BigInt(ent.id) } });
    if (!existing) {
      await prisma.enterprise.create({
        data: {
          id: BigInt(ent.id),
          name: ent.name || ent.title || 'Unknown',
          title: ent.title || ent.name || 'Unknown',
          description: ent.description || '',
          content: ent.content || '',
          image: ent.image || ent.avatar || '',
          category: ent.category || '[]',
          city: ent.city || '',
          address: ent.address || '',
          phone: ent.phone || '',
          wechat: ent.wechat || '',
          kakao: ent.kakao || '',
          email: ent.email || '',
          website: ent.website || '',
          rank: ent.rank || 99,
          isTop: ent.isTop || false,
          isActive: ent.isActive !== undefined ? ent.isActive : true,
          viewCount: ent.viewCount || 0
        }
      });
      console.log(`Imported enterprise: ${ent.title || ent.name}`);
    } else {
      console.log(`Enterprise already exists: ${ent.title || ent.name}`);
    }
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
