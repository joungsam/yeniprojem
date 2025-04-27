import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'logo' veya 'favicon'
    
    if (!file) {
      return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 });
    }
    
    // Dosya uzantısını al
    const fileExtension = file.name.split('.').pop() || '';
    
    // Dosya adını oluştur
    let fileName = '';
    let filePath = '';
    
    if (type === 'logo') {
      fileName = `logo-${uuidv4()}.${fileExtension}`;
      filePath = join(process.cwd(), 'public', 'images', fileName);
    } else if (type === 'favicon') {
      fileName = `favicon-${uuidv4()}.${fileExtension}`;
      filePath = join(process.cwd(), 'public', 'images', fileName);
    } else {
      return NextResponse.json({ error: 'Geçersiz dosya tipi' }, { status: 400 });
    }
    
    // Dosyayı byte array'e dönüştür
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Dosyayı kaydet
    await writeFile(filePath, buffer);
    
    // Dosya URL'sini döndür
    const fileUrl = `/images/${fileName}`;
    
    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error('Dosya yükleme hatası:', error);
    return NextResponse.json({ error: 'Dosya yüklenirken bir hata oluştu' }, { status:500 });
  }
}
