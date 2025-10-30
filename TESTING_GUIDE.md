# Testing Your Firebase Integration

## ✅ Firebase Integration Complete!

Your website now uses Firebase for:
- **User Authentication** (signup/login)
- **Product Reviews** (stored in Firestore)
- **Newsletter Subscriptions** (stored in Firestore)

---

## 🧪 How to Test Locally

### Step 1: Open Your Website

**Option A: Simple (Works for most cases)**
1. Navigate to: `C:\Users\itzra\ClothingWebsite`
2. Double-click `index.html`
3. It will open in your default browser

**Option B: Local Server (Recommended for Firebase)**
If you have Python installed:
```bash
cd C:\Users\itzra\ClothingWebsite
python -m http.server 8000
```
Then open: http://localhost:8000

Or use VS Code "Live Server" extension.

---

### Step 2: Test User Signup

1. Click **"Account"** in the navigation
2. Click **"Sign Up"** tab
3. Fill in:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `test123` (minimum 6 characters)
   - Confirm Password: `test123`
4. Click **"Sign Up"**
5. ✅ You should see: "Account created successfully!"
6. ✅ Page should show "Welcome, Test User!"

**Verify in Firebase:**
- Go to: https://console.firebase.google.com
- Click your project
- Click "Authentication" → "Users" tab
- You should see `test@example.com` listed!

---

### Step 3: Test Login

1. Click the **Logout** button
2. You should see: "Logged out successfully"
3. Click **"Login"** tab
4. Enter:
   - Email: `test@example.com`
   - Password: `test123`
5. Click **"Login"**
6. ✅ You should see: "Login successful!"
7. ✅ Account link should show "Test User" instead of "Account"

---

### Step 4: Test Reviews

1. Click **"Catalog"** in navigation
2. Click on any product (e.g., "Flower Pedal Crew Neck")
3. Scroll down to "Customer Reviews" section
4. ✅ Review form should be visible (you're logged in)
5. Fill out review:
   - Click 5 stars
   - Comment: "Great quality! Love the design."
6. Click **"Submit Review"**
7. ✅ You should see: "Review submitted successfully!"
8. ✅ Your review should appear at the top

**Verify in Firebase:**
- Go to Firebase Console
- Click "Firestore Database"
- You should see a **"reviews"** collection
- Click on it to see your review!

---

### Step 5: Test Reviews Visibility (Different Browser)

1. Open a **different browser** (or Incognito/Private window)
2. Go to your website
3. Click "Catalog" → Click same product
4. Scroll to reviews
5. ✅ You should see the review you just wrote!
6. ✅ But you should see "Please login to write a review" (not logged in)

**This proves reviews are stored in Firebase and visible to everyone!**

---

### Step 6: Test Newsletter Subscription

1. Scroll to the bottom footer
2. Find "Stay Connected" section
3. Enter email: `newsletter@example.com`
4. Click **"Subscribe"**
5. ✅ You should see: "Successfully subscribed to newsletter!"

**Verify in Firebase:**
- Go to Firebase Console → Firestore Database
- You should see a **"newsletter"** collection
- Click on it to see the email!

---

## 🔍 Troubleshooting

### "Firebase is not defined" Error

**Check Browser Console** (Press F12):
- If you see this error, Firebase scripts didn't load
- Make sure you're connected to the internet
- Try refreshing the page

**Fix:**
- Open `index.html`
- Make sure these lines appear BEFORE `<script src="js/script.js">`:
```html
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>
<script src="js/firebase-config.js"></script>
```

---

### "Permission Denied" Error

**This means Firestore security rules aren't set correctly.**

**Fix:**
1. Go to Firebase Console → Firestore Database
2. Click "Rules" tab
3. Copy and paste these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to read reviews
    match /reviews/{reviewId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Allow anyone to write to newsletter
    match /newsletter/{emailId} {
      allow write: if true;
      allow read: if false;
    }
  }
}
```

4. Click **"Publish"**

---

### "Email already in use" Error

This means you already created an account with that email.

**Fix:**
- Try logging in instead of signing up
- Or use a different email

---

### Reviews Not Showing Up

**Check:**
1. Make sure you're logged in when submitting
2. Open browser console (F12) and look for errors
3. Check Firestore in Firebase Console to see if data was saved

---

## 📊 View Your Data in Firebase

### See All Users:
1. Firebase Console → Authentication → Users
2. You'll see all registered users

### See All Reviews:
1. Firebase Console → Firestore Database
2. Click "reviews" collection
3. See all product reviews

### See Newsletter Emails:
1. Firebase Console → Firestore Database
2. Click "newsletter" collection
3. See all subscribed emails

---

## 🚀 Next Step: Deploy to Netlify

Once testing works locally, you're ready to deploy!

See the **FIREBASE_SETUP_GUIDE.md** file for Netlify deployment instructions (Part 4).

---

## ✅ Testing Checklist

- [ ] Website opens without errors
- [ ] Can create a new account
- [ ] Can see user in Firebase Console → Authentication
- [ ] Can logout successfully
- [ ] Can login with same account
- [ ] Can submit a review (while logged in)
- [ ] Can see review in Firebase Console → Firestore
- [ ] Can see review on different browser/device
- [ ] Can subscribe to newsletter
- [ ] Can see newsletter email in Firebase Console

**If all checkmarks complete → Ready to deploy!** 🎉
