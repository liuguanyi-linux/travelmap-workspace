const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
  const data = JSON.parse(fs.readFileSync('./backup.json', 'utf8'));
  
  const tables = ['guides', 'spots', 'strategies', 'ads'];
  
  for (const table of tables) {
    if (data[table] && Array.isArray(data[table])) {
      console.log(`\nImporting ${data[table].length} records into ${table}...`);
      for (const item of data[table]) {
        try {
          let modelName = table.slice(0, -1); // guides -> guide
          if (modelName === 'strategie') modelName = 'strategy';
          
          const idValue = item.id.length > 10 ? BigInt(item.id) : Number(item.id);
          
          const existing = await prisma[modelName].findUnique({
            where: { id: idValue }
          });
          
          if (!existing) {
             // Basic data preparation, stripping undefined/null for sqlite safety
             const createData = { ...item };
             createData.id = idValue;
             
             // Fix arrays to JSON strings if needed
             if (Array.isArray(createData.photos)) createData.photos = JSON.stringify(createData.photos);
             if (Array.isArray(createData.cities)) createData.cities = JSON.stringify(createData.cities);
             if (Array.isArray(createData.category)) createData.category = JSON.stringify(createData.category);
             if (Array.isArray(createData.tags)) createData.tags = JSON.stringify(createData.tags);
             
             // Remove fields that might not exist in schema or cause issues
             delete createData.reviews;
             delete createData.favorites;
             delete createData.location;
             
             // Handle dates
             if (createData.createdAt) createData.createdAt = new Date(createData.createdAt);
             if (createData.updatedAt) createData.updatedAt = new Date(createData.updatedAt);
             if (createData.expiryDate) createData.expiryDate = new Date(createData.expiryDate);

             await prisma[modelName].create({
               data: createData
             });
             console.log(`  + Imported ${modelName}: ${item.name || item.title}`);
          } else {
             // Update existing
             const updateData = { ...item };
             delete updateData.id;
             if (Array.isArray(updateData.photos)) updateData.photos = JSON.stringify(updateData.photos);
             if (Array.isArray(updateData.cities)) updateData.cities = JSON.stringify(updateData.cities);
             if (Array.isArray(updateData.category)) updateData.category = JSON.stringify(updateData.category);
             if (Array.isArray(updateData.tags)) updateData.tags = JSON.stringify(updateData.tags);
             delete updateData.reviews;
             delete updateData.favorites;
             delete updateData.location;
             
             if (updateData.createdAt) updateData.createdAt = new Date(updateData.createdAt);
             if (updateData.updatedAt) updateData.updatedAt = new Date(updateData.updatedAt);
             if (updateData.expiryDate) updateData.expiryDate = new Date(updateData.expiryDate);

             await prisma[modelName].update({
               where: { id: idValue },
               data: updateData
             });
             console.log(`  ~ Updated ${modelName}: ${item.name || item.title}`);
          }
        } catch (err) {
          console.error(`  ! Error importing ${item.name || item.title}:`, err.message);
        }
      }
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