# QuickAsk AI - Chrome Extension

A powerful Chrome extension that lets you ask questions about any webpage using Google's Gemini AI. The AI browses the webpage directly to provide accurate, contextual answers.

## Features

- 🚀 **Instant Access**: Press `Ctrl+Shift+Space` on any webpage
- 🤖 **AI-Powered**: Uses Google Gemini AI with web browsing capabilities
- 📋 **Copy Answers**: One-click copy to clipboard
- 💬 **Follow-up Questions**: Continue the conversation with a single click
- 🏷️ **URL Attachment Pill**: Shows the current page title; remove it to ask general questions
- 🎨 **Beautiful, Accessible UI**: Clean, modern interface with dark mode, high contrast, and reduced motion support
- 📱 **Responsive Design**: Works great on all screen sizes
- ⚡ **Fast & Lightweight**: Minimal footprint, maximum performance
- 🛡️ **Privacy First**: No data storage; all processing is local

## Installation

### Method 1: Load as Developer Extension (Recommended for Testing)

1. **Download the Extension**
   - Clone or download this repository to your computer

2. **Open Chrome Extensions**
   - Open Google Chrome
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)

3. **Load the Extension**
   - Click "Load unpacked"
   - Select the folder containing the extension files
   - The extension should appear in your extensions list

4. **Set Up API Key**
   - Get your Gemini API key from https://makersuite.google.com/app/apikey
   - Open `service-worker.js` in a text editor
   - Replace `YOUR_GEMINI_API_KEY_HERE` with your actual API key
   - Reload the extension in Chrome

### Method 2: Chrome Web Store (Future)
*Extension will be available on Chrome Web Store after review process*

## How to Use

1. **Activate**: Navigate to any webpage and press `Ctrl+Shift+Space` (or `Cmd+Shift+Space` on Mac)
2. **Ask Questions**: Type your question or click a suggestion button
3. **URL Attachment Pill**: By default, your question is about the current page (title shown in a pill). Click the "×" on the pill to remove it and ask a general question.
4. **Get Answers**: The AI will browse the webpage and provide contextual answers
5. **Take Actions**: Copy answers, ask follow-ups, or close the interface

## Example Questions

- "What is this page about?"
- "Summarize the main points"
- "What are the key takeaways?"
- "What is the price of [product mentioned]?"
- "Who is the author of this article?"
- "When was this published?"

## Technical Details

### Architecture
- **Manifest V3**: Modern Chrome extension standard
- **Content Script**: Handles UI and user interactions
- **Service Worker**: Manages API calls and commands
- **No Database**: Stateless operation, no data storage

### API Integration
- **Google Gemini 2.5 Flash**: Fast, accurate AI responses
- **Web Browsing**: AI directly accesses webpage content
- **Real-time**: Instant responses with loading indicators and error toasts

### Privacy & Security
- **No Data Storage**: Questions and answers are not saved
- **Secure API**: All communications use HTTPS
- **Local Processing**: UI runs entirely in your browser

### Accessibility & UX
- **Dark Mode, High Contrast, Reduced Motion**: Adapts to your system preferences
- **Keyboard Navigation**: Fully accessible via keyboard
- **ARIA Labels**: Screen reader friendly

## File Structure

```
quickask-ai/
├── manifest.json          # Extension configuration
├── content-script.js      # UI and user interaction logic
├── service-worker.js      # Background API handling
├── styles.css             # Extension styling
├── test-page.html         # Testing page
└── README.md              # This file
```

## Development

### Prerequisites
- Google Chrome (latest version)
- Gemini API key from Google AI Studio

### Local Testing
1. Make changes to the extension files
2. Go to `chrome://extensions/`
3. Click the refresh button on the QuickAsk AI extension
4. Test your changes on any webpage

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Troubleshooting

### Extension Not Loading
- Ensure all files are in the same directory
- Check that manifest.json is valid JSON
- Verify Developer mode is enabled in Chrome

### API Errors
- Confirm Gemini API key is properly set
- Check internet connection
- Verify API key has necessary permissions

### UI Issues
- Try refreshing the extension
- Check browser console for JavaScript errors
- Ensure content scripts are properly injected

## Support

For issues, questions, or feature requests:
1. Check the troubleshooting section above
2. Review the browser console for error messages
3. Ensure you have the latest version of the extension

## License

This project is open source. Please check the license file for details.

---

**Built with ❤️ using Google Gemini AI**