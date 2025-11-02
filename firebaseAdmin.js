const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require(process.env.GOOGLE_APPLICATION_CREDENTIALS))
  });
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
