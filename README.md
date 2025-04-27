# QR Menü Uygulaması

Bu proje, restoranlar için QR kod tabanlı dijital menü sistemi sunan bir [Next.js](https://nextjs.org) uygulamasıdır.

## Özellikler

- Kategori ve ürün yönetimi
- QR kod oluşturma ve yönetimi
- Masa bazlı sipariş takibi
- Ürün etkileşim istatistikleri
- Özelleştirilebilir tema ve görünüm ayarları
- Mobil uyumlu tasarım

## Başlangıç

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin:

1. Repoyu klonlayın:
```bash
git clone https://github.com/kullaniciadi/qrmenu.git
cd qrmenu
```

2. Bağımlılıkları yükleyin:
```bash
npm install
# veya
yarn install
```

3. `.env.example` dosyasını `.env` olarak kopyalayın ve gerekli bilgileri doldurun:
```bash
cp .env.example .env
```

4. Veritabanını oluşturun:
```bash
npx prisma migrate dev
```

5. Geliştirme sunucusunu başlatın:
```bash
npm run dev
# veya
yarn dev
```

6. Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açarak uygulamayı görüntüleyin.

## Veritabanı Şeması

Proje, PostgreSQL veritabanı kullanmaktadır. Veritabanı şeması `prisma/schema.prisma` dosyasında tanımlanmıştır.

## Teknolojiler

- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://www.prisma.io/) - ORM
- [PostgreSQL](https://www.postgresql.org/) - Veritabanı
- [NextAuth.js](https://next-auth.js.org/) - Kimlik doğrulama
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework

## Lisans

Bu proje [MIT lisansı](LICENSE) altında lisanslanmıştır.
