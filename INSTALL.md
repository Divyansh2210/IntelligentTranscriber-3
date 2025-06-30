# Installation Guide - QuickAsk AI Chrome Extension

## Quick Installation Steps

### 1. Prepare Your Environment
Make sure you have:
- Google Chrome browser (latest version)
- A Gemini API key from Google AI Studio (https://makersuite.google.com/app/apikey)

### 2. Get the Extension Files
Either:
- Download this folder to your computer, OR
- Clone the repository: `git clone [repository-url]`

### 3. Install in Chrome

1. **Open Chrome Extensions Page**
   - Type `chrome://extensions/` in your address bar
   - Press Enter

2. **Enable Developer Mode**
   - Look for "Developer mode" toggle in the top-right corner
   - Click to enable it (should turn blue/on)

3. **Load the Extension**
   - Click "Load unpacked" button
   - Navigate to and select the folder containing the extension files
   - Click "Select Folder"

4. **Verify Installation**
   - You should see "QuickAsk AI" appear in your extensions list
   - The extension icon should be visible in your Chrome toolbar

### 4. Configure API Key

**Important**: The extension requires your Gemini API key to work.

**Current Setup**: The extension expects the API key to be available as an environment variable called `GEMINI_API_KEY`.

**For Development/Testing**:
1. Get your API key from https://makersuite.google.com/app/apikey
2. Add it to your system's environment variables as `GEMINI_API_KEY`

### 5. Test the Extension

1. **Go to Any Webpage**
   - Try the included test page: open `test-page.html` in Chrome
   - Or visit any website like Wikipedia, news sites, etc.

2. **Activate QuickAsk AI**
   - Press `Ctrl+Shift+Space` (Windows/Linux)
   - Press `Cmd+Shift+Space` (Mac)

3. **Ask a Question**
   - The input bar should appear at the top of the page
   - Try clicking in the input box to see suggested questions
   - Type a question like "What is this page about?"
   - Press Enter or click the send button

4. **View the Answer**
   - The AI will browse the webpage and provide an answer
   - Use the action buttons to copy the answer or ask follow-ups

## Troubleshooting

### Extension Not Appearing
- Refresh the Chrome extensions page
- Make sure Developer mode is enabled
- Check that all files are in the selected folder

### Keyboard Shortcut Not Working
- Try clicking the extension icon in the toolbar instead
- Check if another extension is using the same shortcut
- Reload the webpage and try again

### API Errors
- Verify your Gemini API key is correctly set as an environment variable
- Check your internet connection
- Make sure the API key has proper permissions

### No Response from AI
- Check the browser's Developer Console (F12) for error messages
- Verify the webpage URL is accessible
- Try asking a simpler question

## Advanced Configuration

### Custom Keyboard Shortcut
1. Go to `chrome://extensions/shortcuts`
2. Find "QuickAsk AI"
3. Click the pencil icon to edit
4. Set your preferred key combination

### Updating the Extension
1. Make changes to the extension files
2. Go back to `chrome://extensions/`
3. Find QuickAsk AI and click the refresh button
4. Your changes will be applied immediately

## File Checklist

Make sure these files are in your extension folder:
- ✅ `manifest.json` - Extension configuration
- ✅ `content-script.js` - Main functionality
- ✅ `service-worker.js` - Background processing
- ✅ `styles.css` - User interface styling

Optional files:
- 📄 `test-page.html` - Testing webpage
- 📄 `README.md` - Documentation
- 📄 `INSTALL.md` - This installation guide

## Support

If you encounter issues:
1. Check this guide's troubleshooting section
2. Look at the browser console for error messages (F12 → Console)
3. Ensure you have the latest version of the extension files

---

**Ready to get started? Follow the steps above and enjoy AI-powered webpage analysis!**