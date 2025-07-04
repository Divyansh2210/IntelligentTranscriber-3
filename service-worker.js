// Hardcoded Gemini API key - replace with your actual key
const GEMINI_API_KEY = 'AIzaSyCKiXEolpOzzgqqkWQQO3fW3LKTluPDos0';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Service worker startup log
console.log('QuickAsk AI service worker loaded');

// Listen for keyboard command
chrome.commands.onCommand.addListener((command) => {
  if (command === 'open-quickask') {
    // Get the active tab and inject the UI
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        ensureContentScript(tabs[0].id, () => {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'showInput' });
        });
      }
    });
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Service worker received message:', request);
  
  if (request.action === 'askQuestion') {
    handleQuestionRequest(request, sender, sendResponse);
    return true; // Keep message channel open for async response
  }
  
  // Return false for unknown actions
  return false;
});

async function handleQuestionRequest(request, sender, sendResponse) {
  console.log('handleQuestionRequest called with:', request);
  try {
    const { question, url } = request;
    if (!question) {
      console.log('Missing question');
      sendResponse({ 
        success: false, 
        error: 'Missing question' 
      });
      return;
    }
    // Check if API key is available
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_api_key_here') {
      console.log('API key not configured');
      sendResponse({ 
        success: false, 
        error: 'API key not configured. Please replace YOUR_GEMINI_API_KEY_HERE with your actual Gemini API key in service-worker.js.' 
      });
      return;
    }
    console.log('Making API request to Gemini...');
    let prompt;
    if (url) {
      // Existing behavior: ask about the webpage
      prompt = `You are QuickAsk AI, an assistant that answers questions about webpages. I need you to browse the webpage at the URL provided below and then answer the user's question based on the actual content of that webpage.\n\nPlease browse this webpage: ${url}\n\nUser Question: ${question}\n\nInstructions:\n1. First, browse and read the content of the webpage at the provided URL\n2. Then answer the user's question based on the actual content you found on that page\n3. If you cannot access the webpage or find the specific information to answer the question, let the user know what you could not find and ask them if they can look for the information without referring to the webpage.\n4. Provide a helpful and accurate answer based on the real webpage content.`;
    } else {
      // New behavior: answer the question directly, no reference to webpage
      prompt = `You are QuickAsk AI, an assistant that answers user questions.\n\nUser Question: ${question}\n\nInstructions:\n1. Answer the user's question as helpfully and accurately as possible.\n2. Do not reference any webpage or URL.\n3. If you need more context, ask the user for clarification.`;
    }
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 20000,
        }
      })
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API request failed: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
    }
    const data = await response.json();
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const answer = data.candidates[0].content.parts[0].text;
      console.log('Gemini API response received successfully');
      sendResponse({ 
        success: true, 
        answer: answer 
      });
    } else {
      console.log('Invalid response format from Gemini API:', data);
      throw new Error('Invalid response format from Gemini API');
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    let errorMessage = 'Failed to get AI response. ';
    if (error.message.includes('API request failed')) {
      errorMessage += 'Please check your internet connection and API key.';
    } else if (error.message.includes('Invalid response')) {
      errorMessage += 'Received unexpected response from AI service.';
    } else {
      errorMessage += error.message;
    }
    console.log('Sending error response:', errorMessage);
    sendResponse({ 
      success: false, 
      error: errorMessage 
    });
  }
}

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, { action: 'showInput' });
});

function ensureContentScript(tabId, callback) {
  chrome.tabs.sendMessage(tabId, { ping: true }, (response) => {
    if (chrome.runtime.lastError) {
      // Content script not present, inject it
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content-script.js']
      }, () => {
        // After injection, call the callback
        callback();
      });
    } else {
      // Content script is present
      callback();
    }
  });
}
