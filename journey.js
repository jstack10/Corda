// Journey Navigation System
class JourneyNavigator {
  constructor() {
    this.totalSteps = 3;
    this.currentStepIndex = 0;
    this.container = document.getElementById('journeyContainer');
    this.progressBar = document.getElementById('progressBar');
    this.steps = Array.from(document.querySelectorAll('.step-section'));
    
    this.init();
  }

  init() {
    // Wire up navigation buttons
    this.setupButtons();
    
    // Setup keyboard navigation
    this.setupKeyboard();
    
    // Setup scroll detection for progress bar updates
    this.setupScrollDetection();
    
    // Initialize progress bar
    this.updateProgressBar();
    
    // Ensure we start at step 1
    this.scrollToStep(0, false);
  }

  setupButtons() {
    // Next buttons - advance to next step
    const nextButtons = document.querySelectorAll('[id^="nextBtn"]');
    nextButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.goToNext();
      });
    });

    // Back buttons - go to previous step
    const backButtons = document.querySelectorAll('[id^="backBtn"]');
    backButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.goToPrevious();
      });
    });
  }

  setupKeyboard() {
    document.addEventListener('keydown', (e) => {
      // Left arrow - previous step
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.goToPrevious();
      }
      // Right arrow - next step
      else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.goToNext();
      }
      // Enter - advance to next
      else if (e.key === 'Enter' && !e.target.matches('textarea, input')) {
        e.preventDefault();
        this.goToNext();
      }
    });
  }

  setupScrollDetection() {
    let scrollTimeout;
    this.container.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      
      // Debounce scroll detection
      scrollTimeout = setTimeout(() => {
        this.updateCurrentStepFromScroll();
      }, 100);
    });
  }

  updateCurrentStepFromScroll() {
    const scrollPosition = this.container.scrollTop;
    const viewportHeight = window.innerHeight;
    
    // Calculate which step is currently in view
    let newStepIndex = Math.round(scrollPosition / viewportHeight);
    newStepIndex = Math.max(0, Math.min(newStepIndex, this.totalSteps - 1));
    
    if (newStepIndex !== this.currentStepIndex) {
      this.currentStepIndex = newStepIndex;
      this.updateProgressBar();
    }
  }

  scrollToStep(stepIndex, smooth = true) {
    if (stepIndex < 0 || stepIndex >= this.totalSteps) {
      return;
    }

    const step = this.steps[stepIndex];
    if (!step) return;

    // Temporarily disable smooth scrolling if needed
    if (!smooth) {
      this.container.style.scrollBehavior = 'auto';
    }

    step.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant', block: 'start' });
    
    this.currentStepIndex = stepIndex;
    this.updateProgressBar();

    // Re-enable smooth scrolling
    if (!smooth) {
      setTimeout(() => {
        this.container.style.scrollBehavior = 'smooth';
      }, 0);
    }
  }

  goToNext() {
    if (this.currentStepIndex < this.totalSteps - 1) {
      this.scrollToStep(this.currentStepIndex + 1);
    }
  }

  goToPrevious() {
    if (this.currentStepIndex > 0) {
      this.scrollToStep(this.currentStepIndex - 1);
    }
  }

  updateProgressBar() {
    // Calculate progress: (currentStepIndex + 1) / totalSteps * 100%
    const progress = ((this.currentStepIndex + 1) / this.totalSteps) * 100;
    this.progressBar.style.width = `${progress}%`;
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new JourneyNavigator();
  });
} else {
  new JourneyNavigator();
}

