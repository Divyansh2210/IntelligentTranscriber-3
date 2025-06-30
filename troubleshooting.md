# Troubleshooting Guide - QuickAsk AI Extension

## "Could not establish connection" Error

This error typically occurs when the content script can't communicate with the service worker. Here's how to diagnose and fix it:

### Step 1: Check Service Worker Status

1. Go to `chrome://extensions/`
2. Find "QuickAsk AI" extension
3. Click "service worker" link (should show "active" status)
4. Check the console for any error messages

### Step 2: Verify API Key Setup

1. Open `service-worker.js` in a text editor
2. Make sure line 2 looks like this:
   ```javascript
   const GEMINI_API_KEY = 'your-actual-api-key-here';
   ```
   (Replace with your real API key from https://makersuite.google.com/app/apikey)

### Step 3: Check Browser Console

1. Open any webpage
2. Press F12 to open Developer Tools
3. Go to Console tab
4. Try using the extension (Ctrl+Shift+Space)
5. Look for these messages:
   - "QuickAsk AI content script initialized"
   - "QuickAsk AI service worker loaded"

### Step 4: Reload Extension

1. Go to `chrome://extensions/`
2. Find QuickAsk AI
3. Click the refresh/reload button
4. Try using the extension again

### Step 5: Test Step by Step

1. **Test keyboard shortcut:**
   - Press Ctrl+Shift+Space
   - Input bar should appear at top of page

2. **Test service worker:**
   - Enter a question in the input bar
   - Check console for "Submitting question:" message

3. **Test API connection:**
   - Look for "Service worker received message:" in console
   - Should see "Making API request to Gemini..." message

### Common Issues and Solutions

#### Issue: Service worker not loading
**Solution:** 
- Check manifest.json for syntax errors
- Reload the extension
- Restart Chrome if needed

#### Issue: API key not configured
**Solution:**
- Replace 'YOUR_GEMINI_API_KEY_HERE' with actual key
- Make sure key is valid (test at https://makersuite.google.com)

#### Issue: Content script not injecting
**Solution:**
- Check if webpage allows content scripts
- Try on a different website
- Refresh the page after reloading extension

#### Issue: Network/CORS errors
**Solution:**
- Check internet connection
- Verify Gemini API is accessible
- Check if firewall is blocking requests

### Debug Commands

Run these in the browser console to test:

```javascript
// Test if content script loaded
console.log('QuickAsk loaded:', !!window.quickAskAI);

// Test service worker communication
chrome.runtime.sendMessage({action: 'test'}, (response) => {
  console.log('Service worker response:', response);
});
```

### If Nothing Works

1. Completely remove the extension
2. Restart Chrome
3. Reload the extension with Developer mode
4. Check all file permissions
5. Try on a simple webpage like google.com

### Getting Help

If you're still having issues:

1. Note which step in the troubleshooting failed
2. Share any console error messages
3. Verify your API key works at https://makersuite.google.com
4. Try the extension on different websites

The most common cause is either:
- Missing/incorrect API key
- Service worker not properly loaded
- Browser cache issues (solved by reloading extension)