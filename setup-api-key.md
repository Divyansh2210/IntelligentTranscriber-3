# API Key Setup Guide

## Quick Fix for the Extension

You need to replace the placeholder API key with your actual Gemini API key.

### Step 1: Get Your API Key
1. Go to https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key

### Step 2: Update the Extension
1. Open the file `service-worker.js` in a text editor
2. Find this line at the top:
   ```javascript
   const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';
   ```
3. Replace `YOUR_GEMINI_API_KEY_HERE` with your actual API key:
   ```javascript
   const GEMINI_API_KEY = 'your-actual-api-key-here';
   ```

### Step 3: Reload the Extension
1. Go to `chrome://extensions/`
2. Find "QuickAsk AI" extension
3. Click the refresh/reload button
4. The errors should be gone

### Example
Your line should look like this (with your real key):
```javascript
const GEMINI_API_KEY = 'AIzaSyBnVr9hF8K3jXmP2wQ5tR6yU7iO8pL9kM1N';
```

The extension will work immediately after you make this change and reload it!