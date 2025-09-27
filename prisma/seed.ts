import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seed() {
  await prisma.user.deleteMany();
  await prisma.recipeOnIngredient.deleteMany();
  await prisma.userIngredient.deleteMany();
  await prisma.ingredient.deleteMany();
  await prisma.recipe.deleteMany();

  const ingNames = ['thit bo','bun','ca chua','gao','rau','trung','ca'];
  const ingObjs = [];
  for (const n of ingNames) {
    ingObjs.push(await prisma.ingredient.create({ data: { name: n } }));
  }

  const r1 = await prisma.recipe.create({ data: { name: 'Phở bò', description: 'Phở' }});
  await prisma.recipeOnIngredient.createMany({
    data: [
      { recipeId: r1.id, ingredientId: ingObjs[0].id, qty: 1 },
      { recipeId: r1.id, ingredientId: ingObjs[3].id, qty: 1 }
    ]
  });

  const r2 = await prisma.recipe.create({ data: { name: 'Bún chả', description: 'Bún chả' }});
  await prisma.recipeOnIngredient.createMany({
    data: [
      { recipeId: r2.id, ingredientId: ingObjs[1].id, qty: 1 },
      { recipeId: r2.id, ingredientId: ingObjs[0].id, qty: 1 }
    ]
  });

  const user = await prisma.user.create({ data: { name: 'Nguyen' }});
  await prisma.userIngredient.create({
    data: { userId: user.id, ingredientId: ingObjs[0].id, qty: 1 }
  });

  console.log('Seed done');
}

seed().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
