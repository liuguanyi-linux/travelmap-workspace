import React, { useRef } from 'react';
import { Plus, X, Image as ImageIcon, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  single?: boolean;
  label?: string;
}

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
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newImages: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_URL}/upload`, {
             method: 'POST',
             body: formData,
        });
        
        if (!response.ok) {
            throw new Error('Upload failed');
        }
        
        const data = await response.json();
        let imageUrl = data.url;
        if (imageUrl.startsWith('/') && !imageUrl.startsWith('http')) {
             imageUrl = `${API_URL}${imageUrl}`;
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

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      
      <div className="flex flex-wrap gap-3">
        {/* Existing Images */}
        {safeImages.map((img, index) => (
          <div key={index} className="relative w-24 h-24 group">
            <img 
              src={img} 
              alt={`Uploaded ${index}`} 
              className="w-full h-full object-cover rounded-xl border border-gray-200 shadow-sm"
            />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={12} />
            </button>
          </div>
        ))}

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
        支持 jpg, png, gif 格式，{single ? '单张上传' : `最多 ${maxImages} 张`}
      </p>
    </div>
  );
}
