import { auth } from "../firebase";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";

const provider = new GoogleAuthProvider();
// Always show the account chooser: admins are usually signed into a personal
// account too, and silently reusing the wrong one just looks like a denial.
provider.setCustomParameters({ prompt: "select_account" });

export const signInWithGoogle = () => signInWithPopup(auth, provider);

export const signOutOfGoogle = () => signOut(auth);

/** Calls back with the user (or null) and returns the unsubscribe function. */
export const subscribeToAuth = (callback) => onAuthStateChanged(auth, callback);
