import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const INITIAL_GUIDES = [
    {
      name: '王金牌',
      gender: 'male',
      hasCar: true,
      title: '导游',
      avatar: 'https://picsum.photos/seed/guide1/200/200',
      intro: '从业8年，专注于青岛历史文化讲解，为您提供最深度的旅行体验。',
      cities: ['青岛'],
      rank: 1
    },
    {
      name: '李小美',
      gender: 'female',
      hasCar: false,
      title: '导游',
      avatar: 'https://picsum.photos/seed/guide2/200/200',
      intro: '熟悉各大网红打卡点和地道美食，带你吃喝玩乐不踩雷！',
      cities: ['青岛', '上海'],
      rank: 2
    },
    {
      name: '张老三',
      gender: 'male',
      hasCar: true,
      title: '金牌司机',
      avatar: 'https://picsum.photos/seed/guide3/200/200',
      intro: '北京胡同串子，带你领略最地道的京味儿文化。',
      cities: ['北京'],
      rank: 3
    },
    {
      name: '赵小兰',
      gender: 'female',
      hasCar: true,
      title: '向导',
      avatar: 'https://picsum.photos/seed/guide4/200/200',
      intro: '青岛本地通，带车向导，舒适出行。',
      cities: ['青岛'],
      rank: 4
    }
];

const INITIAL_STRATEGIES = [
    {
      title: '青岛经典三日游',
      category: '亲子游',
      days: '3天',
      spots: ['栈桥', '八大关', '五四广场', '奥帆中心'],
      image: 'https://picsum.photos/seed/qingdao1/200/200',
      tags: ['经典路线', '海滨风光', '必打卡'],
      rank: 1
    },
    {
      title: '老城建筑人文之旅',
      category: '一日游',
      days: '1天',
      spots: ['天主教堂', '信号山', '德国总督楼'],
      image: 'https://picsum.photos/seed/qingdao2/200/200',
      tags: ['历史建筑', '人文摄影', '文艺'],
      rank: 2
    },
    {
      title: '崂山风景区深度游',
      category: '2日游',
      days: '2天',
      spots: ['太清宫', '仰口', '巨峰'],
      image: 'https://picsum.photos/seed/laoshan/200/200',
      tags: ['爬山', '自然风光', '道教文化'],
      rank: 3
    }
];

const INITIAL_CONTACT_INFO = {
  phone: '13800138000',
  email: 'contact@example.com',
  wechat: 'TravelMapHelper',
  website: 'www.travelmap.com',
  address: '青岛市市南区'
};

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      nickname: 'Test User',
    },
  });
  console.log({ user });

  // Seed Guides
  for (const guide of INITIAL_GUIDES) {
    const createdGuide = await prisma.guide.create({
        data: {
            ...guide,
            cities: JSON.stringify(guide.cities),
            photos: JSON.stringify([])
        }
    });
    console.log(`Created guide with id: ${createdGuide.id}`);
  }

  // Seed Strategies
  for (const strategy of INITIAL_STRATEGIES) {
      const createdStrategy = await prisma.strategy.create({
          data: {
              ...strategy,
              spots: JSON.stringify(strategy.spots),
              tags: JSON.stringify(strategy.tags),
              photos: JSON.stringify([]),
              videos: JSON.stringify([])
          }
      });
      console.log(`Created strategy with id: ${createdStrategy.id}`);
  }

  // Seed Contact Info
  const createdContact = await prisma.contactInfo.create({
      data: INITIAL_CONTACT_INFO
  });
  console.log(`Created contact info with id: ${createdContact.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
