"use server";

import { StatusServer } from "@/api/types";
import { db, firebaseAdmin } from "@/lib/firebase/admin";

import { Collections } from "@/lib/firebase/collections";

import { CreatePackageType, Package } from "./types";

export async function CreatePackage(userId: string, data: CreatePackageType) {
  try {
    const body = {
      ...data,
      createdAt: firebaseAdmin.firestore.Timestamp.now(),
    };

    await db
      .collection(Collections.users)
      .doc(userId)
      .collection(Collections.packages)
      .add(body);

    return {
      status: StatusServer.success,
      message: "Pacote criado com sucesso",
    };
  } catch (error) {
    console.error("Error creating client", error);
    const err = error as Error;
    return {
      status: StatusServer.error,
      message: err.message,
    };
  }
}

export async function DeletePackage(userId: string, id: string) {
  try {
    await db
      .collection(Collections.users)
      .doc(userId)
      .collection(Collections.packages)
      .doc(id)
      .delete();
    return {
      status: StatusServer.success,
      message: "Pacote deletado com sucesso",
    };
  } catch (error) {
    console.error("Error deleting client", error);
    const err = error as Error;
    return {
      status: StatusServer.error,
      message: err.message,
    };
  }
}


export async function UpdatePackage(userId: string, data: Package) {
  try {
    await db
      .collection(Collections.users)
      .doc(userId)
      .collection(Collections.packages)
      .doc(data.id)
      .update(data);
    return {
      status: StatusServer.success,
      message: "Pacote atualizado com sucesso",
    };
  } catch (error) {
    console.error("Error updating client", error);
    const err = error as Error;
    return {
      status: StatusServer.error,
      message: err.message,
    };
  }
}



export async function updatePackageStatus(userId: string, status: string, id: string ) {
  try {
    await db
      .collection(Collections.users)
      .doc(userId)
      .collection(Collections.packages)
      .doc(id)
      .update({ status });
    return {
      status: StatusServer.success,
      message: "Pacote atualizado com sucesso",
    };
  } catch (error) {
    console.error("Error updating client", error);
    const err = error as Error;
    return {
      status: StatusServer.error,
      message: err.message,
    };
  }
} 

