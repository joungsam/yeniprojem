@echo off
echo GitHub'a yükleme öncesi temizlik başlatılıyor...

echo .env dosyası siliniyor...
del .env

echo .bak uzantılı dosyalar siliniyor...
del /s *.bak

echo Gereksiz yapılandırma dosyaları siliniyor...
del next.config.js

echo Seed dosyaları siliniyor...
del table-seed.sql

echo Script klasörü siliniyor...
rmdir /s /q scripts

echo Temizlik tamamlandı!
echo NOT: Bu işlem geri alınamaz. Silinen dosyaların yedeğini aldığınızdan emin olun.
pause