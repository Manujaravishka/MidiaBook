declare module 'firebase/app' {
  const app: any
  export function initializeApp(...args: any[]): any
  export default app
}

declare module 'firebase/auth' {
  export function getAuth(...args: any[]): any
  export function createUserWithEmailAndPassword(...args: any[]): any
  export function signInWithEmailAndPassword(...args: any[]): any
  export function signOut(...args: any[]): Promise<void>
  export function onAuthStateChanged(...args: any[]): () => void
}

declare module 'firebase/firestore' {
  export function getFirestore(...args: any[]): any
  export function collection(...args: any[]): any
  export function doc(...args: any[]): any
  export function getDoc(...args: any[]): Promise<any>
  export function getDocs(...args: any[]): Promise<any>
  export function setDoc(...args: any[]): Promise<void>
  export function addDoc(...args: any[]): Promise<any>
  export function updateDoc(...args: any[]): Promise<void>
  export function deleteDoc(...args: any[]): Promise<void>
  export function query(...args: any[]): any
  export function where(...args: any[]): any
  export function orderBy(...args: any[]): any
  export function onSnapshot(...args: any[]): () => void
  export function serverTimestamp(...args: any[]): any
  export class Timestamp {
    static now(): Timestamp
    static fromMillis(milliseconds: number): Timestamp
    static fromDate(date: Date): Timestamp
    toMillis(): number
    toDate(): Date
    seconds: number
    nanoseconds: number
  }
}
