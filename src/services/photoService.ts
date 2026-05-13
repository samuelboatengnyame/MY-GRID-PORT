import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Photo, Album, OperationType } from '@/types';
import { handleFirestoreError } from '@/lib/error-handler';

const PHOTOS_COLLECTION = 'photos';
const ALBUMS_COLLECTION = 'albums';

export const subscribeToPhotos = (albumId: string | null, callback: (photos: Photo[]) => void) => {
  if (!auth.currentUser) return () => {};

  // Query only by userId to avoid complex composite indexes
  const q = query(
    collection(db, PHOTOS_COLLECTION),
    where('userId', '==', auth.currentUser.uid)
  );

  return onSnapshot(q, (snapshot) => {
    const photos = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Photo))
      .filter(photo => photo.albumId === albumId) // In-memory album filtering
      .sort((a, b) => {
        // In-memory sorting by createdAt (desc)
        const timeA = a.createdAt?.toMillis?.() || 0;
        const timeB = b.createdAt?.toMillis?.() || 0;
        return timeB - timeA;
      });
    callback(photos);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, PHOTOS_COLLECTION);
  });
};

export const subscribeToAlbums = (callback: (albums: Album[]) => void) => {
  if (!auth.currentUser) return () => {};

  const q = query(
    collection(db, ALBUMS_COLLECTION),
    where('ownerId', '==', auth.currentUser.uid)
  );

  return onSnapshot(q, (snapshot) => {
    const albums = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Album))
      .sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || 0;
        const timeB = b.createdAt?.toMillis?.() || 0;
        return timeB - timeA;
      });
    callback(albums);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, ALBUMS_COLLECTION);
  });
};

export const addPhoto = async (photoData: Omit<Photo, 'id' | 'userId' | 'createdAt'>) => {
  if (!auth.currentUser) throw new Error('User not authenticated');

  const cleanPhotoData = {
    url: photoData.url,
    title: photoData.title || '',
    description: photoData.description || '',
    albumId: photoData.albumId || null,
    userId: auth.currentUser.uid,
    createdAt: serverTimestamp(),
    isFavorite: !!photoData.isFavorite,
    width: photoData.width,
    height: photoData.height
  };

  try {
    const docRef = await addDoc(collection(db, PHOTOS_COLLECTION), cleanPhotoData);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, PHOTOS_COLLECTION);
  }
};

export const updatePhoto = async (photoId: string, updates: Partial<Photo>) => {
  try {
    const docRef = doc(db, PHOTOS_COLLECTION, photoId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${PHOTOS_COLLECTION}/${photoId}`);
  }
};

export const deletePhoto = async (photoId: string) => {
  try {
    await deleteDoc(doc(db, PHOTOS_COLLECTION, photoId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${PHOTOS_COLLECTION}/${photoId}`);
  }
};

export const addAlbum = async (albumData: Omit<Album, 'id' | 'ownerId' | 'createdAt'>) => {
  if (!auth.currentUser) throw new Error('User not authenticated');

  try {
    const docRef = await addDoc(collection(db, ALBUMS_COLLECTION), {
      ...albumData,
      ownerId: auth.currentUser.uid,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, ALBUMS_COLLECTION);
  }
};

export const deleteAlbum = async (albumId: string) => {
  try {
    await deleteDoc(doc(db, ALBUMS_COLLECTION, albumId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${ALBUMS_COLLECTION}/${albumId}`);
  }
};
