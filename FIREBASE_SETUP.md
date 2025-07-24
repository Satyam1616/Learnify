# 🔥 Firebase Setup Guide for Learnify

This guide will help you set up Firebase Firestore for your forms data storage.

## 📋 Quick Setup (5 minutes)

### 1. **Create Firebase Project**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Create a project"**
3. Enter project name: `learnify-forms` (or your choice)
4. Disable Google Analytics (not needed for forms)
5. Click **"Create project"**

### 2. **Enable Firestore Database**
1. In your Firebase project, go to **"Firestore Database"**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (we'll secure it later)
4. Select your region (choose closest to your users)
5. Click **"Done"**

### 3. **Generate Service Account**
1. Go to **Project Settings** (gear icon)
2. Click **"Service accounts"** tab
3. Click **"Generate new private key"**
4. Save the downloaded JSON file as `firebase-service-account.json`
5. Move this file to your `server/` directory

### 4. **Configure Environment**

**Option A: Development (Easy)**
```bash
# Copy the service account file to server directory
mv ~/Downloads/your-project-firebase-adminsdk-xxxxx.json server/firebase-service-account.json

# Enable Firebase in development
echo "USE_FIREBASE=true" >> .env
```

**Option B: Production (Secure)**
```bash
# Set environment variable with the entire JSON content
export FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"your-project",...}'
```

### 5. **Test the Setup**
```bash
# Start your server
npm run dev

# Test contact form submission
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com", 
    "phoneNumber": "1234567890",
    "programInterest": "Job-Bridge Program",
    "message": "Test message"
  }'
```

## 📊 View Your Data

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click **"Firestore Database"**
4. You'll see collections:
   - `contact_submissions` - Contact form data
   - `newsletter_subscriptions` - Newsletter emails
   - `course_enrollments` - Course enrollment data

## 🚀 Production Deployment

### Netlify/Vercel
Add environment variable:
```
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your-project",...}
```

### Railway/Render
```bash
# Set the environment variable
railway variables set FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
```

## 🔒 Security Rules (Optional)

Update Firestore rules for better security:

```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow writes to form collections, no reads from frontend
    match /{collection}/{document} {
      allow write: if collection in ['contact_submissions', 'newsletter_subscriptions', 'course_enrollments'];
      allow read: if false; // Only backend can read
    }
  }
}
```

## 🔄 Migration to PostgreSQL (Future)

The current setup uses the same interface, so migrating to PostgreSQL later requires only:

1. Update `storage.ts` to use PostgreSQL connection
2. Change environment variables
3. No frontend changes needed!

## ❓ Troubleshooting

**Error: "Firebase service account not found"**
- Make sure `firebase-service-account.json` is in the `server/` directory
- Or set `FIREBASE_SERVICE_ACCOUNT_KEY` environment variable

**Error: "Permission denied"**
- Check Firestore security rules
- Ensure service account has proper permissions

**Forms not saving?**
- Check server logs for Firebase errors
- Verify internet connection
- Test Firebase connection manually

## 📈 Benefits

✅ **Real-time data** - See form submissions instantly  
✅ **Scalable** - Handles thousands of forms  
✅ **Free tier** - 50k reads, 20k writes daily  
✅ **Admin dashboard** - Built-in Firebase console  
✅ **Easy migration** - Same API for future PostgreSQL  

Happy coding! 🚀