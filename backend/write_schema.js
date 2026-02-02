const fs = require('fs');
const content = \
model User {
  id        Int        @id @default(autoincrement())
  email     String     @unique
  nickname  String?
  reviews   Review[]
  favorites Favorite[]
  createdAt DateTime   @default(now())
}

model Poi {
  id          Int        @id @default(autoincrement())
  amapId      String     @unique
  name        String
  type        String
  isCurated   Boolean    @default(false)
  coverImage  String?
  description String?
  reviews     Review[]
  favorites   Favorite[]
}

model Review {
  id        Int      @id @default(autoincrement())
  rating    Int
  content   String?
  images    String?
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
  poiId     Int
  poi       Poi      @relation(fields: [poiId], references: [id])
  createdAt DateTime @default(now())
}

model Favorite {
  id        Int      @id @default(autoincrement())
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
  poiId     Int
  poi       Poi      @relation(fields: [poiId], references: [id])
  createdAt DateTime @default(now())
}
\;
fs.writeFileSync('C:/Users/10124/Downloads/travelmap_workspace/backend/prisma/schema.prisma', content);
