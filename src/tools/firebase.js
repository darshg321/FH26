import { db } from "../firebase";
import {
  doc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

// Adds registration under: registrationsBySchool / {school}
// Inside the document: { safeEmailKey: { userObj } }
export const addRegistrationGroupedBySchool = async ({
  fullName,
  schoolEmail,
  personalEmail,
  school,
  experience,
  tshirtSize,
  dietaryRestrictions,
  additionalQuestions,
}) => {
  const userObj = {
    fullName,
    schoolEmail,
    personalEmail,
    school,
    experience,
    tshirtSize,
    dietaryRestrictions,
    additionalQuestions,
  };

  const safeEmailKey = schoolEmail.trim().toLowerCase().replaceAll(".", "_");

  const schoolDocRef = doc(db, "registrationsBySchool", school);

  await setDoc(
    schoolDocRef,
    {
      [safeEmailKey]: userObj,
    },
    { merge: true }
  );

  return true;
};

/** FraserHacks 2027 interest list: one document per signup, keyed by email. */
export const INTEREST_COLLECTION = "interest2027";

const emailKey = (email) => email.trim().toLowerCase().replaceAll(".", "_");

// Re-submitting with the same email updates that entry instead of duplicating it.
export const addInterest2027 = async ({ fullName, email, grade, school }) => {
  await setDoc(doc(db, INTEREST_COLLECTION, emailKey(email)), {
    fullName: fullName.trim(),
    email: email.trim(),
    grade,
    school,
    submittedAt: serverTimestamp(),
  });

  return true;
};

export const fetchInterest2027 = async () => {
  const snapshot = await getDocs(collection(db, INTEREST_COLLECTION));

  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
};

/**
 * Admin allowlist. The document ID is the lowercased Google account email —
 * firestore.rules checks for its existence, so this collection is the single
 * source of truth for who can read the interest list.
 */
export const ADMINS_COLLECTION = "admins";

const adminKey = (email) => email.trim().toLowerCase();

export const fetchAdmins = async () => {
  const snapshot = await getDocs(collection(db, ADMINS_COLLECTION));

  return snapshot.docs
    .map((docSnap) => ({ email: docSnap.id, ...docSnap.data() }))
    .sort((a, b) => a.email.localeCompare(b.email));
};

export const addAdmin = async (email, addedBy) => {
  await setDoc(doc(db, ADMINS_COLLECTION, adminKey(email)), {
    addedBy: addedBy ?? null,
    addedAt: serverTimestamp(),
  });

  return true;
};

export const removeAdmin = async (email) => {
  await deleteDoc(doc(db, ADMINS_COLLECTION, adminKey(email)));

  return true;
};

// Checks if school email exists in any school document (one registration per school email globally)
export const emailExistsGlobally = async (schoolEmail) => {
  if (!schoolEmail) return false;

  const safeEmailKey = schoolEmail.trim().toLowerCase().replaceAll(".", "_");

  const snapshot = await getDocs(collection(db, "registrationsBySchool"));

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    if (data && data[safeEmailKey] !== undefined) {
      return true;
    }
  }

  return false;
};

