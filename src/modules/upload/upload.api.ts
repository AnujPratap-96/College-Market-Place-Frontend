import Axios from '@/utils/Axios';
import { isAxiosError } from 'axios';

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError(error)) {
    return error.response?.data?.message || error.message || fallback;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
};

export interface ISignUrlResponse {
  signedUrl: string | null;
  token?: string;
  path: string;
  publicUrl: string;
  provider: 'SUPABASE' | 'LOCAL';
}

export const requestSignedUploadUrl = async (
  filename: string,
  fileType: string,
  folder: 'products' | 'avatars' = 'products'
): Promise<{ data?: ISignUrlResponse; error?: string }> => {
  try {
    const res = await Axios.post('/upload/sign-url', { filename, fileType, folder });
    return { data: res.data?.data };
  } catch (error: unknown) {
    return { error: getErrorMessage(error, 'Failed to obtain upload authorization') };
  }
};

export const uploadImage = async (
  file: File,
  folder: 'products' | 'avatars' = 'products'
): Promise<{ url?: string; error?: string }> => {
  if (file.size > 5 * 1024 * 1024) {
    return { error: 'File size exceeds 5MB limit.' };
  }

  if (!file.type.startsWith('image/')) {
    return { error: 'Please select an image file (JPEG, PNG, WebP, AVIF).' };
  }

  const signRes = await requestSignedUploadUrl(file.name, file.type, folder);
  if (signRes.error && !signRes.data) {
    return uploadViaDirectFallback(file, folder);
  }

  const signData = signRes.data;
  if (signData?.signedUrl) {
    try {
      const uploadRes = await fetch(signData.signedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadRes.ok) {
        return uploadViaDirectFallback(file, folder);
      }

      return { url: signData.publicUrl };
    } catch {
      return uploadViaDirectFallback(file, folder);
    }
  }

  return uploadViaDirectFallback(file, folder);
};

const uploadViaDirectFallback = async (
  file: File,
  folder: 'products' | 'avatars'
): Promise<{ url?: string; error?: string }> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const res = await Axios.post('/upload/direct', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const returnedUrl = res.data?.data?.publicUrl;
    if (!returnedUrl) {
      return { error: 'Upload failed: no URL returned' };
    }

    if (returnedUrl.startsWith('http')) {
      return { url: returnedUrl };
    }

    const origin = (Axios.defaults.baseURL ? new URL(Axios.defaults.baseURL).origin : 'http://localhost:5000');
    return { url: `${origin}${returnedUrl}` };
  } catch (error: unknown) {
    return { error: getErrorMessage(error, 'Direct upload failed') };
  }
};
