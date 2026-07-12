import { auth, db } from "./firebase"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth"
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"
import { UserData } from "../types"

export const registerPatient = async (
  email: string,
  password: string,
  fullName: string
) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password)

  await setDoc(doc(db, "users", cred.user.uid), {
    uid: cred.user.uid,
    fullName,
    email,
    phone: "",
    gender: "",
    role: "patient",
    accountStatus: "active",
    profileImage: "",
    createdAt: serverTimestamp(),
  })

  return cred
}

export const loginUser = async (email: string, password: string): Promise<UserData> => {
  const cred = await signInWithEmailAndPassword(auth, email, password)

  const snap = await getDoc(doc(db, "users", cred.user.uid))
  if (!snap.exists()) throw new Error("User profile not found")
  if (snap.data().accountStatus === "inactive") throw new Error("Account is deactivated")
  if (snap.data().accountStatus === "deleted") throw new Error("Account not found")

  return { uid: cred.user.uid, ...snap.data() } as UserData
}

export const logoutUser = () => signOut(auth)
