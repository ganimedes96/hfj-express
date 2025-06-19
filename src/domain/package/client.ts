"use client";
import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { Collections } from "@/lib/firebase/collections";
import { Package } from "./types";

export async function getPackages(userId: string) {
  const clientsRef = collection(
    db,
    Collections.users,
    userId,
    Collections.packages
  );
  const q = query(clientsRef, orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      ...data,
      createdAt: data.createdAt.toDate(),
      id: doc.id,
    } as Package;
  });
}
