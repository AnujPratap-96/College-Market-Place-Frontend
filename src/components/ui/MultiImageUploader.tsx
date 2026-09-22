import React, { useState, useRef } from 'react';
import { uploadImage } from '@/modules/upload/upload.api';
import { toast } from '@/components/ui/toast';
import {
  X,
  Plus,
  Loader2,
  Star,
  Link as LinkIcon,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MultiImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  folder?: 'products';
}

export const MultiImageUploader: React.FC<MultiImageUploaderProps> = ({
  images,
  onChange,
  maxImages = 5,
  folder = 'products',
}) => {
  const [uploading, setUploading] = useState<boolean>(false);
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);
  const [manualUrl, setManualUrl] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    const availableSlots = maxImages - images.length;
    if (availableSlots <= 0) {
      toast.error(`Maximum of ${maxImages} images allowed.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (fileArray.length > availableSlots) {
      toast.error(`You can only add ${availableSlots} more ${availableSlots === 1 ? 'image' : 'images'} (max ${maxImages} total).`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploading(true);
    const newUrls: string[] = [];

    try {
      for (const file of fileArray) {
        if (images.length + newUrls.length >= maxImages) break;
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image file.`);
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} exceeds 5MB size limit.`);
          continue;
        }

        const res = await uploadImage(file, folder);
        if (res.url) {
          newUrls.push(res.url);
        } else if (res.error) {
          toast.error(res.error);
        }
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }

    if (newUrls.length > 0) {
      const merged = [...images, ...newUrls].slice(0, maxImages);
      onChange(merged);
      toast.success(`Added ${newUrls.length} ${newUrls.length === 1 ? 'photo' : 'photos'}!`);
    }
  };

  const handleRemove = (index: number) => {
    const next = images.filter((_, i) => i !== index);
    onChange(next);
  };

  const handleSetCover = (index: number) => {
    if (index === 0) return;
    const target = images[index];
    const rest = images.filter((_, i) => i !== index);
    onChange([target, ...rest]);
    toast.success('Main cover photo updated');
  };

  const handleAddManualUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = manualUrl.trim();
    if (!trimmed) return;
    if (images.length >= maxImages) {
      toast.error(`Maximum of ${maxImages} images allowed.`);
      return;
    }
    const next = [...images, trimmed].slice(0, maxImages);
    onChange(next);
    setManualUrl('');
    setShowUrlInput(false);
    toast.success('Image URL added!');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <ImageIcon size={14} className="text-orange-500" />
            Product Photos ({images.length}/{maxImages})
          </label>
          <p className="text-[11px] text-muted-foreground">
            Add multiple photos from different angles (First photo is cover). Max 5MB each.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowUrlInput((prev) => !prev)}
          className="text-xs text-orange-600 dark:text-orange-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
        >
          <LinkIcon size={12} />
          {showUrlInput ? 'Hide URL input' : 'Paste URL'}
        </button>
      </div>

      {showUrlInput && (
        <form onSubmit={handleAddManualUrl} className="flex gap-2">
          <Input
            type="url"
            placeholder="https://example.com/item-photo.jpg"
            value={manualUrl}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setManualUrl(e.target.value)}
            className="h-9 text-xs rounded-xl bg-muted/30"
          />
          <Button
            type="submit"
            size="sm"
            className="h-9 px-4 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white shrink-0"
          >
            Add Photo
          </Button>
        </form>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {images.map((url, index) => (
          <div
            key={url + index}
            className={`group relative aspect-square rounded-2xl overflow-hidden border-2 bg-muted/30 transition-all ${
              index === 0
                ? 'border-orange-500 shadow-md shadow-orange-500/10'
                : 'border-border/80 hover:border-border'
            }`}
          >
            <img
              src={url}
              alt={`Product photo ${index + 1}`}
              className="w-full h-full object-cover"
            />

            {index === 0 && (
              <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-500 text-white flex items-center gap-0.5 shadow-xs">
                <Star size={10} className="fill-current" />
                Cover
              </span>
            )}

            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
              {index !== 0 && (
                <button
                  type="button"
                  onClick={() => handleSetCover(index)}
                  className="p-1.5 rounded-lg bg-white/90 text-zinc-900 hover:bg-white text-[10px] font-bold transition-all"
                  title="Make Cover Image"
                >
                  Set Cover
                </button>
              )}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="p-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all"
                title="Remove Photo"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ))}

        {images.length < maxImages && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files) {
                handleFiles(e.dataTransfer.files);
              }
            }}
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-3 text-center transition-all cursor-pointer ${
              isDragging
                ? 'border-orange-500 bg-orange-500/10'
                : 'border-border/80 hover:border-orange-500/50 hover:bg-muted/40 bg-muted/20'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) {
                  handleFiles(e.target.files);
                }
              }}
            />

            {uploading ? (
              <div className="flex flex-col items-center gap-1.5">
                <Loader2 size={20} className="animate-spin text-orange-500" />
                <span className="text-[10px] text-muted-foreground font-semibold">Uploading...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
                <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
                  <Plus size={16} />
                </div>
                <span className="text-[11px] font-bold text-foreground">Add Photos</span>
                <span className="text-[9px] text-muted-foreground leading-tight">
                  Click or drag files
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiImageUploader;
