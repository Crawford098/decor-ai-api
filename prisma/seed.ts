import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.design.deleteMany();
  await prisma.palette.deleteMany();

  // Seed palettes
  const warmTones = await prisma.palette.create({
    data: {
      name: 'Warm Tones',
      colors: ['#FF5733', '#FFBD33', '#C70039', '#900C3F', '#581845']
    }
  });

  const coolTones = await prisma.palette.create({
    data: {
      name: 'Cool Tones',
      colors: ['#33FFBD', '#33C7FF', '#3390FF', '#3358FF', '#3333FF']
    }
  });

  const neutral = await prisma.palette.create({
    data: {
      name: 'Neutral',
      colors: ['#F5F5DC', '#D3D3D3', '#A9A9A9', '#808080', '#696969']
    }
  });

  const earthTones = await prisma.palette.create({
    data: {
      name: 'Earth Tones',
      colors: ['#8B4513', '#D2691E', '#CD853F', '#DEB887', '#F5DEB3']
    }
  });

  console.log('✅ Palettes seeded');

  // Seed designs
  await prisma.design.create({
    data: {
      title: 'Modern Living Room',
      description: 'Sleek and contemporary living room with minimalist furniture',
      roomType: 'Living Room',
      style: 'Modern',
      paletteId: neutral.id,
      imageUrl: 'https://example.com/designs/modern-living-room.jpg',
      aiPrompt: 'Create a modern living room with neutral colors and clean lines'
    }
  });

  await prisma.design.create({
    data: {
      title: 'Cozy Bedroom',
      description: 'Warm and inviting bedroom with natural wood accents',
      roomType: 'Bedroom',
      style: 'Scandinavian',
      paletteId: warmTones.id,
      imageUrl: 'https://example.com/designs/cozy-bedroom.jpg',
      aiPrompt: 'Design a cozy bedroom with warm tones and Scandinavian style'
    }
  });

  await prisma.design.create({
    data: {
      title: 'Industrial Kitchen',
      description: 'Rustic kitchen with exposed brick and metal fixtures',
      roomType: 'Kitchen',
      style: 'Industrial',
      paletteId: earthTones.id,
      imageUrl: 'https://example.com/designs/industrial-kitchen.jpg',
      aiPrompt: 'Create an industrial style kitchen with earth tones and rustic elements'
    }
  });

  console.log('✅ Designs seeded');
  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
