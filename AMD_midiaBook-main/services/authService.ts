import { auth, db } from "./firebase"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"

export type UserData = {
  uid: string
  email: string
  fullName: string
  role: string
};

export const registerPatient = async (
  email: string,
  password: string,
  fullName: string
) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password)

  await setDoc(doc(db, "users", cred.user.uid), {
    uid: cred.user.uid,
    email,
    fullName,
    role: "patient",
    createdAt: new Date(),
  })

  return cred
}

export const loginUser = async (email: string, password: string): Promise<UserData> => {

  console.log(email," ",password)

  const cred = await signInWithEmailAndPassword(auth, email, password)


  const snap = await getDoc(doc(db, "users", cred.user.uid))
  if (!snap.exists()) throw new Error("User not found")

  const data = snap.data() as Omit<UserData, "uid">
  return { uid: cred.user.uid, ...data }
};

export const logoutUser = () => signOut(auth)
