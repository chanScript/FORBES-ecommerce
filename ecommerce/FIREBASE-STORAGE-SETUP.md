# Firebase Storage Setup Guide

The server has already been updated to use Firebase Storage instead of Cloudinary.
Follow these steps to get it fully working.

---

## Step 1 — Create a Firebase Project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → give it a name (e.g. `car-marketplace`) → Continue
3. Disable Google Analytics if you don't need it → **Create project**

---

## Step 2 — Enable Firebase Storage

1. In the left sidebar click **Build → Storage**
2. Click **Get started**
3. Choose **Start in production mode** (we will set rules below)
4. Select a region close to your users → **Done**

---

## Step 3 — Set Storage Rules (allow public reads)

In the Firebase console go to **Storage → Rules** and paste:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Anyone can read (view images and documents)
    match /{allPaths=**} {
      allow read: if true;
      // Only allow writes from the server via Admin SDK (no direct client writes)
      allow write: if false;
    }
  }
}
```

Click **Publish**.

> The Admin SDK bypasses these rules entirely, so your server can still upload/delete files.

---

## Step 4 — Generate a Service Account Key

1. In the Firebase console click the ⚙️ gear → **Project settings**
2. Go to the **Service accounts** tab
3. Click **Generate new private key** → **Generate key**
4. A JSON file will download — keep it safe, **never commit it to git**

---

## Step 5 — Add Environment Variables to the Server

Open `ecommerce/server/.env` and add these 2 variables:

```env
# Firebase Storage
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}
```

### Where to find the values:

| Variable                       | Where to find it                                                                                                                                       |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `FIREBASE_STORAGE_BUCKET`      | Firebase console → Storage → the bucket URL shown is `gs://YOUR-BUCKET-NAME` → copy just `YOUR-BUCKET-NAME` (e.g. `car-marketplace-12345.appspot.com`) |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Paste the **entire contents** of the JSON file you downloaded in Step 4, on a single line                                                              |

### Alternative: use the JSON file directly (local dev only)

Instead of the env var, you can place the downloaded JSON file at:

```
ecommerce/server/firebase-service-account.json
```

Add this line to `ecommerce/server/.gitignore`:

```
firebase-service-account.json
```

---

## Step 6 — Restart the Server

```bash
cd ecommerce/server
npm run dev
```

---

## How It Works (what was changed)

| Before                                  | After                                         |
| --------------------------------------- | --------------------------------------------- |
| `cloudinary` package                    | `firebase-admin` package                      |
| `src/config/cloudinary.js`              | `src/config/firebase.js`                      |
| `uploadToCloudinary(buffer)`            | `uploadToFirebase(buffer, mimetype)`          |
| `uploadDocToCloudinary(buffer, name)`   | `uploadDocToFirebase(buffer, name, mimetype)` |
| `cloudinary.uploader.destroy(publicId)` | `deleteFromFirebase(publicId)`                |

**Files updated:**

- `src/config/firebase.js` — new Firebase Admin SDK config
- `src/middleware/upload.middleware.js` — all upload/delete functions now use Firebase Storage
- `src/controllers/listing.controller.js` — image upload + delete use Firebase
- `src/controllers/document.controller.js` — document upload uses Firebase
- `src/controllers/submission.controller.js` — submission image upload uses Firebase
- `src/controllers/admin.controller.js` — force-delete listing removes images from Firebase

**Where files are stored in Firebase Storage:**

- Listing/submission images → `car-marketplace/images/`
- Documents (PDF, etc.) → `car-marketplace/documents/`

---

## Troubleshooting

**Error: `Cannot find module 'firebase-service-account.json'`**
→ Either place the JSON file at `ecommerce/server/firebase-service-account.json` or set the `FIREBASE_SERVICE_ACCOUNT_KEY` env var.

**Error: `The bucket does not exist`**
→ Check `FIREBASE_STORAGE_BUCKET` — it should look like `your-project-id.appspot.com` (no `gs://` prefix).

**Error: `PERMISSION_DENIED: Firebase Storage: User does not have permission`**
→ The service account JSON may be wrong or the bucket name is incorrect.

**Images not showing (broken URLs)**
→ Make sure the Storage Rules in Step 3 allow public reads (`allow read: if true`).
