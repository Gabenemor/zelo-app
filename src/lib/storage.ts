import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

export async function uploadFile(
  file: File,
  path: string,
  fileName?: string
): Promise<string> {
  const finalFileName = fileName || `${Date.now()}_${file.name}`;
  const storageRef = ref(storage, `${path}/${finalFileName}`);
  
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  
  return downloadURL;
}

export async function uploadMultipleFiles(
  files: File[],
  path: string
): Promise<string[]> {
  const uploadPromises = files.map((file, index) => 
    uploadFile(file, path, `${Date.now()}_${index}_${file.name}`)
  );
  
  return Promise.all(uploadPromises);
}

export async function deleteFile(url: string): Promise<void> {
  const fileRef = ref(storage, url);
  await deleteObject(fileRef);
}

// Helper functions for specific use cases
export async function uploadProfilePhoto(userId: string, file: File): Promise<string> {
  return uploadFile(file, `profiles/${userId}`, `profile_${Date.now()}.${file.name.split('.').pop()}`);
}

export async function uploadPortfolioImages(userId: string, files: File[]): Promise<string[]> {
  return uploadMultipleFiles(files, `portfolios/${userId}`);
}

export async function uploadServiceRequestAttachments(requestId: string, files: File[]): Promise<string[]> {
  return uploadMultipleFiles(files, `service-requests/${requestId}`);
}