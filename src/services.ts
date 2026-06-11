import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "./firebase";
import { Influencer, CooperationRecord } from "./types";
import { SEED_INFLUENCERS, SEED_RECORDS } from "./initialData";

const INFLUENCERS_PATH = "influencers";

// SEED LOAD DATABASE (Auto loads mock data into Firestore if empty)
export async function ensureSeedLoaded(): Promise<void> {
  const path = INFLUENCERS_PATH;
  try {
    const querySnapshot = await getDocs(collection(db, path));
    if (querySnapshot.empty) {
      console.log("Database empty. Seeding presets into Firestore...");
      for (const inf of SEED_INFLUENCERS) {
        const docRef = doc(db, path, inf.id);
        const data = {
          ...inf,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(docRef, data);

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
      console.log("Seed injection finished successfully in Firestore!");
    }
  } catch (error) {
    console.warn("Failed to check or write seeds in Firestore:", error);
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

// 2. Add Influencer
export async function createInfluencer(data: Omit<Influencer, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const path = INFLUENCERS_PATH;
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

// 3. Edit Influencer
export async function updateInfluencer(id: string, data: Partial<Influencer>): Promise<void> {
  const path = `${INFLUENCERS_PATH}/${id}`;
  try {
    const docRef = doc(db, INFLUENCERS_PATH, id);
    const payload = {
      ...data,
      updatedAt: serverTimestamp()
    };
    delete payload.id;
    delete (payload as any).createdAt;
    
    await updateDoc(docRef, payload);
  } catch (error) {
    return handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// 4. Delete Influencer
export async function deleteInfluencer(id: string): Promise<void> {
  const path = `${INFLUENCERS_PATH}/${id}`;
  try {
    const docRef = doc(db, INFLUENCERS_PATH, id);
    await deleteDoc(docRef);
  } catch (error) {
    return handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// 5. Get Cooperation Records
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

// 6. Create Cooperation Record
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

// 7. Update Cooperation Record
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

// 8. Delete Cooperation Record
export async function deleteCooperationRecord(influencerId: string, recordId: string): Promise<void> {
  const path = `${INFLUENCERS_PATH}/${influencerId}/records/${recordId}`;
  try {
    const docRef = doc(db, `${INFLUENCERS_PATH}/${influencerId}/records`, recordId);
    await deleteDoc(docRef);
  } catch (error) {
    return handleFirestoreError(error, OperationType.DELETE, path);
  }
}
