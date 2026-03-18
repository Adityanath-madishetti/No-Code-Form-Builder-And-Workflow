import admin from "firebase-admin";
import { readFileSync } from "fs";

/**
 * Initialize Firebase Admin SDK.
 *
 * Expects one of:
 *   - FIREBASE_SERVICE_ACCOUNT_PATH  env var pointing to a JSON file
 *   - FIREBASE_SERVICE_ACCOUNT       env var containing the JSON string
 *
 * Falls back to Application Default Credentials if neither is set
 * (works on GCP / Cloud Run / Firebase Hosting).
 */
function initFirebaseAdmin() {
    // Already initialized — return the existing app
    if (admin.apps.length) {
        return admin;
    }

    const filePath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    const jsonString = process.env.FIREBASE_SERVICE_ACCOUNT;

    if (filePath) {
        const serviceAccount = JSON.parse(readFileSync(filePath, "utf8"));
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    } else if (jsonString) {
        const serviceAccount = JSON.parse(jsonString);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    } else {
        // Application Default Credentials
        admin.initializeApp();
    }

    return admin;
}

export default initFirebaseAdmin();
