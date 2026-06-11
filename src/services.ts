import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  writeBatch
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "./firebase";
import { Influencer, CooperationRecord } from "./types";
import { SEED_INFLUENCERS, SEED_RECORDS } from "./initialData";

const INFLUENCERS_PATH = "influencers";

export async function ensureSeedLoaded(): Promise<void> {
  const path = INFLUENCERS_PATH;
  try {
    const querySnapshot = await getDocs(collection(db, path));
    if (querySnapshot.empty) {
      console.log("Database empty. Seeding presets into Firestore...");
      
      // Seed influencers
      for (const inf of SEED_INFLUENCERS) {
        const docRef = doc(db, path, inf.id);
        const data = {
          ...inf,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(docRef, data);

        // Find relevant seed records and write them
        const relatedRecords = SEED_RECORDS.filter(rec => rec.influencerId === inf.id);
        for (const rec of relatedRecords) {
          const recRef = doc(db, `${path}/${inf.id}/records`, rec.id);
          const recData = {
            ...rec,
            createdAt: serverTimestamp(),
          };
          await setDoc(recRef, recData);
        }
      }
      console.log("Seed injection finished successfully!");
    }
  } catch (error) {
    console.warn("Failed to check or write seeds (this is expected if permissions or authentication isn't fully ready yet):", error);
  }
}

// 1. Get List of Influencers
export async function getInfluencers(): Promise<Influencer[]> {
  const path = INFLUENCERS_PATH;
  try {
    const listSnapshot = await getDocs(collection(db, path));
    const list: Influencer[] = [];
    listSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        ...data,
        id: docSnap.id,
        createdAt: data.createdAt?.toDate?.() || data.createdAt || null,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt || null,
      } as Influencer);
    });
    return list;
  } catch (error) {
    return handleFirestoreError(error, OperationType.LIST, path);
  }
}

// 2. Add / Edit / Delete Influencer (Admins Only)
export async function createInfluencer(data: Omit<Influencer, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const path = INFLUENCERS_PATH;
  // Unique random string id
  const customId = "inf_" + Math.random().toString(36).substring(2, 11);
  try {
    const docRef = doc(db, path, customId);
    const payload = {
      ...data,
      id: customId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(docRef, payload);
    return customId;
  } catch (error) {
    return handleFirestoreError(error, OperationType.CREATE, `${path}/${customId}`);
  }
}

export async function updateInfluencer(id: string, data: Partial<Influencer>): Promise<void> {
  const path = `${INFLUENCERS_PATH}/${id}`;
  try {
    const docRef = doc(db, INFLUENCERS_PATH, id);
    const payload = {
      ...data,
      updatedAt: serverTimestamp()
    };
    // Make sure we don't overwrite id, createdAt
    delete payload.id;
    delete (payload as any).createdAt;
    
    await updateDoc(docRef, payload);
  } catch (error) {
    return handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteInfluencer(id: string): Promise<void> {
  const path = `${INFLUENCERS_PATH}/${id}`;
  try {
    const docRef = doc(db, INFLUENCERS_PATH, id);
    await deleteDoc(docRef);
  } catch (error) {
    return handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// 3. Cooperation Records Nested Operations
export async function getCooperationRecords(influencerId: string): Promise<CooperationRecord[]> {
  const path = `${INFLUENCERS_PATH}/${influencerId}/records`;
  try {
    const snap = await getDocs(collection(db, path));
    const records: CooperationRecord[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      records.push({
        ...data,
        id: docSnap.id,
      } as CooperationRecord);
    });
    return records;
  } catch (error) {
    return handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function createCooperationRecord(
  influencerId: string, 
  data: Omit<CooperationRecord, "id" | "createdAt">
): Promise<string> {
  const customId = "rec_" + Math.random().toString(36).substring(2, 11);
  const path = `${INFLUENCERS_PATH}/${influencerId}/records/${customId}`;
  try {
    const docRef = doc(db, `${INFLUENCERS_PATH}/${influencerId}/records`, customId);
    const payload = {
      ...data,
      id: customId,
      createdAt: serverTimestamp()
    };
    await setDoc(docRef, payload);
    return customId;
  } catch (error) {
    return handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateCooperationRecord(
  influencerId: string,
  recordId: string,
  data: Partial<CooperationRecord>
): Promise<void> {
  const path = `${INFLUENCERS_PATH}/${influencerId}/records/${recordId}`;
  try {
    const docRef = doc(db, `${INFLUENCERS_PATH}/${influencerId}/records`, recordId);
    const payload = { ...data };
    delete payload.id;
    delete (payload as any).createdAt;
    
    await updateDoc(docRef, payload);
  } catch (error) {
    return handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteCooperationRecord(influencerId: string, recordId: string): Promise<void> {
  const path = `${INFLUENCERS_PATH}/${influencerId}/records/${recordId}`;
  try {
    const docRef = doc(db, `${INFLUENCERS_PATH}/${influencerId}/records`, recordId);
    await deleteDoc(docRef);
  } catch (error) {
    return handleFirestoreError(error, OperationType.DELETE, path);
  }
}
