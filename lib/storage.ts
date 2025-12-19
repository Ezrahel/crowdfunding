/**
 * Firebase Storage utility for file uploads
 */

import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

export interface UploadProgress {
  progress: number;
  url: string | null;
  error: string | null;
}

/**
 * Upload a file to Firebase Storage
 */
export async function uploadFile(
  file: File,
  path: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  try {
    // Validate file size (max 10MB for images, 100MB for videos)
    const maxSize = file.type.startsWith('video/') ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error(`File size exceeds maximum allowed size (${maxSize / 1024 / 1024}MB)`);
    }

    // Validate file type
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const allowedVideoTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/webm'];
    
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      throw new Error('Invalid file type. Only images and videos are allowed.');
    }

    if (file.type.startsWith('image/') && !allowedImageTypes.includes(file.type)) {
      throw new Error('Invalid image type. Allowed: JPEG, PNG, WebP, GIF');
    }

    if (file.type.startsWith('video/') && !allowedVideoTypes.includes(file.type)) {
      throw new Error('Invalid video type. Allowed: MP4, MOV, AVI, WebM');
    }

    // Create storage reference
    const storageRef = ref(storage, path);

    // Upload file with progress tracking
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(progress);
          }
        },
        (error) => {
          console.error('Upload error:', error);
          reject(new Error(`Upload failed: ${error.message}`));
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error: any) {
            console.error('Error getting download URL:', error);
            reject(new Error(`Failed to get download URL: ${error.message}`));
          }
        }
      );
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    throw error;
  }
}

/**
 * Upload multiple files
 */
export async function uploadFiles(
  files: File[],
  basePath: string,
  onProgress?: (index: number, progress: number) => void
): Promise<string[]> {
  const uploadPromises = files.map((file, index) => {
    const fileName = `${Date.now()}-${index}-${file.name}`;
    const filePath = `${basePath}/${fileName}`;
    
    return uploadFile(
      file,
      filePath,
      (progress) => {
        if (onProgress) {
          onProgress(index, progress);
        }
      }
    );
  });

  return Promise.all(uploadPromises);
}

/**
 * Delete a file from Firebase Storage
 */
export async function deleteFile(path: string): Promise<void> {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error: any) {
    console.error('Error deleting file:', error);
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

/**
 * Generate a unique file path for campaign media
 */
export function generateCampaignMediaPath(campaignId: string, fileName: string, type: 'cover' | 'image' | 'video'): string {
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `campaigns/${campaignId}/${type}/${timestamp}-${sanitizedFileName}`;
}


