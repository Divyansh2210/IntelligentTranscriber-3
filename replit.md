# QuickAsk AI - Chrome Extension

## Overview

QuickAsk AI is a minimal Chrome extension that enables users to ask questions about any webpage using Google's Gemini AI. The extension uses a simple keyboard shortcut to trigger a floating input interface, sends the webpage URL to Gemini AI for browsing and analysis, and returns AI-powered answers in real-time.

## System Architecture

### Extension Architecture
- **Manifest V3 Chrome Extension**: Modern Chrome extension architecture with service worker
- **Content Script Pattern**: Injects UI and handles page interactions
- **Service Worker**: Manages API calls and extension lifecycle
- **Direct API Integration**: Communicates directly with Google Gemini API

### Core Components
1. **Content Script** (`content-script.js`): Handles UI rendering and user interactions
2. **Service Worker** (`service-worker.js`): Manages API communications and keyboard commands
3. **Manifest** (`manifest.json`): Defines extension permissions and configuration
4. **Styles** (`styles.css`): Provides minimal, non-intrusive UI styling

## Key Components

### Frontend (Content Script)
- **QuickAskAI Class**: Main UI controller that manages input bar and answer display
- **Floating Input Bar**: Minimal, centered input interface with submit/close buttons
- **Answer Bubble**: Dismissible display for AI responses
- **Event Handling**: Keyboard shortcuts and user interactions

### Backend (Service Worker)
- **API Integration**: Direct communication with Google Gemini 2.5 Flash model
- **Command Handling**: Processes keyboard shortcuts (`Ctrl+Shift+Space`)
- **Message Passing**: Coordinates between content script and background processes
- **Error Handling**: Basic error management for API failures

### UI/UX Design
- **Minimal Footprint**: Input bar ≤ 600×48px, answer bubble ≤ 40% viewport
- **Non-Intrusive**: Fixed positioning with high z-index to avoid conflicts
- **Accessibility**: ARIA labels and keyboard navigation support

## Data Flow

1. **User Activation**: User presses keyboard shortcut (`Ctrl+Shift+Space`)
2. **UI Injection**: Service worker sends message to content script to show input bar
3. **URL Collection**: Content script captures current webpage URL
4. **Question Submission**: User enters question and submits via input bar
5. **API Processing**: Service worker sends URL and question to Gemini API with instructions to browse the webpage
6. **Web Browsing**: Gemini AI browses the webpage URL and analyzes its content
7. **Response Display**: Answer based on actual webpage content is returned and displayed in dismissible bubble
8. **Cleanup**: User can close interface or it auto-dismisses

## External Dependencies

### Primary Dependencies
- **Google Gemini API**: Core AI functionality via `@google/genai` (v1.7.0)
- **Chrome Extension APIs**: `activeTab`, `scripting` permissions
- **Google Auth Library**: Authentication for Gemini API calls

### API Integration
- **Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`
- **Authentication**: API key-based (hardcoded in service-worker.js)
- **Model**: Gemini 2.5 Flash for optimal speed/performance balance
- **Web Browsing**: Leverages Gemini's built-in web browsing capabilities to access webpage content

## Deployment Strategy

### Development Setup
1. Install dependencies: `npm install`
2. Set Gemini API key in environment variables
3. Load extension in Chrome developer mode

### Production Considerations
- API key is securely managed through environment variables
- Extension needs Chrome Web Store publication
- No user configuration required - hardcoded API key approach

### Browser Compatibility
- **Primary**: Chrome (Manifest V3)
- **Future**: Firefox/Edge support out of scope for MVP

## Changelog

Changelog:
- June 30, 2025. Initial setup
- June 30, 2025. Updated to use URL-based approach - Gemini AI now browses webpages directly instead of extracting DOM content
- June 30, 2025. Removed storage permissions and hardcoded API key approach as requested
- June 30, 2025. Enhanced UI with action buttons (copy answer, follow-up questions), improved loading states
- June 30, 2025. Added quick suggestion buttons for common questions
- June 30, 2025. Improved error handling and user feedback
- June 30, 2025. Fixed Chrome extension service worker issues - removed process.env dependency and hardcoded API key

## User Preferences

Preferred communication style: Simple, everyday language.