require("dotenv").config();
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });
var admin = require("firebase-admin");

var serviceAccount = JSON.parse(process.env.GOOGLE_CREDS);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "eyequila-co-working.firebasestorage.app",
});

const bucket = admin.storage().bucket();
const auth = admin.auth();

module.exports = { admin, bucket, auth };
