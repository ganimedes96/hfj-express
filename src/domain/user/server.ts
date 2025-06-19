/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { db, firebaseAdmin } from "@/lib/firebase/admin";
import { Collections } from "@/lib/firebase/collections";
import { CreateUser, User } from "./types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { auth } from "firebase-admin";
import { StatusServer } from "@/api/types";
import { handleFirebaseAuthError } from "@/lib/firebase/handle-firebase-auth-error";

export async function getUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }
  const userRef = db.collection(Collections.users).doc(session.user.id);
  const userDoc = await userRef.get();

  if (!userDoc.exists) return null;

  const user = userDoc.data();

  if (!user) return null;
  return {
    ...user,
    createdAt: user.createdAt.toDate(),
  } as User;
}

export async function CreateUserServer(data: Partial<CreateUser>) {
  try {
    const create = await auth().createUser({
      email: data.email,
      password: data.password,
    });
    const body = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
      role: data.role,
      emailVerified: true,
      active: true,
    };

    await db
      .collection(Collections.users)
      .doc(create.uid)
      .set({
        ...body,
        id: create.uid,
        
        createdAt: firebaseAdmin.firestore.Timestamp.now(),
      });
    return {
      status: StatusServer.success,
      message: "Usuário criado com sucesso",
    };
  } catch (error: any) {
    console.error("Erro ao criar usuário:", {
      code: error?.code,
      message: error?.message,
      errorInfo: error?.errorInfo,
    });

    return {
      status: StatusServer.error,
      message: handleFirebaseAuthError(error),
    };
  }
}
