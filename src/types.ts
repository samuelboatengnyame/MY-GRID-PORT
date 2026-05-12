import { Timestamp } from 'firebase/firestore';

export interface Photo {
  id: string;
  url: string;
  title?: string;
  description?: string;
  albumId?: string;
  ownerId: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  isFavorite: boolean;
  width: number;
  height: number;
}

export interface Album {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: Timestamp;
  coverPhotoUrl?: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}
