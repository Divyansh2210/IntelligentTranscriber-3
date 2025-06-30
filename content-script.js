class QuickAskAI {
  constructor() {
    this.isVisible = false;
    this.container = null;
    this.inputBar = null;
    this.answerBubble = null;
    this.isLoading = false;
    
    this.init();
  }

  init() {
    // Listen for messages from service worker
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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
        <div class="quickask-quick-suggestions" id="quickask-suggestions" style="display: none;">
          <button class="quickask-suggestion-btn" data-question="What is this page about?">What is this page about?</button>
          <button class="quickask-suggestion-btn" data-question="Summarize the main points">Summarize the main points</button>
          <button class="quickask-suggestion-btn" data-question="What are the key takeaways?">What are the key takeaways?</button>
        </div>
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
    const suggestions = this.container.querySelector('#quickask-suggestions');

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

    // Handle suggestion button clicks
    suggestions.addEventListener('click', (e) => {
      if (e.target.classList.contains('quickask-suggestion-btn')) {
        const question = e.target.getAttribute('data-question');
        input.value = question;
        suggestions.style.display = 'none';
        this.submitQuestion();
      }
    });

    // Show/hide suggestions on focus/blur
    input.addEventListener('focus', () => {
      if (!input.value.trim()) {
        suggestions.style.display = 'block';
      }
    });

    input.addEventListener('input', () => {
      if (input.value.trim()) {
        suggestions.style.display = 'none';
      } else {
        suggestions.style.display = 'block';
      }
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
    // Position at top center of viewport
    const rect = this.container.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    
    this.container.style.left = `${Math.max(10, (viewportWidth - 600) / 2)}px`;
    this.container.style.top = '20px';
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

    try {
      // Get current URL
      const currentUrl = window.location.href;

      // Send message to service worker
      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
          action: 'askQuestion',
          question: question,
          url: currentUrl
        }, (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
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
