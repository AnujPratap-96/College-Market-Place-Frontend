import { useState, useRef } from 'react';
import { uploadImage } from '@/modules/upload/upload.api';
import {
  UploadCloud,
  X,
  Camera,
  RefreshCw,
  AlertCircle,
  Link as LinkIcon,
  CheckCircle2,
} from 'lucide-react';

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: 'products' | 'avatars';
  label?: string;
  circle?: boolean;
  aspect?: 'square' | 'video';
  className?: string;
}

export const ImageUploader = ({
  value,
  onChange,
  folder = 'products',
  label = 'Upload Image',
  circle = false,
  aspect = 'video',
  className = '',
}: ImageUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB.');
      return;
    }

    setError(null);
    setUploading(true);

    const res = await uploadImage(file, folder);
    setUploading(false);

    if (res.error) {
      setError(res.error);
    } else if (res.url) {
      onChange(res.url);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleManualUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualUrl.trim()) {
      onChange(manualUrl.trim());
      setShowUrlInput(false);
      setManualUrl('');
    }
  };

  if (circle) {
    return (
      <div className={`relative inline-block ${className}`}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleInputChange}
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
        />
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className="relative w-28 h-28 rounded-full border-2 border-dashed border-primary/40 hover:border-primary overflow-hidden cursor-pointer group transition shadow-sm bg-muted flex items-center justify-center"
        >
          {value ? (
            <img src={value} alt="Avatar preview" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <Camera size={26} />
              <span className="text-[10px] mt-1 font-medium">Add Photo</span>
            </div>
          )}

          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
            <Camera size={22} />
          </div>

          {uploading && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <RefreshCw size={24} className="animate-spin text-primary" />
            </div>
          )}
        </div>

        {value && !uploading && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
            }}
            className="absolute -top-1 -right-1 p-1 rounded-full bg-destructive text-white shadow hover:opacity-90 transition"
          >
            <X size={12} />
          </button>
        )}

        {error && (
          <p className="text-[11px] text-rose-500 mt-1.5 flex items-center gap-1">
            <AlertCircle size={12} /> {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {label && <label className="text-xs font-semibold text-foreground block">{label}</label>}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
      />

      {value ? (
        <div className="relative rounded-2xl overflow-hidden border bg-muted/20 group">
          <div className={aspect === 'square' ? 'aspect-square' : 'aspect-video'}>
            <img src={value} alt="Upload preview" className="w-full h-full object-cover" />
          </div>

          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-background/90 text-foreground text-xs font-semibold backdrop-blur shadow hover:bg-background transition flex items-center gap-1"
            >
              <Camera size={13} /> Replace Photo
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-1.5 rounded-lg bg-background/90 text-destructive text-xs font-semibold backdrop-blur shadow hover:bg-background transition"
            >
              <X size={15} />
            </button>
          </div>

          <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-md bg-emerald-500/90 text-white text-[11px] font-bold backdrop-blur flex items-center gap-1">
            <CheckCircle2 size={12} /> Image Ready
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition
            ${
              isDragging
                ? 'border-primary bg-primary/5 scale-[1.01]'
                : 'border-border hover:border-primary/60 hover:bg-muted/30'
            }
            ${aspect === 'square' ? 'aspect-square flex flex-col items-center justify-center' : ''}
          `}
        >
          {uploading ? (
            <div className="flex flex-col items-center justify-center py-6 space-y-2">
              <RefreshCw size={28} className="animate-spin text-primary" />
              <p className="text-xs font-semibold text-foreground">Streaming to Cloud Storage...</p>
              <p className="text-[11px] text-muted-foreground">Uploading directly to Supabase CDN</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4 space-y-2.5">
              <div className="p-3.5 rounded-2xl bg-primary/10 text-primary">
                <UploadCloud size={26} />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">
                  Click to select or drag and drop image here
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Supports JPEG, PNG, WebP up to 5MB
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="pt-1">
        {showUrlInput ? (
          <form onSubmit={handleManualUrlSubmit} className="flex gap-2">
            <input
              type="url"
              placeholder="Paste public image link (e.g. https://...)"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs rounded-xl border bg-background focus:ring-2 focus:ring-primary outline-none"
            />
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition"
            >
              Use Link
            </button>
            <button
              type="button"
              onClick={() => setShowUrlInput(false)}
              className="px-2.5 py-1.5 text-xs font-medium rounded-xl border hover:bg-muted transition"
            >
              Cancel
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setShowUrlInput(true)}
            className="text-[11px] font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition"
          >
            <LinkIcon size={12} /> Or paste an external image URL
          </button>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
