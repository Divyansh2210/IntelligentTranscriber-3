class QuickAskAI {
  constructor() {
    this.isVisible = false;
    this.container = null;
    this.inputBar = null;
    this.answerBubble = null;
    this.isLoading = false;
    this.urlAttached = true;
    this.currentUrl = window.location.href;
    
    this.init();
  }

  init() {
    console.log('QuickAsk AI content script initialized');
    
    // Listen for messages from service worker
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log('Content script received message:', request);
      if (request.action === 'showInput') {
        this.toggleInput();
      }
    });

    // Create the UI elements but don't show them yet
    this.createUI();
  }

  createUI() {
    // Create main container
    this.container = document.createElement('div');
    this.container.id = 'quickask-container';
    this.container.style.display = 'none';

    // Create input bar
    this.inputBar = document.createElement('div');
    this.inputBar.id = 'quickask-input-bar';
    this.inputBar.innerHTML = `
      <div class="quickask-input-wrapper">
        <input 
          type="text" 
          id="quickask-input" 
          placeholder="Ask anything about this webpage..."
          aria-label="Ask a question about this webpage"
          maxlength="500"
        />
      </div>
      <button id="quickask-submit" aria-label="Submit question">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22,2 15,22 11,13 2,9"></polygon>
        </svg>
      </button>
      <button id="quickask-close" aria-label="Close QuickAsk">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;

    // Create answer bubble (initially hidden)
    this.answerBubble = document.createElement('div');
    this.answerBubble.id = 'quickask-answer-bubble';
    this.answerBubble.style.display = 'none';

    // Add URL attachment UI
    // Get the page title and truncate if needed
    const pageTitle = document.title.length > 32 ? document.title.slice(0, 29) + '…' : document.title;
    this.urlAttachment = document.createElement('div');
    this.urlAttachment.id = 'quickask-url-attachment';
    this.urlAttachment.innerHTML = `
      <span id="quickask-title-chip-text" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px;display:inline-block;vertical-align:middle;">
        ${pageTitle}
      </span>
      <button id="quickask-remove-url" aria-label="Remove" style="all:unset;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;margin-left:4px;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;
    // Insert URL attachment as a child of the input wrapper
    const inputWrapper = this.inputBar.querySelector('.quickask-input-wrapper');
    inputWrapper.appendChild(this.urlAttachment);
    // Add to container
    this.container.appendChild(this.inputBar);
    this.container.appendChild(this.answerBubble);

    // Add to page
    document.body.appendChild(this.container);

    // Add event listeners
    this.setupEventListeners();
  }

  setupEventListeners() {
    const input = this.container.querySelector('#quickask-input');
    const submitBtn = this.container.querySelector('#quickask-submit');
    const closeBtn = this.container.querySelector('#quickask-close');

    // Submit on Enter key, close on Escape
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey && !this.isLoading) {
        e.preventDefault();
        this.submitQuestion();
      }
      if (e.key === 'Escape') {
        this.hideInput();
      }
    });

    // Submit on button click
    submitBtn.addEventListener('click', () => {
      this.submitQuestion();
    });

    // Close on close button
    closeBtn.addEventListener('click', () => {
      this.hideInput();
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (this.isVisible && !this.container.contains(e.target)) {
        this.hideInput();
      }
    });

    // Prevent container clicks from closing
    this.container.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Remove URL attachment on cross click
    const removeUrlBtn = this.urlAttachment.querySelector('#quickask-remove-url');
    removeUrlBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.urlAttached = false;
      this.urlAttachment.style.display = 'none';
    });
  }

  toggleInput() {
    if (this.isVisible) {
      this.hideInput();
    } else {
      this.showInput();
    }
  }

  showInput() {
    this.container.style.display = 'block';
    this.answerBubble.style.display = 'none';
    this.isVisible = true;
    // Always reattach URL by default when input is shown
    this.urlAttached = true;
    this.urlAttachment.style.display = 'flex';
    // Update chip title in case document.title changed
    const chipText = this.urlAttachment.querySelector('#quickask-title-chip-text');
    if (chipText) {
      const pageTitle = document.title.length > 32 ? document.title.slice(0, 29) + '…' : document.title;
      chipText.textContent = pageTitle;
    }
    // Focus the input
    const input = this.container.querySelector('#quickask-input');
    input.focus();
    input.select();

    // Position the container
    this.positionContainer();
  }

  hideInput() {
    this.container.style.display = 'none';
    this.answerBubble.style.display = 'none';
    this.isVisible = false;
    
    // Clear input
    const input = this.container.querySelector('#quickask-input');
    input.value = '';
  }

  positionContainer() {
    // Position at bottom half, center horizontally, with space below
    const rect = this.container.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const containerHeight = rect.height || 0;
    // Place it at 65% of the viewport height, but at least 40px from the bottom
    let top = Math.min(viewportHeight * 0.65, viewportHeight - containerHeight - 40);
    if (top < 0) top = 40; // fallback for very small screens
    this.container.style.left = `${Math.max(10, (viewportWidth - 600) / 2)}px`;
    this.container.style.top = `${top}px`;
  }

  async submitQuestion() {
    const input = this.container.querySelector('#quickask-input');
    const question = input.value.trim();

    if (!question) {
      this.showError('Please enter a question');
      return;
    }

    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.showLoading();

    console.log('Submitting question:', question, 'for URL:', this.currentUrl);

    try {
      // Only send URL if attached
      const urlToSend = this.urlAttached ? this.currentUrl : undefined;
      const message = {
        action: 'askQuestion',
        question: question
      };
      if (urlToSend) message.url = urlToSend;
      const response = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Request timeout - service worker not responding'));
        }, 30000);
        chrome.runtime.sendMessage(message, (response) => {
          clearTimeout(timeout);
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else if (!response) {
            reject(new Error('No response from service worker'));
          } else {
            resolve(response);
          }
        });
      });

      if (response.success) {
        this.showAnswer(response.answer);
      } else {
        this.showError(response.error || 'Failed to get response');
      }

    } catch (error) {
      console.error('Error submitting question:', error);
      this.showError('Failed to submit question. Please try again.');
    } finally {
      this.isLoading = false;
      this.hideLoading();
    }
  }

  showLoading() {
    const submitBtn = this.container.querySelector('#quickask-submit');
    const input = this.container.querySelector('#quickask-input');
    
    submitBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="quickask-spinning">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="m9 12 2 2 4-4"></path>
      </svg>
    `;
    submitBtn.disabled = true;
    input.placeholder = "AI is browsing the webpage...";
    input.disabled = true;
  }

  hideLoading() {
    const submitBtn = this.container.querySelector('#quickask-submit');
    const input = this.container.querySelector('#quickask-input');
    
    submitBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22,2 15,22 11,13 2,9"></polygon>
      </svg>
    `;
    submitBtn.disabled = false;
    input.placeholder = "Ask anything about this webpage...";
    input.disabled = false;
  }

  showAnswer(answer) {
    this.answerBubble.innerHTML = `
      <div class="quickask-answer-content">
        <div class="quickask-answer-text">${this.escapeHtml(answer)}</div>
        <div class="quickask-answer-actions">
          <button class="quickask-action-btn quickask-copy-btn" title="Copy answer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
          <button class="quickask-action-btn quickask-ask-followup" title="Ask follow-up">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </button>
          <button class="quickask-answer-close" aria-label="Close answer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    `;

    this.answerBubble.style.display = 'block';

    // Add functionality to action buttons
    const closeBtn = this.answerBubble.querySelector('.quickask-answer-close');
    const copyBtn = this.answerBubble.querySelector('.quickask-copy-btn');
    const followupBtn = this.answerBubble.querySelector('.quickask-ask-followup');

    closeBtn.addEventListener('click', () => {
      this.answerBubble.style.display = 'none';
    });

    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(answer).then(() => {
        copyBtn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20,6 9,17 4,12"></polyline>
          </svg>
        `;
        setTimeout(() => {
          copyBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          `;
        }, 1500);
      }).catch(() => {
        this.showError('Failed to copy to clipboard');
      });
    });

    followupBtn.addEventListener('click', () => {
      const input = this.container.querySelector('#quickask-input');
      input.focus();
      input.value = 'Follow up: ';
      input.setSelectionRange(input.value.length, input.value.length);
    });
  }

  showError(message) {
    // Create temporary error toast
    const toast = document.createElement('div');
    toast.className = 'quickask-error-toast';
    toast.textContent = message;
    toast.setAttribute('aria-live', 'assertive');
    
    document.body.appendChild(toast);

    // Position toast
    toast.style.position = 'fixed';
    toast.style.top = '80px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.zIndex = '2147483648';

    // Remove after 5 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 5000);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, '<br>');
  }
}

// Initialize QuickAsk AI when the content script loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new QuickAskAI();
  });
} else {
  new QuickAskAI();
}
