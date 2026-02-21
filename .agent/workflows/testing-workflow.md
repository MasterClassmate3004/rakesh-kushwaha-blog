---
description: Comprehensive testing workflow for all blog features
---

# Blog System Testing Workflow

Follow these steps to verify that every page, feature, and interaction is working correctly.

## 1. Initial State & Cookie Consent
- [ ] Open the website (`/`).
- [ ] **Wait 2 seconds**: Confirm the "Cookies & Privacy" banner appears at the bottom.
- [ ] Click **"Accept All"**: Confirm the banner disappears and does not reappear on refresh.

## 2. Authentication Flow (Guest to User)
- [ ] Go to the **Register** page.
- [ ] Fill in name, email, and password.
- [ ] Click **"Register"**: Confirm the **Terms & Conditions** dialog pops up.
- [ ] Test **"Cancel"**: The dialog should close without creating an account.
- [ ] Click **"Register"** again and click **"I Accept All Terms"**: Confirm you are automatically logged in and redirected to home.

## 3. Login & Error Handling
- [ ] Sign out (via the Profile page).
- [ ] Go to the **Login** page.
- [ ] Enter a **wrong password**: Confirm a red error message appears with a **"shake" animation**.
- [ ] Enter correct credentials: Confirm you are redirected back to the home page or admin dashboard (if you are the admin).

## 4. Blog & Interactions (Liquid Flow)
- [ ] **Hover over a blog title**: Verify the blue color "flows like liquid" from left to right.
- [ ] **Hover out**: Verify the title snaps back to white immediately.
- [ ] Click a post to open it: Confirm the page transition is smooth.

## 5. Comments Section
- [ ] Scroll to the bottom of a blog post.
- [ ] **Add a comment**: Confirm you see a message saying "Comment submitted successfully! It will appear after admin approval."
- [ ] **Verify Profile Photo**: Ensure your profile photo (or a colorful auto-avatar) is visible next to your name in the comment list.
- [ ] **Check Layout**: Confirm the navbar has a **blue underline** indicator for the active page.

## 6. Profile Management
- [ ] Navigate to the **Profile** page.
- [ ] **Upload a Profile Image**: Select a file and click "Save Changes".
- [ ] Confirm the photo updates in the Navbar and About page.
- [ ] **Sign Out**: Use the button on the Profile page to log out.

## 7. Admin Features
- [ ] Log in as the Admin user.
- [ ] Confirm the **"Dashboard"** link appears in the navbar.
- [ ] Navigate to `/admin`: Confirm you can see and manage blog posts and comments.
- [ ] Verify the active blue underline is present for the "Dashboard" link.
