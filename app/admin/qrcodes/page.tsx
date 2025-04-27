'use client';

import { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Select } from "@/app/components/ui/select";
import { Card } from "@/app/components/ui/card";
import { useToast } from "@/app/components/ui/use-toast";
import { useThemeStore } from '@/app/store/themeStore';
import { PlusIcon, PrinterIcon, ArrowDownTrayIcon, QrCodeIcon, TrashIcon, CheckCircleIcon, CheckIcon } from '@heroicons/react/24/outline';
import { renderToStaticMarkup } from 'react-dom/server';

type QRTheme = {
  name: string;
  fg: string;
  bg: string;
  gradient?: string[];
};

type QRThemes = {
  [key: string]: QRTheme;
};

export default function QRCodesPage() {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const { toast } = useToast();
  const qrCodeRef = useRef<HTMLDivElement>(null);
  
  // QR Kod temaları
  const qrThemes: QRThemes = {
    classic: { name: 'Klasik', fg: '#000000', bg: '#FFFFFF' },
    restaurant: { name: 'Restoran', fg: '#8B0000', bg: '#FFFFFF' },
    cafe: { name: 'Kafe', fg: '#5D4037', bg: '#FFFFFF' },
    goldRed: { name: 'Altın-Kırmızı', fg: '#9D2235', bg: '#FFFFFF', gradient: ['#9D2235', '#D4AF37'] },
    modern: { name: 'Modern', fg: '#2C3E50', bg: '#ECF0F1' },
  };
  
  // QR Kod ayarları
  const [qrValue, setQrValue] = useState('https://example.com/menu');
  const [qrSize, setQrSize] = useState(256);
  const [qrFgColor, setQrFgColor] = useState('#9D2235'); // Restoran kırmızısı
  const [qrBgColor, setQrBgColor] = useState('#FFFFFF');
  const [qrIncludeLogo, setQrIncludeLogo] = useState(true);
  const [qrLogoSize, setQrLogoSize] = useState(64);
  const [selectedTheme, setSelectedTheme] = useState('goldRed');
  const [qrFrameSize, setQrFrameSize] = useState(16); // Çerçeve boyutu
  
  // Masa QR kodları
  const [tables, setTables] = useState<{ id: number; name: string; order?: number }[]>([]);
  const [newTableName, setNewTableName] = useState('');
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const [deletingTable, setDeletingTable] = useState<number | null>(null);
  const [allTablesSelected, setAllTablesSelected] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  
  // QR Kod tipi
  const [qrType, setQrType] = useState('menu'); // menu, category, table
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  
  // Toplu şablon ve işlem ayarları
  const [bulkTemplates, setBulkTemplates] = useState([
    { id: 1, name: 'Tüm Masalar', type: 'tables', items: 'all' },
    { id: 2, name: 'Tüm Kategoriler', type: 'categories', items: 'all' },
  ]);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  
  // Sayfa yüklendiğinde kategorileri ve masaları getir
  const [dataFetched, setDataFetched] = useState(false);
  
  useEffect(() => {
    // Sadece ilk render'da veri çek
    if (!dataFetched) {
      const fetchData = async () => {
        try {
          // Kategorileri getir
          const categoriesResponse = await fetch('/api/categories');
          if (!categoriesResponse.ok) throw new Error('Kategoriler yüklenirken bir hata oluştu');
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData.map((cat: any) => ({ id: cat.id, name: cat.name })));
          
          // Masaları getir
          setIsLoadingTables(true);
          const tablesResponse = await fetch('/api/tables');
          if (!tablesResponse.ok) throw new Error('Masalar yüklenirken bir hata oluştu');
          const tablesData = await tablesResponse.json();
          setTables(tablesData.map((table: any) => ({ 
            id: table.id, 
            name: table.name,
            order: table.order
          })));
          
          // Veri çekildiğini işaretle
          setDataFetched(true);
        } catch (error) {
          console.error('Veri yüklenirken hata:', error);
          toast({
            variant: "destructive",
            title: "Hata!",
            description: 'Veriler yüklenemedi'
          });
        } finally {
          setIsLoadingTables(false);
        }
      };
      
      fetchData();
    }
  }, [dataFetched, toast]); // dataFetched ve toast bağımlılıkları
  
  // QR Kod URL'sini oluştur
  const generateQrUrl = () => {
    const baseUrl = window.location.origin;
    
    switch (qrType) {
      case 'menu':
        return `${baseUrl}/`;
      case 'category':
        return `${baseUrl}/category/${selectedCategory}`;
      case 'table':
        const table = tables.find(t => t.id === selectedTable);
        return `${baseUrl}/?table=${selectedTable}&name=${table?.name || 'Masa'}`;
      default:
        return baseUrl;
    }
  };
  
  // Yeni masa ekle
  const addNewTable = async () => {
    const trimmedName = newTableName.trim();
    
    // Masa adı boş mu kontrol et
    if (!trimmedName) {
      toast({
        variant: "destructive",
        title: "Hata!",
        description: "Masa adı boş olamaz"
      });
      return;
    }
    
    // Masa adı çok uzun mu kontrol et
    if (trimmedName.length > 20) {
      toast({
        variant: "destructive",
        title: "Hata!",
        description: "Masa adı en fazla 20 karakter olabilir"
      });
      return;
    }
    
    // Aynı isimde masa var mı kontrol et
    const existingTable = tables.find(table => 
      table.name.toLowerCase() === trimmedName.toLowerCase()
    );
    
    if (existingTable) {
      toast({
        variant: "destructive",
        title: "Hata!",
        description: "Bu isimde bir masa zaten mevcut"
      });
      return;
    }
    
    try {
      // API'ye yeni masa ekle
      const response = await fetch('/api/tables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: trimmedName }),
      });
      
      if (!response.ok) {
        throw new Error('Masa eklenirken bir hata oluştu');
      }
      
      // Yeni masa eklendikten sonra, masaları yeniden sırala
      // ve güncellenmiş masaları doğrudan al
      setNewTableName('');
      await reorderTables();
      
      toast({
        title: "Başarılı!",
        description: "Yeni masa eklendi"
      });
    } catch (error) {
      console.error('Masa eklenirken hata:', error);
      toast({
        variant: "destructive",
        title: "Hata!",
        description: "Masa eklenirken bir hata oluştu"
      });
    }
  };
  
  // Masaları yeniden sırala
  const reorderTables = async () => {
    try {
      const response = await fetch('/api/tables/reorder', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Masalar yeniden sıralanırken bir hata oluştu');
      }
      
      const reorderedTables = await response.json();
      setTables(reorderedTables);
      
      return reorderedTables;
    } catch (error) {
      console.error('Masalar yeniden sıralanırken hata:', error);
      toast({
        variant: "destructive",
        title: "Hata!",
        description: "Masalar yeniden sıralanırken bir hata oluştu"
      });
      return null;
    }
  };
  
  // Masa sil
  const deleteTable = async (id: number) => {
    try {
      setDeletingTable(id);
      
      // API'ye masa silme isteği gönder
      const response = await fetch(`/api/tables/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Masa silinirken bir hata oluştu');
      }
      
      // Masalar listesini güncelle
      setTables(tables.filter(table => table.id !== id));
      
      // Eğer silinen masa seçili ise, seçimi kaldır
      if (selectedTable === id) {
        setSelectedTable(null);
      }
      
      // Masaları yeniden sırala
      await reorderTables();
      
      toast({
        title: "Başarılı!",
        description: "Masa silindi"
      });
    } catch (error) {
      console.error('Masa silinirken hata:', error);
      toast({
        variant: "destructive",
        title: "Hata!",
        description: "Masa silinirken bir hata oluştu"
      });
    } finally {
      setDeletingTable(null);
    }
  };
  
  // Tema değiştiğinde renkleri güncelle
  useEffect(() => {
    if (selectedTheme && qrThemes[selectedTheme]) {
      const theme = qrThemes[selectedTheme];
      setQrFgColor(theme.fg);
      setQrBgColor(theme.bg);
    }
  }, [selectedTheme]);
  
  // QR Kod URL'sini güncelle
  useEffect(() => {
    setQrValue(generateQrUrl());
  }, [qrType, selectedCategory, selectedTable, tables, categories]);
  
  // QR Kodu PNG olarak indir
  const downloadQrAsPng = () => {
    if (!qrCodeRef.current) return;
    
    try {
      const canvas = document.createElement('canvas');
      const svg = qrCodeRef.current.querySelector('svg');
      
      if (!svg) {
        throw new Error('SVG element bulunamadı');
      }
      
      const svgData = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      
      img.onload = () => {
        canvas.width = qrSize + qrFrameSize * 2;
        canvas.height = qrSize + qrFrameSize * 2;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // Arka planı çiz
        ctx.fillStyle = qrBgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // QR kodu canvas'ın ortasına çiz
        const qrX = (canvas.width - qrSize) / 2;
        const qrY = (canvas.height - qrSize) / 2;
        ctx.drawImage(img, qrX, qrY, qrSize, qrSize);
        
        // Eğer logo eklenecekse
        if (qrIncludeLogo) {
          const logoImg = new Image();
          logoImg.onload = () => {
            // Logo'yu QR kodun ortasına çiz
            const centerX = (canvas.width - qrLogoSize) / 2;
            const centerY = (canvas.height - qrLogoSize) / 2;
            
            // Logo için beyaz arka plan çiz
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(centerX - 4, centerY - 4, qrLogoSize + 8, qrLogoSize + 8);
            
            // Logo'yu çiz
            ctx.drawImage(logoImg, centerX, centerY, qrLogoSize, qrLogoSize);
            
            // PNG olarak indir
            finalizePngDownload(canvas);
          };
          
          // Logo dosyasının tam yolunu kullan
          const logoPath = window.location.origin + '/logo.png';
          logoImg.src = logoPath;
          
          // Logo yükleme hatası durumunda
          logoImg.onerror = () => {
            console.error('Logo yüklenemedi:', logoPath);
            // Logo olmadan devam et
            finalizePngDownload(canvas);
          };
        } else {
          // Logo yoksa doğrudan indir
          finalizePngDownload(canvas);
        }
      };
      
      img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
    } catch (error) {
      console.error('QR kod indirme hatası:', error);
      toast({
        variant: "destructive",
        title: "Hata!",
        description: 'QR kod indirilemedi'
      });
    }
  };
  
  // PNG indirme işlemini tamamla
  const finalizePngDownload = (canvas: HTMLCanvasElement) => {
    const pngFile = canvas.toDataURL('image/png', 0.8);
    const downloadLink = document.createElement('a');
    
    let fileName = 'qr-code';
    if (qrType === 'category') {
      const category = categories.find(c => c.id.toString() === selectedCategory);
      fileName = `qr-category-${category?.name || selectedCategory}`;
    } else if (qrType === 'table') {
      const table = tables.find(t => t.id === selectedTable);
      fileName = `qr-table-${table?.name || selectedTable}`;
    }
    
    downloadLink.download = `${fileName}.png`;
    downloadLink.href = pngFile;
    downloadLink.click();
    
    toast({
      title: "Başarılı!",
      description: "QR kod PNG olarak indirildi",
    });
  };
  
  // QR Kodu SVG olarak indir (logo base64 gömülü)
  const downloadQrAsSvg = async () => {
    if (!qrCodeRef.current) return;

    try {
      const svg = qrCodeRef.current.querySelector('svg');
      if (!svg) {
        throw new Error('SVG element bulunamadı');
      }

      let svgData = new XMLSerializer().serializeToString(svg);

      // Eğer logo ekleniyorsa, logo.png'yi base64 olarak göm
      if (qrIncludeLogo) {
        // SVG içindeki <image ... src="/logo.png" ... /> veya benzeri etiketi bul
        const logoUrl = window.location.origin + '/logo.png';
        const response = await fetch(logoUrl);
        const blob = await response.blob();
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
        });
        reader.readAsDataURL(blob);
        const base64Logo = await base64Promise;
        // src veya xlink:href'yi base64 ile değiştir
        svgData = svgData.replace(/(xlink:href|href)=("|')([^"']*logo\.png)("|')/g, `$1="$3"`);
        svgData = svgData.replace(/(xlink:href|href)=("|')[^"']*logo\.png("|')/g, `$1=\"${base64Logo}\"`);
        svgData = svgData.replace(/src=("|')[^"']*logo\.png("|')/g, `xlink:href=\"${base64Logo}\"`);
      }

      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);

      let fileName = 'qr-code';
      if (qrType === 'category') {
        const category = categories.find(c => c.id.toString() === selectedCategory);
        fileName = `qr-category-${category?.name || selectedCategory}`;
      } else if (qrType === 'table') {
        const table = tables.find(t => t.id === selectedTable);
        fileName = `qr-table-${table?.name || selectedTable}`;
      }

      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = `${fileName}.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      URL.revokeObjectURL(url);

      toast({
        title: "Başarılı!",
        description: "QR kod SVG olarak indirildi (logo gömülü)",
      });
    } catch (error) {
      console.error('QR kod SVG indirme hatası:', error);
      toast({
        variant: "destructive",
        title: "Hata!",
        description: 'QR kod SVG olarak indirilemedi'
      });
    }
  };
  
  // QR Kodu yazdır
  const printQrCode = () => {
    if (!qrCodeRef.current) return;
    
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Yazdırma penceresi açılamadı');
      }
      
      const svg = qrCodeRef.current.querySelector('svg');
      if (!svg) {
        throw new Error('SVG element bulunamadı');
      }
      
      const svgData = new XMLSerializer().serializeToString(svg);
      
      let title = '';
      if (qrType === 'category') {
        const category = categories.find(c => c.id.toString() === selectedCategory);
        title = String(category?.name || selectedCategory);
      } else if (qrType === 'table') {
        const table = tables.find(t => t.id === selectedTable);
        title = String(table?.name || selectedTable);
      } else {
        title = 'QR Menü';
      }
      
      // HTML içeriğini oluştur
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>QR Kod Yazdır</title>
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
          <script src="https://cdn.rawgit.com/davidshimjs/qrcodejs/gh-pages/qrcode.min.js"></script>
          <style>
            :root {
              --primary-color: ${qrFgColor};
              --background-color: ${qrBgColor};
              --border-color: #e0e0e0;
              --text-color: #333;
              --secondary-text-color: #666;
              --accent-color: #f8f9fa;
              --shadow-color: rgba(0, 0, 0, 0.1);
            }
            
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            
            body {
              font-family: 'Poppins', Arial, sans-serif;
              line-height: 1.6;
              color: var(--text-color);
              background-color: #f8f9fa;
              padding: 0;
              margin: 0;
            }
            
            .container {
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            
            .header {
              text-align: center;
              padding: 20px 0;
              margin-bottom: 30px;
              border-bottom: 1px solid var(--border-color);
              background-color: white;
              box-shadow: 0 2px 4px var(--shadow-color);
            }
            
            .print-title {
              font-size: 28px;
              font-weight: 600;
              color: var(--primary-color);
              margin-bottom: 10px;
            }
            
            .print-subtitle {
              font-size: 16px;
              color: var(--secondary-text-color);
              margin-bottom: 20px;
            }
            
            .qr-section {
              margin-bottom: 40px;
              background-color: white;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 8px var(--shadow-color);
              padding: 30px;
              text-align: center;
            }
            
            .qr-container {
              margin: 20px auto;
              width: ${qrSize + qrFrameSize * 2}px;
              height: ${qrSize + qrFrameSize * 2}px;
              padding: ${qrFrameSize}px;
              background-color: var(--background-color);
              position: relative;
              display: inline-block;
              border-radius: 8px;
              box-shadow: 0 2px 5px var(--shadow-color);
            }
            
            .logo {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: ${qrLogoSize}px;
              height: ${qrLogoSize}px;
              background: white;
              padding: 4px;
              border-radius: 4px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
              z-index: 10;
            }
            
            .print-info {
              margin-top: 30px;
              padding: 15px;
              font-size: 14px;
              color: var(--secondary-text-color);
              text-align: center;
              background-color: var(--accent-color);
              border-radius: 8px;
              border: 1px solid var(--border-color);
            }
            
            .control-panel {
              position: static;
              padding: 15px;
              background-color: white;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
              margin-bottom: 20px;
              display: flex;
              justify-content: center;
              gap: 10px;
              border-radius: 8px;
            }
            
            .btn {
              padding: 10px 20px;
              font-size: 16px;
              font-weight: 500;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              transition: background-color 0.2s, transform 0.1s;
            }
            
            .btn-primary {
              background-color: var(--primary-color);
              color: white;
            }
            
            .btn-primary:hover {
              background-color: var(--primary-color);
              opacity: 0.9;
            }
            
            .btn-secondary {
              background-color: #f1f1f1;
              color: #333;
            }
            
            .btn-secondary:hover {
              background-color: #e0e0e0;
            }
            
            .btn:active {
              transform: translateY(1px);
            }
            
            .footer {
              text-align: center;
              padding: 20px;
              margin-top: 40px;
              border-top: 1px solid var(--border-color);
              color: var(--secondary-text-color);
              font-size: 14px;
            }
            
            @media print {
              .no-print {
                display: none !important;
              }
              
              body {
                background-color: white;
              }
              
              .container {
                width: 100%;
                max-width: none;
                padding: 0;
              }
              
              .header {
                box-shadow: none;
                margin-bottom: 20px;
                padding: 15px 0;
              }
              
              .qr-section {
                box-shadow: none;
                margin-bottom: 30px;
                break-inside: avoid;
              }
              
              .qr-container {
                box-shadow: none;
              }
              
              .logo {
                box-shadow: none;
              }
              
              .print-info {
                border: 1px solid #ddd;
                background-color: #f9f9f9 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              
              .footer {
                margin-top: 20px;
                padding: 10px 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="control-panel no-print">
            <button onclick="window.print()" class="btn btn-primary">Yazdır</button>
            <button onclick="window.close()" class="btn btn-secondary">Kapat</button>
          </div>
          
          <div class="container">
            <div class="header">
              <h1 class="print-title">${title}</h1>
              <p class="print-subtitle">Bu QR kodu tarayarak menüye ulaşabilirsiniz.</p>
            </div>
            
            <div class="qr-section">
              <div class="qr-container">
                ${svgData}
              </div>
              
              <div class="print-info">
                QR kodu okutarak menüye ulaşabilirsiniz.
              </div>
            </div>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} QR Menü Sistemi - Tüm hakları saklıdır.</p>
            </div>
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            }
          </script>
        </body>
        </html>
      `;
      
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } catch (error) {
      console.error('QR kod yazdırma hatası:', error);
      toast({
        variant: "destructive",
        title: "Hata!",
        description: "QR kod yazdırılamadı"
      });
    }
  };
  
  // Toplu QR kod oluştur
  const generateBulkQRCodes = () => {
    if (!selectedTemplate) {
      toast({
        variant: "destructive",
        title: "Hata!",
        description: "Lütfen bir şablon seçin"
      });
      return;
    }
    
    const template = bulkTemplates.find(t => t.id === selectedTemplate);
    if (!template) return;
    
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Yazdırma penceresi açılamadı');
      }
      
      let items: { id: number | string, name: string }[] = [];
      
      // Şablona göre öğeleri belirle
      if (template.type === 'tables') {
        items = tables;
      } else if (template.type === 'categories') {
        items = categories;
      }
      
      // Her QR kodun SVG'sini oluştur
      const getQrSvgString = (value: string) => {
        return renderToStaticMarkup(
          <QRCodeSVG
            value={value}
            size={qrSize}
            fgColor={qrFgColor}
            bgColor={qrBgColor}
            level="H"
            imageSettings={qrIncludeLogo ? {
              src: window.location.origin + '/logo.png',
              height: qrLogoSize,
              width: qrLogoSize,
              excavate: true,
            } : undefined}
          />
        );
      };
      
      // HTML içeriğini oluştur
      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Toplu QR Kodlar</title>
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
          <style>
            :root {
              --primary-color: ${qrFgColor};
              --background-color: ${qrBgColor};
              --border-color: #e0e0e0;
              --text-color: #333;
              --secondary-text-color: #666;
              --accent-color: #f8f9fa;
              --shadow-color: rgba(0, 0, 0, 0.1);
            }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Poppins', Arial, sans-serif; line-height: 1.6; color: var(--text-color); background-color: #f8f9fa; padding: 0; margin: 0; }
            .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; margin-bottom: 30px; border-bottom: 1px solid var(--border-color); background-color: white; box-shadow: 0 2px 4px var(--shadow-color); }
            .print-title { font-size: 28px; font-weight: 600; color: var(--primary-color); margin-bottom: 10px; }
            .print-subtitle { font-size: 16px; color: var(--secondary-text-color); margin-bottom: 20px; }
            .qr-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(${qrSize + qrFrameSize * 2 + 40}px, 1fr)); gap: 20px; margin-bottom: 40px; }
            .qr-item { background-color: white; border-radius: 8px; overflow: visible; box-shadow: 0 2px 8px var(--shadow-color); padding: 20px; text-align: center; page-break-inside: avoid; }
            .qr-item-title { font-size: 18px; font-weight: 600; color: var(--primary-color); margin-bottom: 10px; }
            .qr-container { margin: 10px auto; width: ${qrSize + qrFrameSize * 2}px; height: ${qrSize + qrFrameSize * 2}px; padding: ${qrFrameSize}px; background-color: var(--background-color); position: relative; display: inline-block; border-radius: 8px; box-shadow: 0 2px 5px var(--shadow-color); box-sizing: content-box; overflow: visible; }
            .print-info { margin-top: 10px; font-size: 12px; color: var(--secondary-text-color); text-align: center; }
            .control-panel { position: static; padding: 15px; background-color: white; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); margin-bottom: 20px; display: flex; justify-content: center; gap: 10px; border-radius: 8px; }
            .btn { padding: 10px 20px; font-size: 16px; font-weight: 500; border: none; border-radius: 4px; cursor: pointer; transition: background-color 0.2s, transform 0.1s; }
            .btn-primary { background-color: var(--primary-color); color: white; }
            .btn-primary:hover { background-color: var(--primary-color); opacity: 0.9; }
            .btn-secondary { background-color: #f1f1f1; color: #333; }
            .btn-secondary:hover { background-color: #e0e0e0; }
            .btn:active { transform: translateY(1px); }
            .footer { text-align: center; padding: 20px; margin-top: 40px; border-top: 1px solid var(--border-color); color: var(--secondary-text-color); font-size: 14px; }
            @media print { .no-print { display: none !important; } body { background-color: white; } .container { width: 100%; max-width: none; padding: 0; } .header { box-shadow: none; margin-bottom: 20px; padding: 15px 0; } .qr-grid { display: grid; grid-template-columns: repeat(2, 1fr); } .qr-item { box-shadow: none; border: 1px solid #ddd; margin-bottom: 20px; } .qr-container { box-shadow: none; } .footer { margin-top: 20px; padding: 10px 0; } }
          </style>
        </head>
        <body>
          <div class="control-panel no-print">
            <button onclick="window.print()" class="btn btn-primary">Yazdır</button>
            <button onclick="window.close()" class="btn btn-secondary">Kapat</button>
          </div>
          <div class="container">
            <div class="header">
              <h1 class="print-title">Toplu QR Kodlar</h1>
              <p class="print-subtitle">${template.name}</p>
            </div>
            <div class="qr-grid">
      `;
      // Her QR kodu için HTML içeriğini ekle
      items.forEach(item => {
        let qrUrl = '';
        if (template.type === 'tables') {
          qrUrl = window.location.origin + '/?table=' + item.id + '&name=' + item.name;
        } else if (template.type === 'categories') {
          qrUrl = window.location.origin + '/category/' + item.id;
        }
        htmlContent += `
          <div class="qr-item">
            <h3 class="qr-item-title">${item.name}</h3>
            <div class="qr-container">
              ${getQrSvgString(qrUrl)}
            </div>
            <div class="print-info">
              QR kodu okutarak menüye ulaşabilirsiniz.
            </div>
          </div>
        `;
      });
      // Footer kısmını ekle
      const currentYear = new Date().getFullYear();
      htmlContent += `
            </div>
            <div class="footer">
              <p>© ${currentYear} QR Menü Sistemi - Tüm hakları saklıdır.</p>
            </div>
          </div>
        </body>
        </html>
      `;
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } catch (error) {
      console.error('Toplu QR kod oluşturma hatası:', error);
      toast({
        variant: "destructive",
        title: "Hata!",
        description: "Toplu QR kodlar oluşturulamadı"
      });
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">QR Kod Yönetimi</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sol Panel - QR Kod Ayarları */}
        <div className="md:col-span-1">
          <Card className="p-4">
            <h2 className="text-xl font-semibold mb-4">QR Kod Ayarları</h2>
            
            <div className="space-y-4">
              {/* QR Kod Tipi */}
              <div>
                <Label htmlFor="qrType">QR Kod Tipi</Label>
                <Select 
                  id="qrType" 
                  value={qrType} 
                  onChange={(e) => setQrType(e.target.value)}
                  className={isDark ? 'bg-gray-800 border-gray-700 text-gray-200' : ''}
                >
                  <option value="menu">Tüm Menü</option>
                  <option value="category">Kategori</option>
                  <option value="table">Masa</option>
                </Select>
              </div>
              
              {/* Kategori Seçimi */}
              {qrType === 'category' && (
                <div>
                  <Label htmlFor="category">Kategori</Label>
                    <Select 
                      id="category" 
                      value={selectedCategory} 
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className={isDark ? 'bg-gray-800 border-gray-700 text-gray-200' : ''}
                    >
                    <option value="">Kategori Seçin</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                </div>
              )}
              
              {/* Masa Seçimi */}
              {qrType === 'table' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-end gap-2 mb-3">
                      <div className="flex-1">
                        <Input 
                          id="newTable" 
                          value={newTableName} 
                          onChange={(e) => setNewTableName(e.target.value)}
                          placeholder="Yeni masa adı"
                          className={isDark ? 'bg-gray-800 border-gray-700 text-gray-200' : ''}
                        />
                      </div>
                      <Button 
                        onClick={addNewTable} 
                        size="sm"
                        className={isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : ''}
                      >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Ekle
                      </Button>
                    </div>
                    
                    <div className={`border rounded-md p-3 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium flex items-center">
                          <span>Mevcut Masalar</span>
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                            {tables.length} masa
                          </span>
                        </h4>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant={allTablesSelected ? "default" : "outline"}
                            size="sm" 
                            className={`h-7 w-7 p-0 ${allTablesSelected ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
                            onClick={() => {
                              // Tüm masaları seç
                              if (tables.length > 0) {
                                // Tüm masaları seçili olarak işaretle
                                const newSelectedState = !allTablesSelected;
                                setAllTablesSelected(newSelectedState);
                                
                                // Eğer seçim kaldırılıyorsa, seçili masayı da kaldır
                                if (!newSelectedState) {
                                  setSelectedTable(null);
                                } else {
                                  // İlk masayı seç (QR kod için)
                                  setSelectedTable(tables[0].id);
                                }
                                
                                // Tüm masaları seçtiğimizi kullanıcıya bildir
                                toast({
                                  title: "Bilgi",
                                  description: `Tüm masalar ${newSelectedState ? 'seçildi' : 'seçimi kaldırıldı'} (${tables.length} masa)`
                                });
                              }
                            }}
                            disabled={tables.length === 0}
                            title={allTablesSelected ? 'Seçimi Kaldır' : 'Tümünü Seç'}
                          >
                            {allTablesSelected ? (
                              <CheckCircleIcon className="h-4 w-4" />
                            ) : (
                              <CheckIcon className="h-4 w-4" />
                            )}
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="h-7 w-7 p-0"
                            onClick={async () => {
                              // Tüm masaları sil
                              if (tables.length > 0) {
                                // Silme işlemi başladı
                                setIsDeletingAll(true);
                                
                                try {
                                  // Tüm masaları sil
                                  for (const table of tables) {
                                    await deleteTable(table.id);
                                  }
                                  
                                  // Tüm masaları seçimini kaldır
                                  setAllTablesSelected(false);
                                  
                                  toast({
                                    title: "Başarılı!",
                                    description: `${tables.length} masa başarıyla silindi`
                                  });
                                } catch (error) {
                                  console.error('Toplu silme hatası:', error);
                                  toast({
                                    variant: "destructive",
                                    title: "Hata!",
                                    description: "Masalar silinirken bir hata oluştu"
                                  });
                                } finally {
                                  // Silme işlemi bitti
                                  setIsDeletingAll(false);
                                }
                              }
                            }}
                            disabled={tables.length === 0 || isDeletingAll}
                            title="Tüm Masaları Sil"
                          >
                            {isDeletingAll ? (
                              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <TrashIcon className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      {tables.length === 0 ? (
                        <div className={`text-center py-6 rounded-md border border-dashed ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white'}`}>
                          <p className={`text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Henüz masa eklenmemiş</p>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>Yeni masa eklemek için aşağıdaki formu kullanın</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-1">
                          {tables.map((table) => (
                            <div 
                              key={table.id} 
                              className={`rounded-md border p-2 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow ${
                                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'
                              }`}
                            >
                              <div className="flex items-center flex-grow min-w-0 mr-2">
                                <div className={`h-8 w-8 flex-shrink-0 rounded-full flex items-center justify-center mr-2 font-semibold ${
                                  isDark ? 'bg-blue-900 text-blue-100' : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {table.order || table.id}
                                </div>
                                <div className="min-w-0 overflow-hidden">
                                  <div className={`font-medium truncate ${isDark ? 'text-gray-100' : ''}`}>{table.name}</div>
                                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Masa #{table.order || table.id}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <Button 
                                  variant="destructive" 
                                  size="sm" 
                                  className="h-7 w-7 p-0"
                                  onClick={() => deleteTable(table.id)}
                                  disabled={deletingTable === table.id}
                                  title="Sil"
                                >
                                  {deletingTable === table.id ? (
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                  ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  )}
                                </Button>
                                <Button 
                                  variant="outline"
                                  size="sm" 
                                  className={`h-7 w-7 p-0 ${selectedTable === table.id || allTablesSelected ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
                                  onClick={() => setSelectedTable(table.id)}
                                  title={selectedTable === table.id || allTablesSelected ? 'Seçildi' : 'Seç'}
                                >
                                  {selectedTable === table.id || allTablesSelected ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* QR Kod Teması */}
              <div>
                <Label htmlFor="theme">Tema</Label>
                <Select 
                  id="theme" 
                  value={selectedTheme} 
                  onChange={(e) => setSelectedTheme(e.target.value)}
                  className={isDark ? 'bg-gray-800 border-gray-700 text-gray-200' : ''}
                >
                  {Object.entries(qrThemes).map(([key, theme]) => (
                    <option key={key} value={key}>
                      {theme.name}
                    </option>
                  ))}
                </Select>
              </div>
              
              {/* QR Kod Boyutu */}
              <div>
                <Label htmlFor="size">Boyut</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    id="size" 
                    type="range" 
                    min="128" 
                    max="512" 
                    step="8" 
                    value={qrSize} 
                    onChange={(e) => setQrSize(parseInt(e.target.value))}
                    className={isDark ? 'bg-gray-700' : ''}
                  />
                  <span className="text-sm">{qrSize}px</span>
                </div>
              </div>
              
              {/* QR Kod Renkleri */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="fgColor">Ön Plan Rengi</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      id="fgColor" 
                      type="color" 
                      value={qrFgColor} 
                      onChange={(e) => setQrFgColor(e.target.value)}
                      className="w-12 h-8 p-0"
                    />
                    <Input 
                      type="text" 
                      value={qrFgColor} 
                      onChange={(e) => setQrFgColor(e.target.value)}
                      className={`flex-1 ${isDark ? 'bg-gray-800 border-gray-700 text-gray-200' : ''}`}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="bgColor">Arka Plan Rengi</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      id="bgColor" 
                      type="color" 
                      value={qrBgColor} 
                      onChange={(e) => setQrBgColor(e.target.value)}
                      className="w-12 h-8 p-0"
                    />
                    <Input 
                      type="text" 
                      value={qrBgColor} 
                      onChange={(e) => setQrBgColor(e.target.value)}
                      className={`flex-1 ${isDark ? 'bg-gray-800 border-gray-700 text-gray-200' : ''}`}
                    />
                  </div>
                </div>
              </div>
              
              {/* Logo Ayarları */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input 
                    id="includeLogo" 
                    type="checkbox" 
                    checked={qrIncludeLogo} 
                    onChange={(e) => setQrIncludeLogo(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="includeLogo">Logo Ekle</Label>
                </div>
                
                {qrIncludeLogo && (
                  <div>
                    <Label htmlFor="logoSize">Logo Boyutu</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        id="logoSize" 
                        type="range" 
                        min="32" 
                        max="128" 
                        step="4" 
                        value={qrLogoSize} 
                        onChange={(e) => setQrLogoSize(parseInt(e.target.value))}
                        className={isDark ? 'bg-gray-700' : ''}
                      />
                      <span className="text-sm">{qrLogoSize}px</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Çerçeve Boyutu */}
              <div>
                <Label htmlFor="frameSize">Çerçeve Boyutu</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    id="frameSize" 
                    type="range" 
                    min="0" 
                    max="64" 
                    step="4" 
                    value={qrFrameSize} 
                    onChange={(e) => setQrFrameSize(parseInt(e.target.value))}
                    className={isDark ? 'bg-gray-700' : ''}
                  />
                  <span className="text-sm">{qrFrameSize}px</span>
                </div>
              </div>
              
              {/* Toplu QR Kod Oluşturma */}
              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold mb-2">Toplu QR Kod Oluşturma</h3>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="template">Şablon</Label>
                    <Select 
                      id="template" 
                      value={selectedTemplate?.toString() || ''} 
                      onChange={(e) => setSelectedTemplate(e.target.value ? parseInt(e.target.value) : null)}
                      className={isDark ? 'bg-gray-800 border-gray-700 text-gray-200' : ''}
                    >
                      <option value="">Şablon Seçin</option>
                      {bulkTemplates.map((template) => {
                        // Şablona göre toplam QR kod sayısını hesapla
                        let itemCount = 0;
                        if (template.type === 'tables') {
                          itemCount = tables.length;
                        } else if (template.type === 'categories') {
                          itemCount = categories.length;
                        }
                        
                        return (
                          <option key={template.id} value={template.id}>
                            {template.name} ({itemCount} adet)
                          </option>
                        );
                      })}
                    </Select>
                  </div>
                  
                  <Button 
                    onClick={generateBulkQRCodes} 
                    className={`w-full ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : ''}`} 
                    disabled={!selectedTemplate}
                  >
                    <QrCodeIcon className="h-5 w-5 mr-2" />
                    Toplu QR Kod Oluştur
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Sağ Panel - QR Kod Önizleme ve İşlemler */}
        <div className="md:col-span-2">
          <Card className="p-4">
            <h2 className="text-xl font-semibold mb-4">QR Kod Önizleme</h2>
            
            <div className="flex flex-col items-center justify-center">
              {/* QR Kod Önizleme */}
              <div 
                ref={qrCodeRef} 
                className={`p-4 rounded-lg shadow-md mb-6 ${isDark ? 'shadow-gray-900' : 'shadow-gray-200'}`}
                style={{ 
                  padding: `${qrFrameSize}px`, 
                  backgroundColor: qrBgColor,
                  position: 'relative',
                  display: 'inline-block'
                }}
              >
                <QRCodeSVG 
                  value={qrValue} 
                  size={qrSize} 
                  fgColor={qrFgColor} 
                  bgColor={qrBgColor}
                  level="H" // Yüksek hata düzeltme seviyesi
                  imageSettings={qrIncludeLogo ? {
                    src: "/logo.png",
                    x: undefined,
                    y: undefined,
                    height: qrLogoSize,
                    width: qrLogoSize,
                    excavate: true,
                  } : undefined}
                />
              </div>
              
              {/* QR Kod URL'i */}
              <div className="w-full mb-6">
                <Label htmlFor="qrUrl">QR Kod URL'i</Label>
                <Input 
                  id="qrUrl" 
                  value={qrValue} 
                  readOnly 
                  className={`font-mono text-sm ${isDark ? 'bg-gray-800 border-gray-700 text-gray-200' : ''}`}
                />
              </div>
              
              {/* İşlem Butonları */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                <Button 
                  onClick={downloadQrAsPng} 
                  variant="outline" 
                  className={`flex items-center justify-center ${isDark ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700' : ''}`}
                >
                  <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                  PNG İndir
                </Button>
                
                <Button 
                  onClick={downloadQrAsSvg} 
                  variant="outline" 
                  className={`flex items-center justify-center ${isDark ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700' : ''}`}
                >
                  <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                  SVG İndir (Logo ile)
                </Button>
                
                <Button 
                  onClick={printQrCode} 
                  variant="outline" 
                  className={`flex items-center justify-center ${isDark ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700' : ''}`}
                >
                  <PrinterIcon className="h-5 w-5 mr-2" />
                  Yazdır
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
