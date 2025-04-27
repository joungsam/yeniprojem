'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';
import { Category } from '@prisma/client';
import { useThemeStore } from '@/app/store/themeStore';

interface CategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  initialData?: Category;
  title: string;
}

// Lazy load the emoji picker
const EmojiPicker = lazy(() => import('emoji-picker-react'));

const categorySchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
  icon: z.string().nullable().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export function CategoryForm({ isOpen, onClose, onSubmit, initialData, title }: CategoryFormProps) {
  const { toast } = useToast();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        emojiPickerRef.current && 
        !emojiPickerRef.current.contains(event.target as Node) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialData?.name || '',
      icon: initialData?.icon || '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        icon: initialData.icon || '',
      });
    } else {
      reset({
        name: '',
        icon: '',
      });
    }
  }, [initialData, reset]);

  const selectedIcon = watch('icon');

  const handleCloseEmojiPicker = () => {
    setShowEmojiPicker(false);
  };

  const onEmojiSelect = (emojiData: any) => {
    setValue('icon', emojiData.emoji);
    handleCloseEmojiPicker();
  };

  const handleFormSubmit = async (data: CategoryFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit(data);
      toast({
        variant: "success",
        title: "Başarılı!",
        description: initialData 
          ? "Kategori başarıyla güncellendi" 
          : "Kategori başarıyla oluşturuldu"
      });
      reset();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bir hata oluştu';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Hata!",
        description: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className={`w-full max-w-md transform overflow-hidden rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} p-6 text-left align-middle shadow-xl transition-all`}>
                <Dialog.Title
                  as="h3"
                  className={`text-lg font-medium leading-6 ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}
                >
                  {title}
                </Dialog.Title>

                {error && (
                  <div className={`mb-4 p-3 rounded ${isDark ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'}`}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                  <div>
                    <label htmlFor="name" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Kategori Adı
                    </label>
                    <input
                      type="text"
                      id="name"
                      {...register('name')}
                      className={`mt-1 block w-full rounded-md ${
                        isDark 
                          ? 'bg-gray-700 text-white border-gray-600' 
                          : 'bg-white text-gray-900 border-gray-300'
                      } px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                    />
                    {errors.name && (
                      <p className={`mt-1 text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      İkon
                    </label>
                    <div className="mt-1 flex items-center gap-2">
                      <button
                        type="button"
                        ref={emojiButtonRef}
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className={`inline-flex items-center px-3 py-2 border ${
                          isDark 
                            ? 'border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600' 
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        } shadow-sm text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                      >
                        {selectedIcon || 'Emoji Seç'} 
                      </button>
                      {showEmojiPicker && (
                        <>
                          {/* Backdrop */}
                          <div 
                            className="fixed inset-0 bg-black/30" 
                            onClick={handleCloseEmojiPicker}
                          />
                          <div 
                            ref={emojiPickerRef} 
                            className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl p-2`}
                          >
                            <div className={`flex items-center justify-between mb-2 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} pb-2`}>
                              <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                Emoji Seç
                              </span>
                              <button
                                type="button"
                                onClick={handleCloseEmojiPicker}
                                className={`p-1 rounded-full ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                              >
                                <XMarkIcon className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                              </button>
                            </div>
                            <Suspense fallback={<div className={`p-4 ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-700'} rounded`}>Yükleniyor...</div>}>
                              <EmojiPicker
                                onEmojiClick={onEmojiSelect}
                                lazyLoadEmojis={true}
                                searchDisabled
                                skinTonesDisabled
                                previewConfig={{
                                  showPreview: false
                                }}
                                height={300}
                                width={280}
                              />
                            </Suspense>
                          </div>
                        </>
                      )}
                    </div>
                    {errors.icon && (
                      <p className={`mt-1 text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>{errors.icon.message}</p>
                    )}
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className={`inline-flex justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                        isDark 
                          ? 'border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600' 
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
