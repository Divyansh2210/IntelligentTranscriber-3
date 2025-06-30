// Get Gemini API key from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// Listen for keyboard command
chrome.commands.onCommand.addListener((command) => {
  if (command === 'open-quickask') {
    // Get the active tab and inject the UI
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'showInput' });
      }
    });
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'askQuestion') {
    handleQuestionRequest(request, sender, sendResponse);
    return true; // Keep message channel open for async response
  }
});

async function handleQuestionRequest(request, sender, sendResponse) {
  try {
    const { question, url } = request;
    
    if (!question || !url) {
      sendResponse({ 
        success: false, 
        error: 'Missing question or URL' 
      });
      return;
    }

    // Create the prompt that asks Gemini to browse the webpage
    const prompt = `You are QuickAsk AI, an assistant that answers questions about webpages. I need you to browse the webpage at the URL provided below and then answer the user's question based on the actual content of that webpage.

Please browse this webpage: ${url}

User Question: ${question}

Instructions:
1. First, browse and read the content of the webpage at the provided URL
2. Then answer the user's question based on the actual content you found on that page
3. If you cannot access the webpage or find the specific information, let the user know what you were unable to access
4. Provide a helpful and accurate answer based on the real webpage content`;

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
          maxOutputTokens: 1024,
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
      sendResponse({ 
        success: true, 
        answer: answer 
      });
    } else {
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
