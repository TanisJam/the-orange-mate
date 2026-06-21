'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { uploadAvatar } from '@/lib/database-client';
import { Upload, X, User } from 'lucide-react';

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface AvatarUploadProps {
  userId: string;
  currentAvatarUrl?: string;
  onUploadComplete: (url: string) => void;
}

export function AvatarUpload({ userId, currentAvatarUrl, onUploadComplete }: AvatarUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayUrl, setDisplayUrl] = useState<string | null>(currentAvatarUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync displayUrl when parent loads currentAvatarUrl asynchronously
  useEffect(() => {
    if (currentAvatarUrl) {
      setDisplayUrl(currentAvatarUrl);
    }
  }, [currentAvatarUrl]);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Solo se permiten imágenes (JPEG, PNG, WebP)';
    }
    if (file.size > MAX_SIZE) {
      return 'La imagen no debe superar 2 MB';
    }
    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      return;
    }

    setError(null);
    setSelectedFile(file);
    // Revoke previous preview URL to avoid memory leaks
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    try {
      const url = await uploadAvatar(userId, selectedFile);
      if (url) {
        setDisplayUrl(url);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setSelectedFile(null);
        onUploadComplete(url);
      } else {
        setError('Error al subir la imagen. Intenta de nuevo.');
      }
    } catch {
      setError('Error al subir la imagen. Intenta de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const avatarSrc = previewUrl || displayUrl;

  return (
    <div className="space-y-4">
      {/* Avatar Preview */}
      <div className="flex items-center gap-4">
        <div
          className="w-20 h-20 rounded-full border-2 border-ink dark:border-neutral-gray overflow-hidden bg-neutral-light flex items-center justify-center shrink-0
            shadow-[2px_2px_0px_0px_hsl(var(--ink))]"
        >
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt="Avatar preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-10 h-10 text-muted-foreground" />
          )}
        </div>

        <div className="flex-1 space-y-2">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
            id="avatar-upload-input"
          />

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="w-4 h-4" />
              Seleccionar imagen
            </Button>

            {selectedFile && (
              <>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleUpload}
                  disabled={uploading}
                >
                  {uploading ? 'Subiendo...' : 'Subir'}
                </Button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 rounded-full hover:bg-neutral-light dark:hover:bg-muted transition-colors"
                  title="Cancelar selección"
                  aria-label="Cancelar selección"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </>
            )}
          </div>

          {selectedFile && (
            <p className="text-xs text-muted-foreground">
              {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
            </p>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-error font-medium">{error}</p>
      )}
    </div>
  );
}
