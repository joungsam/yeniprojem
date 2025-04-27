import { NextResponse } from 'next/server';

// Basit bir kimlik doğrulama yanıtı
export async function GET() {
  return NextResponse.json({ status: 'success', message: 'Kimlik doğrulama başarılı' });
}

export async function POST() {
  return NextResponse.json({ status: 'success', message: 'Kimlik doğrulama başarılı' });
}
