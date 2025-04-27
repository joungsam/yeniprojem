'use client';

import { useState, useEffect } from 'react'; // Add useEffect import
// Remove Prisma import entirely
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Base64Image } from './ui/base64-image';
import { HandThumbUpIcon, HandThumbDownIcon } from '@heroicons/react/24/outline'; // Outline icons initially
import { HandThumbUpIcon as HandThumbUpIconSolid, HandThumbDownIcon as HandThumbDownIconSolid } from '@heroicons/react/24/solid'; // Solid icons for selected state
import { useToast } from "@/app/components/ui/use-toast"; // Assuming you have a toast component


// Manually define the expected Product structure based on API response
interface ProductWithCategory {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  image?: string | null;
  categoryId: number | null; // Assuming categoryId might be null
  order: number;
  // Add other fields if needed from the API response
  category?: {
    name: string;
  } | null;
}

interface ProductPreviewModalProps {
  product: ProductWithCategory | null; // Use updated type
  isOpen: boolean;
  onClose: () => void;
}

export function ProductPreviewModal({ product, isOpen, onClose }: ProductPreviewModalProps) {
  const [interactionLoading, setInteractionLoading] = useState(false);
  // userInteraction state now reflects the stored interaction for this product
  const [userInteraction, setUserInteraction] = useState<'LIKE' | 'DISLIKE' | null>(null);
  const { toast } = useToast();
  const storageKey = `productInteraction_${product?.id}`; // Unique key for localStorage

  // Load interaction status from localStorage when modal opens or product changes
  useEffect(() => {
    if (product && isOpen) {
      const storedInteraction = localStorage.getItem(storageKey) as 'LIKE' | 'DISLIKE' | null;
      setUserInteraction(storedInteraction);
    }
    // Reset interaction state when modal closes or product changes
    if (!isOpen) {
       setUserInteraction(null);
    }
  }, [product, isOpen, storageKey]);


  const handleInteraction = async (interactionType: 'LIKE' | 'DISLIKE') => {
    // Prevent interaction if already interacted in this session/device
    if (!product || interactionLoading || userInteraction) {
        if (userInteraction) {
             toast({
                title: "Zaten Oy Verildi",
                description: "Bu ürün için zaten bir tercih belirttiniz.",
                variant: "default",
             });
        }
        return;
    }


    setInteractionLoading(true);
    // No need for previousInteraction with localStorage approach for simple lock

    try {
      const response = await fetch('/api/products/interact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, interactionType }),
      });

      if (!response.ok) {
        throw new Error('Interaction failed');
      }

      // Save interaction to localStorage on success
      localStorage.setItem(storageKey, interactionType);
      // Update state to reflect the successful interaction
      setUserInteraction(interactionType);

      toast({
        title: interactionType === 'LIKE' ? "Beğenildi!" : "Beğenilmedi",
        description: `${product.name} için tercihiniz kaydedildi.`,
        variant: "default",
      });

    } catch (error) {
      console.error('Interaction error:', error);
      // No state reversal needed as we check localStorage first now
      toast({
        title: "Hata!",
        description: "İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setInteractionLoading(false);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="w-[calc(100%-32px)] max-w-[400px] p-0 bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-xl border border-gray-100 dark:border-gray-800"
      >
        {/* Custom animation styles */}
        <style jsx global>{`
          @keyframes fade-in {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }
          @keyframes slide-up {
            0% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.4s ease forwards;
            opacity: 0;
          }
          .animate-slide-up {
            animation: slide-up 0.4s ease forwards;
            opacity: 0;
          }
          .delay-1 { animation-delay: 0.1s; }
          .delay-2 { animation-delay: 0.2s; }
          .delay-3 { animation-delay: 0.3s; }
        `}</style>
        
        {/* Image */}
        {product.image && (
          <div className="relative w-full h-44 animate-fade-in">
            <Base64Image
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            
            {/* Price Badge */}
            <div className="absolute bottom-2 right-2 bg-primary dark:bg-orange-500 text-white px-2 py-1 rounded-md text-sm font-bold shadow-md animate-fade-in delay-1">
              ₺{product.price.toFixed(2)}
            </div>
          </div>
        )}
        
        <div className="p-4">
          <div className="mb-3 animate-slide-up">
            {/* Title - Left aligned */}
            <DialogTitle className="text-lg font-bold text-primary dark:text-orange-400 text-left">
              {product.name}
            </DialogTitle>
          </div>
          
          <div className="py-3 space-y-4">
            {/* Description */}
            {product.description && (
              <div className="animate-fade-in delay-1">
                <h3 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium mb-1">
                  Ürün Detayları
                </h3>
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  {product.description}
                </p>
              </div>
            )}
            
            {/* Category Badge - Now above ratings */}
            {product.category?.name && (
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 animate-fade-in delay-1 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary dark:bg-orange-400 mr-1.5"></span>
                {product.category.name}
              </div>
            )}
            
            {/* Interaction Buttons */}
            <div className="animate-fade-in delay-2">
              <h3 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium mb-2">
                Değerlendirmeniz
              </h3>
              
              <div className="flex space-x-2">
                {/* Like Button */}
                <Button
                  variant="outline"
                  onClick={() => handleInteraction('LIKE')}
                  disabled={interactionLoading || !!userInteraction}
                  className={`flex-1 py-1.5 transition-all duration-200 ${
                    userInteraction === 'LIKE'
                      ? 'border-green-500 text-green-600 bg-green-50 dark:bg-green-900/30 dark:border-green-600 dark:text-green-400'
                      : 'border-gray-200 dark:border-gray-700 hover:border-green-400 hover:text-green-600 dark:hover:text-green-400'
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                  aria-label="Beğen"
                >
                  <div className="flex items-center justify-center space-x-1">
                    {userInteraction === 'LIKE' ? 
                      <HandThumbUpIconSolid className="h-3.5 w-3.5" /> : 
                      <HandThumbUpIcon className="h-3.5 w-3.5" />
                    }
                    <span className="text-xs font-medium">Beğendim</span>
                  </div>
                </Button>
                
                {/* Dislike Button */}
                <Button
                  variant="outline"
                  onClick={() => handleInteraction('DISLIKE')}
                  disabled={interactionLoading || !!userInteraction}
                  className={`flex-1 py-1.5 transition-all duration-200 ${
                    userInteraction === 'DISLIKE'
                      ? 'border-red-500 text-red-600 bg-red-50 dark:bg-red-900/30 dark:border-red-600 dark:text-red-400'
                      : 'border-gray-200 dark:border-gray-700 hover:border-red-400 hover:text-red-600 dark:hover:text-red-400'
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                  aria-label="Beğenme"
                >
                  <div className="flex items-center justify-center space-x-1">
                    {userInteraction === 'DISLIKE' ? 
                      <HandThumbDownIconSolid className="h-3.5 w-3.5" /> : 
                      <HandThumbDownIcon className="h-3.5 w-3.5" />
                    }
                    <span className="text-xs font-medium">Beğenmedim</span>
                  </div>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <DialogFooter className="pt-2 border-t border-gray-200 dark:border-gray-700 animate-fade-in delay-3">
            <Button 
              onClick={onClose}
              className="w-full bg-primary hover:bg-primary/90 dark:bg-orange-500 dark:hover:bg-orange-600 text-white text-sm"
            >
              Kapat
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
