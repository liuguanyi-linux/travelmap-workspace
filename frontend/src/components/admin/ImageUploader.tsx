import React, { useRef } from 'react';
import { Plus, X, Image as ImageIcon, Loader2, ArrowLeft, ArrowRight, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Determine API URL based on environment (consistent with api.ts)
const API_URL = import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || 'http://localhost:3000');

// Helper for image URL (Inlined to fix reference error)
const getFullImageUrl = (path: string | undefined) => {
    if (!path) return '';

    // If path is already a full URL
    if (path.startsWith('http')) {
        return path;
    }

    if (path.startsWith('data:')) return path;

    // Relative path handling
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    
    // Try VITE_CDN_URL first
    const cdnUrl = import.meta.env.VITE_CDN_URL;
    if (cdnUrl) {
        return `${cdnUrl.replace(/\/$/, '')}/${cleanPath}`;
    }
    
    // Fallback to API URL
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const baseUrl = apiUrl.replace(/\/api\/?$/, '');
    return `${baseUrl}/${cleanPath}`;
};

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  single?: boolean;
  label?: string;
}

// Client-side image compression
const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
        const maxWidth = 1280;
        const maxHeight = 1280;
        const quality = 0.8;

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                if (width > maxWidth || height > maxHeight) {
                    if (width > height) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    } else {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(file); // Fallback
                    return;
                }
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    if (blob) {
                        const newFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        resolve(newFile);
                    } else {
                        resolve(file);
                    }
                }, 'image/jpeg', quality);
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};

export default function ImageUploader({ 
  images = [], 
  onChange, 
  maxImages = 9, 
  single = false,
  label 
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ensure images is always an array
  const safeImages = Array.isArray(images) ? images : (images ? [images] : []);

  const [isUploading, setIsUploading] = React.useState(false);

  // Debug check
  React.useEffect(() => {
    console.log('ImageUploader V2 Loaded (Fixed)');
  }, []);

  // Helper to format image URL for display - use centralized util
  const getDisplayUrl = (url: string) => {
      try {
          return getFullImageUrl(url);
      } catch (e) {
          console.error('Error calling getFullImageUrl:', e);
          return url;
      }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newImages: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        let file = files[i];
        
        // Compress image before upload
        if (file.type.startsWith('image/')) {
            try {
                file = await compressImage(file);
            } catch (err) {
                console.warn('Compression failed, using original file', err);
            }
        }

        const formData = new FormData();
        formData.append('file', file);

        const token = localStorage.getItem("admin_token");
        const response = await fetch(`${API_URL}/upload`, {
             method: "POST",
             headers: token ? { "Authorization": `Bearer ${token}` } : {},
             body: formData,
        });
        
        if (!response.ok) {
            throw new Error('Upload failed');
        }
        
        const data = await response.json();
        let imageUrl = data.url;
        // Fix path if needed (e.g. if backend returns absolute path)
        if (imageUrl.startsWith('/') && !imageUrl.startsWith('http')) {
             // For storage, we keep the relative path from backend (e.g. /uploads/xxx.jpg)
             // But for immediate display in the UI list, we might want to use the full URL?
             // Actually, usually we store the relative path in DB, and frontend expands it.
             // But this component's state 'images' is used for display.
             // Let's store the relative URL in the state if that's what we want to save to DB.
             // Wait, the component expects 'images' prop to be what's saved in DB.
             // And it renders <img src={img} />. 
             // If img is relative, <img src="/uploads/..." /> works if frontend and backend are same domain.
             // But if we use CDN, we need full URL for display.
             
             // DECISION: We will store the relative URL in the DB (standard practice).
             // But for <img /> display in this component, we need to wrap it with getDisplayUrl helper.
             // HOWEVER, 'newImages' is pushed to 'safeImages' which is passed to 'onChange'.
             // So 'onChange' receives relative URLs.
             // We need to update the rendering part below to use getDisplayUrl.
             
             // For now, keep imageUrl as relative.
        }
        newImages.push(imageUrl);
      }
      
      if (single) {
        onChange([newImages[newImages.length - 1]]);
      } else {
        const updatedImages = [...safeImages, ...newImages].slice(0, maxImages);
        onChange(updatedImages);
      }

    } catch (error) {
      console.error('Upload failed', error);
      alert('图片上传失败，请重试');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (index: number) => {
    const newImages = safeImages.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const handleMove = (index: number, direction: 'left' | 'right') => {
    if (direction === 'left' && index > 0) {
      const newImages = [...safeImages];
      [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
      onChange(newImages);
    } else if (direction === 'right' && index < safeImages.length - 1) {
      const newImages = [...safeImages];
      [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
      onChange(newImages);
    }
  };

  const handleSetCover = (index: number) => {
    if (index === 0) return;
    const newImages = [...safeImages];
    const [item] = newImages.splice(index, 1);
    newImages.unshift(item);
    onChange(newImages);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      
      <div className="flex flex-wrap gap-3">
        {/* Existing Images */}
        <AnimatePresence initial={false}>
        {safeImages.map((img, index) => (
          <motion.div 
            key={img} 
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="relative w-24 h-24 group"
          >
            <img 
              src={getDisplayUrl(img)} 
              alt={`Uploaded ${index}`} 
              className={`w-full h-full object-cover rounded-xl border shadow-sm transition-all ${index === 0 ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-gray-200'}`}
            />
            
            {/* Cover Badge */}
            {index === 0 && (
                <div className="absolute -top-2 -left-2 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full shadow-md z-10 flex items-center gap-1">
                    <Star size={10} fill="currentColor" />
                    封面
                </div>
            )}

            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex flex-col items-center justify-center gap-1 backdrop-blur-[1px]">
                {/* Top Row: Delete */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleRemove(index); }}
                  className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-600 text-white p-1 rounded-full shadow-sm transition-colors"
                  title="删除"
                >
                  <X size={12} />
                </button>

                {/* Middle: Set Cover (if not first) */}
                {index > 0 && (
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleSetCover(index); }}
                        className="bg-blue-500/80 hover:bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm transition-colors mb-1"
                    >
                        设为封面
                    </button>
                )}

                {/* Bottom Row: Move Controls */}
                <div className="flex gap-2 mt-auto mb-1">
                    {index > 0 && (
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleMove(index, 'left'); }}
                            className="bg-white/20 hover:bg-white/40 text-white p-1 rounded transition-colors"
                            title="向前移动"
                        >
                            <ArrowLeft size={12} />
                        </button>
                    )}
                    {index < safeImages.length - 1 && (
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleMove(index, 'right'); }}
                            className="bg-white/20 hover:bg-white/40 text-white p-1 rounded transition-colors"
                            title="向后移动"
                        >
                            <ArrowRight size={12} />
                        </button>
                    )}
                </div>
            </div>
          </motion.div>
        ))}
        </AnimatePresence>

        {/* Add Button */}
        {(!single || safeImages.length === 0) && safeImages.length < maxImages && (
          <div 
            onClick={handleClick}
            className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors text-gray-400 hover:text-blue-500 relative"
          >
            {isUploading ? (
                <Loader2 size={24} className="animate-spin text-blue-500" />
            ) : (
                <>
                    <Plus size={24} />
                    <span className="text-xs mt-1">添加图片</span>
                </>
            )}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={!single}
        onChange={handleFileChange}
        className="hidden"
      />
      
      <p className="text-xs text-gray-400">
        支持 jpg, png, gif 格式，自动压缩优化，{single ? '单张上传' : `最多 ${maxImages} 张`}
      </p>
    </div>
  );
}
