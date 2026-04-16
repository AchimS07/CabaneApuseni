import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getClientStorage } from '@/lib/firebase/client';
import type { FirebaseStorage } from 'firebase/storage';

// Lazy proxy — getClientStorage() is only called when a property is accessed (client-side).
const storage = new Proxy({} as FirebaseStorage, {
  get(_target, prop) {
    return (getClientStorage() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export async function uploadCabinPhoto(file: File): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filename = Date.now() + '_' + safeName;
  const fileRef = ref(storage, 'cabins/' + filename);
  const snapshot = await uploadBytes(fileRef, file);
  return getDownloadURL(snapshot.ref);
}
