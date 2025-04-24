import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "../components/firebase/Firebase";

export const migrateUsernames = async () => {
  try {
    // Get all documents from the users collection
    const usersSnapshot = await getDocs(collection(db, "users"));
    const usernames = new Set(); // Using Set to avoid duplicates

    // Extract all unique usernames
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      if (userData.name) {
        usernames.add(userData.name);
      }
    });

    // Convert Set to Array for storage
    const usernamesArray = Array.from(usernames);

    // Create a new document in the usernames collection
    await setDoc(doc(db, "usernames", "names"), {
      usernames: usernamesArray,
      count: usernamesArray.length,
      lastUpdated: new Date().toISOString()
    });

    console.log(`Successfully migrated ${usernamesArray.length} usernames`);
    return usernamesArray.length;
  } catch (error) {
    console.error("Error migrating usernames:", error);
    throw error;
  }
}; 