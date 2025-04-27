import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    // First clear existing data
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();

    // Create admin user
    const hashedPassword = await bcrypt.hash('123456', 10);
    const admin = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        name: 'Admin',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });

    // Seed categories
    const categories = [
      { name: 'Sıcak İçecekler', icon: '☕', order: 1 },
      { name: 'Soğuk İçecekler', icon: '🥤', order: 2 },
      { name: 'Kahvaltılıklar', icon: '🍳', order: 3 },
      { name: 'Ana Yemekler', icon: '🍽️', order: 4 },
      { name: 'Salatalar', icon: '🥗', order: 5 },
      { name: 'Tatlılar', icon: '🍰', order: 6 },
      { name: 'Atıştırmalıklar', icon: '🥨', order: 7 },
      { name: 'İçecekler', icon: '🥃', order: 8 }
    ];

    const createdCategories = await Promise.all(
      categories.map(category => 
        prisma.category.create({
          data: category
        })
      )
    );

    // Sample products for each category
    const products = [
      // Sıcak İçecekler
      {
        name: 'Türk Kahvesi',
        description: 'Geleneksel Türk kahvesi',
        price: 30,
        image: '/turkish-coffee.jpg',
        categoryId: createdCategories[0].id
      },
      {
        name: 'Filtre Kahve',
        description: 'Taze demlenmiş filtre kahve',
        price: 35,
        image: '/filter-coffee.jpg',
        categoryId: createdCategories[0].id
      },
      // Soğuk İçecekler
      {
        name: 'Limonata',
        description: 'Ev yapımı taze limonata',
        price: 25,
        image: '/lemonade.jpg',
        categoryId: createdCategories[1].id
      },
      // Kahvaltılıklar
      {
        name: 'Serpme Kahvaltı',
        description: 'Zengin kahvaltı tabağı',
        price: 150,
        image: '/breakfast.jpg',
        categoryId: createdCategories[2].id
      },
      // Ana Yemekler
      {
        name: 'Izgara Köfte',
        description: 'Özel baharatlarla hazırlanmış ızgara köfte',
        price: 120,
        image: '/kofte.jpg',
        categoryId: createdCategories[3].id
      },
      // Salatalar
      {
        name: 'Sezar Salata',
        description: 'Izgara tavuk parçaları ile sezar salata',
        price: 85,
        image: '/caesar-salad.jpg',
        categoryId: createdCategories[4].id
      },
      // Tatlılar
      {
        name: 'Künefe',
        description: 'Antep fıstıklı künefe',
        price: 70,
        image: '/kunefe.jpg',
        categoryId: createdCategories[5].id
      },
      // Atıştırmalıklar
      {
        name: 'Patates Kızartması',
        description: 'Çıtır patates kızartması',
        price: 45,
        image: '/fries.jpg',
        categoryId: createdCategories[6].id
      },
      // İçecekler
      {
        name: 'Ayran',
        description: 'Ev yapımı ayran',
        price: 15,
        image: '/ayran.jpg',
        categoryId: createdCategories[7].id
      }
    ];

    // Create products
    await Promise.all(
      products.map(product => 
        prisma.product.create({
          data: product
        })
      )
    );

    return NextResponse.json({ 
      message: 'Veriler başarıyla eklendi',
      admin: admin.email,
      categories: createdCategories.length,
      products: products.length
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Veri eklenirken bir hata oluştu' }, 
      { status: 500 }
    );
  }
}

const categories = [
  { name: 'TÜRK KAHVELERİ', icon: '☕', order: 1 },
  { name: 'ESPRESSOLAR', icon: '☕', order: 2 },
  { name: 'MACCHIATOLAR', icon: '☕', order: 3 },
  { name: 'LATTELER', icon: '🥛', order: 4 },
  { name: 'FİLTRE KAHVELER', icon: '☕', order: 5 },
  { name: 'BİTKİ ÇAYLARI', icon: '🫖', order: 6 },
  { name: 'SICAK TATLAR', icon: '🍫', order: 7 },
  { name: 'SOĞUK ESPRESSOLAR', icon: '🧊', order: 8 },
  { name: 'FRAPPELER', icon: '🥤', order: 9 },
  { name: 'MILKSHAKE', icon: '🥤', order: 10 },
  { name: 'FROZENLER', icon: '🧊', order: 11 },
  { name: 'ALKOLSÜZ KOKTEYLLER', icon: '🍹', order: 12 },
  { name: 'SOĞUK İÇECEKLER', icon: '🥤', order: 13 },
  { name: 'KAHVALTILAR', icon: '🍳', order: 14 },
  { name: 'TOSTLAR VE SANDVİÇLER', icon: '🥪', order: 15 },
  { name: 'MENÜLER', icon: '📋', order: 16 },
  { name: 'CİPSLER', icon: '🍟', order: 17 },
  { name: 'MAKARNALAR', icon: '🍝', order: 18 },
  { name: 'PİZZALAR', icon: '🍕', order: 19 },
  { name: 'SALATALAR', icon: '🥗', order: 20 },
  { name: 'ANA YEMEKLER', icon: '🍖', order: 21 },
  { name: 'TATLILAR', icon: '🍰', order: 22 },
  { name: 'MEYVE TABAĞI', icon: '🍎', order: 23 },
  { name: 'NARGİLE', icon: '💨', order: 24 },
];

const generateProducts = (categoryId: number, categoryName: string) => {
  const products = [];
  const basePrice = Math.floor(Math.random() * 50) + 30; // 30-80 arası baz fiyat

  for (let i = 1; i <= 10; i++) {
    products.push({
      name: `${categoryName} ${i}`,
      description: `${categoryName} için özel hazırlanmış lezzetli ürün ${i}`,
      price: basePrice + (i * 5), // Her ürün için 5 TL artış
      image: '/images/download.png',
      categoryId: categoryId,
      isActive: true,
      order: i
    });
  }
  return products;
};

export async function POST() {
  try {
    // Önce mevcut kategorileri ve ürünleri temizle
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();

    // Kategorileri ekle
    for (const category of categories) {
      const createdCategory = await prisma.category.create({
        data: category
      });

      // Her kategori için 10 ürün ekle
      const products = generateProducts(createdCategory.id, category.name);
      await prisma.product.createMany({
        data: products
      });
    }

    return NextResponse.json({ message: 'Database seeded successfully' });
  } catch (error) {
    console.error('Seeding error:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
} 