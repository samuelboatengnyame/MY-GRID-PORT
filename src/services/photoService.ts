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
import { db, auth } from '../lib/firebase';
import { Photo, Album, OperationType } from '../types';
import { handleFirestoreError } from '../lib/error-handler';

const PHOTOS_COLLECTION = 'photos';
const ALBUMS_COLLECTION = 'albums';

export const subscribeToPhotos = (callback: (photos: Photo[]) => void) => {
  if (!auth.currentUser) return () => {};

  const q = query(
    collection(db, PHOTOS_COLLECTION),
    where('ownerId', '==', auth.currentUser.uid),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const photos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Photo));
    callback(photos);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, PHOTOS_COLLECTION);
  });
};

export const subscribeToAlbums = (callback: (albums: Album[]) => void) => {
  if (!auth.currentUser) return () => {};

  const q = query(
    collection(db, ALBUMS_COLLECTION),
    where('ownerId', '==', auth.currentUser.uid),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const albums = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Album));
    callback(albums);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, ALBUMS_COLLECTION);
  });
};

export const addPhoto = async (photoData: Omit<Photo, 'id' | 'ownerId' | 'createdAt'>) => {
  if (!auth.currentUser) throw new Error('User not authenticated');

  try {
    const docRef = await addDoc(collection(db, PHOTOS_COLLECTION), {
      ...photoData,
      ownerId: auth.currentUser.uid,
      createdAt: serverTimestamp(),
      isFavorite: photoData.isFavorite || false
    });
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
