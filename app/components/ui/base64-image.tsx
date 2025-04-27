import Image from 'next/image';
import { useEffect, useState } from 'react';

interface Base64ImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function Base64Image({ src, alt, className = '' }: Base64ImageProps) {
  // Zaman damgası ekleyerek önbelleğe almayı engelle
  const [timestamp, setTimestamp] = useState(Date.now());
  
  // src değiştiğinde zaman damgasını güncelle
  useEffect(() => {
    setTimestamp(Date.now());
  }, [src]);
  
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={`${src}-${timestamp}`} // key özelliği ekleyerek bileşenin yeniden oluşturulmasını sağla
      src={src}
      alt={alt}
      className={className}
    />
  );
}
