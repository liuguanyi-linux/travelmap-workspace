import React, { useRef, useState } from 'react';
import { Plus, X, Video, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface VideoUploaderProps {
  videos: string[];
  onChange: (videos: string[]) => void;
  maxVideos?: number;
  label?: string;
}

export default function VideoUploader({ 
  videos = [], 
  onChange, 
  maxVideos = 1,
  label 
}: VideoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Ensure videos is always an array
  const safeVideos = Array.isArray(videos) ? videos : (videos ? [videos] : []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newVideos: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        // Use fetch directly to handle FormData
        const response = await fetch(`${API_URL}/upload`, {
             method: 'POST',
             body: formData,
        });
        
        if (!response.ok) {
            throw new Error('Upload failed');
        }
        
        const data = await response.json();
        
        let videoUrl = data.url;
        // If URL is relative, prepend API_URL
        if (videoUrl.startsWith('/') && !videoUrl.startsWith('http')) {
             videoUrl = `${API_URL}${videoUrl}`;
        }
        newVideos.push(videoUrl);
      }
      
      const updatedVideos = [...safeVideos, ...newVideos].slice(0, maxVideos);
      onChange(updatedVideos);

    } catch (error) {
      console.error('Upload failed', error);
      alert('视频上传失败，请重试');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };
  
  const handleRemove = (index: number) => {
    const newVideos = safeVideos.filter((_, i) => i !== index);
    onChange(newVideos);
  };

  const handleClick = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      
      <div className="flex flex-wrap gap-3">
        {/* Existing Videos */}
        {safeVideos.map((video, index) => (
          <div key={index} className="relative w-32 h-24 group">
            <video 
              src={video} 
              className="w-full h-full object-cover rounded-xl border border-gray-200 shadow-sm bg-black"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <Video className="text-white opacity-50" size={20} />
            </div>
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <X size={12} />
            </button>
          </div>
        ))}

        {/* Add Button */}
        {safeVideos.length < maxVideos && (
          <div 
            onClick={handleClick}
            className="w-32 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors text-gray-400 hover:text-blue-500 relative"
          >
            {isUploading ? (
                <Loader2 size={24} className="animate-spin text-blue-500" />
            ) : (
                <>
                    <Plus size={24} />
                    <span className="text-xs mt-1">添加视频</span>
                </>
            )}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        multiple={maxVideos > 1}
        onChange={handleFileChange}
        className="hidden"
      />
      
      <p className="text-xs text-gray-400">
        支持 mp4, webm, mov 格式，{maxVideos === 1 ? '单视频上传' : `最多 ${maxVideos} 个视频`}
      </p>
    </div>
  );
}
