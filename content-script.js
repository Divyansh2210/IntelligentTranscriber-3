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
      <input 
        type="text" 
        id="quickask-input" 
        placeholder="Ask a question about this page..."
        aria-label="Ask a question about this webpage"
        maxlength="500"
      />
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

    // Submit on Enter key
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
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
    submitBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="quickask-spinning">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="m9 12 2 2 4-4"></path>
      </svg>
    `;
    submitBtn.disabled = true;
  }

  hideLoading() {
    const submitBtn = this.container.querySelector('#quickask-submit');
    submitBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22,2 15,22 11,13 2,9"></polygon>
      </svg>
    `;
    submitBtn.disabled = false;
  }

  showAnswer(answer) {
    this.answerBubble.innerHTML = `
      <div class="quickask-answer-content">
        <div class="quickask-answer-text">${this.escapeHtml(answer)}</div>
        <button class="quickask-answer-close" aria-label="Close answer">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `;

    this.answerBubble.style.display = 'block';

    // Add close functionality
    const closeBtn = this.answerBubble.querySelector('.quickask-answer-close');
    closeBtn.addEventListener('click', () => {
      this.answerBubble.style.display = 'none';
    });

    // Auto-hide input bar but keep container visible
    // this.inputBar.style.display = 'none';
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
