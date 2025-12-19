# Firebase Setup Guide

This guide will help you set up Firebase Authentication and Firestore for your crowdfunding platform.

## Prerequisites

1. A Google account
2. Node.js and npm installed
3. Go 1.25+ installed

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard:
   - Enter a project name (e.g., "crowdfunding-platform")
   - Enable Google Analytics (optional)
   - Click "Create project"

## Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication** > **Get started**
2. Enable **Email/Password** authentication:
   - Click on "Email/Password"
   - Toggle "Enable" and click "Save"
3. (Optional) Enable **Google**, **Facebook**, and **Apple** sign-in:
   - Click on each provider
   - Follow the setup instructions
   - Add authorized domains

## Step 3: Create Firestore Database

1. Go to **Firestore Database** > **Create database**
2. Choose **Start in production mode** (or test mode for development)
3. Select a location for your database
4. Click "Enable"

## Step 4: Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click the web icon (`</>`) to add a web app
4. Register your app with a nickname
5. Copy the Firebase configuration object

## Step 5: Configure Environment Variables

### Frontend (.env.local)

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

NEXT_PUBLIC_API_URL=http://localhost:8090
```

### Backend (server/.env)

Create a `server/.env` file:

```env
PORT=8090
ALLOWED_ORIGIN=http://localhost:3000
GOOGLE_APPLICATION_CREDENTIALS=./israelfirebase.json
```

## Step 6: Download Service Account Key

1. In Firebase Console, go to **Project Settings** > **Service accounts**
2. Click "Generate new private key"
3. Download the JSON file
4. Rename it to `israelfirebase.json`
5. Place it in the `server/` directory

**⚠️ Important:** Never commit this file to version control! Add it to `.gitignore`

## Step 7: Install Dependencies

### Frontend
```bash
npm install
# or
pnpm install
```

### Backend
```bash
cd server
go mod download
```

## Step 8: Run the Application

### Start the Go Backend
```bash
cd server
go run cmd/api/main.go
```

The server will start on `http://localhost:8090`

### Start the Next.js Frontend
```bash
npm run dev
# or
pnpm dev
```

The frontend will start on `http://localhost:3000`

## Step 9: Configure Firebase Security Rules

### Firestore Rules

Go to **Firestore Database** > **Rules** and update:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Campaigns: public read, authenticated write
    match /campaigns/{campaignId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        resource.data.ownerId == request.auth.uid;
    }
    
    // Donations: authenticated read/write
    match /donations/{donationId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
  }
}
```

### Storage Rules (if using Firebase Storage)

Go to **Storage** > **Rules**:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **"Firebase: Error (auth/configuration-not-found)"**
   - Check that all environment variables are set correctly
   - Restart your Next.js dev server after changing `.env.local`

2. **"Auth client not initialized" (Go backend)**
   - Ensure `israelfirebase.json` is in the `server/` directory
   - Check that `GOOGLE_APPLICATION_CREDENTIALS` points to the correct file

3. **CORS errors**
   - Update `ALLOWED_ORIGIN` in `server/.env` to match your frontend URL
   - Ensure the Go server is running

4. **Email verification not working**
   - Check Firebase Authentication > Templates
   - Ensure email action URLs are configured
   - Add your domain to authorized domains in Firebase Console

## Next Steps

- Set up email templates in Firebase Console
- Configure OAuth providers (Google, Facebook, Apple)
- Set up Firebase Hosting for production deployment
- Configure custom domain for authentication

## Security Best Practices

1. ✅ Never commit service account keys to version control
2. ✅ Use environment variables for all sensitive data
3. ✅ Regularly rotate API keys
4. ✅ Enable Firebase App Check for production
5. ✅ Review and update security rules regularly
6. ✅ Use HTTPS in production
7. ✅ Implement rate limiting on your Go backend

## Support

For more information, visit:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)

