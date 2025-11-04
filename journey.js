// Form Validation and Data Storage System
class FormValidator {
  constructor() {
    this.storageKey = 'journey.userData.v1';
    this.userData = this.loadData();
  }

  loadData() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load user data:', e);
    }
    return {
      step1: {
        name: ""
      },
      step2: {
        struggleRating: null
      }
    };
  }

  saveData() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.userData));
    } catch (e) {
      console.warn('Failed to save user data:', e);
    }
  }

  validateStep1(inputValue) {
    const trimmed = inputValue.trim();
    
    if (trimmed.length < 2) {
      return { valid: false, error: "Name must be at least 2 characters" };
    }
    
    if (trimmed.length > 50) {
      return { valid: false, error: "Name cannot exceed 50 characters" };
    }
    
    // Only letters, spaces, and hyphens allowed
    const validPattern = /^[a-zA-Z\s\-]+$/;
    if (!validPattern.test(trimmed)) {
      return { valid: false, error: "Name can only contain letters, spaces, and hyphens" };
    }
    
    return { valid: true, error: "" };
  }

  validateStep2(selectedValue) {
    const value = selectedValue !== null && selectedValue !== undefined ? parseFloat(selectedValue) : null;
    
    // Default to 3 if not touched (slider defaults to 3)
    if (value === null || isNaN(value)) {
      return { valid: true, error: "" }; // Default value is valid
    }
    
    if (value < 1 || value > 5) {
      return { valid: false, error: "Please select a rating" };
    }
    
    return { valid: true, error: "" };
  }

  canProceedToNext(stepIndex) {
    if (stepIndex === 1) {
      const name = this.userData.step1.name || "";
      return this.validateStep1(name).valid;
    } else if (stepIndex === 2) {
      // For step 2, if no rating is saved, default to 3 (slider default)
      const rating = this.userData.step2.struggleRating !== null ? this.userData.step2.struggleRating : 3;
      return this.validateStep2(rating).valid;
    }
    return true; // Steps 0 and beyond don't require validation
  }

  saveStepData(stepNumber, data) {
    if (stepNumber === 1) {
      this.userData.step1 = { ...this.userData.step1, ...data };
    } else if (stepNumber === 2) {
      this.userData.step2 = { ...this.userData.step2, ...data };
    }
    this.saveData();
  }

  getStepData(stepNumber) {
    if (stepNumber === 1) {
      return this.userData.step1;
    } else if (stepNumber === 2) {
      return this.userData.step2;
    }
    return null;
  }
}

// Journey Navigation System
class JourneyNavigator {
  constructor() {
    this.totalSteps = 3;
    this.currentStepIndex = 0;
    this.container = document.getElementById('journeyContainer');
    this.progressBar = document.getElementById('progressBar');
    this.steps = Array.from(document.querySelectorAll('.step-section'));
    this.validator = new FormValidator();
    
    this.init();
  }

  init() {
    // Wire up navigation buttons
    this.setupButtons();
    
    // Setup form inputs and validation
    this.setupForms();
    
    // Setup keyboard navigation
    this.setupKeyboard();
    
    // Setup scroll detection for progress bar updates
    this.setupScrollDetection();
    
    // Initialize progress bar
    this.updateProgressBar();
    
    // Load saved data into forms
    this.loadFormData();
    
    // Ensure we start at step 1
    this.scrollToStep(0, false);
  }

  setupButtons() {
    // Next buttons - advance to next step
    const nextButtons = document.querySelectorAll('[id^="nextBtn"]');
    nextButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (!btn.disabled) {
          this.goToNext();
        }
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

  setupForms() {
    // Step 1: Name input
    const nameInput = document.getElementById('nameInput');
    if (nameInput) {
      nameInput.addEventListener('input', (e) => {
        const value = e.target.value;
        this.validateStep1(value);
        this.validator.saveStepData(1, { name: value.trim() });
        this.updateNextButtonState(1);
      });

      nameInput.addEventListener('blur', (e) => {
        this.validateStep1(e.target.value);
      });
    }

    // Step 2: Slider
    const slider = document.getElementById('struggleSlider');
    if (slider) {
      const updateSliderValue = (value) => {
        // Update slider fill progress: (value - min) / (max - min) * 100
        const min = parseFloat(slider.min) || 1;
        const max = parseFloat(slider.max) || 5;
        const progress = ((value - min) / (max - min)) * 100;
        slider.style.setProperty('--slider-progress', `${progress}%`);
        this.validator.saveStepData(2, { struggleRating: parseFloat(value) });
        this.updateNextButtonState(2);
      };

      slider.addEventListener('input', (e) => {
        updateSliderValue(e.target.value);
      });

      // Initialize slider and save default value
      updateSliderValue(slider.value);
      
      // Ensure default value is saved if no data exists
      const step2Data = this.validator.getStepData(2);
      if (!step2Data || step2Data.struggleRating === null) {
        this.validator.saveStepData(2, { struggleRating: 3 });
        this.updateNextButtonState(2);
      }
    }
  }

  validateStep1(value) {
    const result = this.validator.validateStep1(value);
    const nameInput = document.getElementById('nameInput');
    const nameIcon = document.getElementById('nameIcon');
    const nameError = document.getElementById('nameError');
    const nameValidation = document.getElementById('nameValidation');

    if (!nameInput || !nameIcon || !nameError || !nameValidation) return;

    if (value.trim().length === 0) {
      nameInput.classList.remove('valid', 'invalid');
      nameIcon.textContent = '';
      nameError.textContent = '';
      nameValidation.classList.remove('show');
      return;
    }

    if (result.valid) {
      nameInput.classList.add('valid');
      nameInput.classList.remove('invalid');
      nameIcon.textContent = '';
      nameError.textContent = '';
      nameValidation.classList.remove('show');
    } else {
      nameInput.classList.add('invalid');
      nameInput.classList.remove('valid');
      nameIcon.textContent = '';
      nameError.textContent = result.error;
      nameValidation.classList.add('show', 'invalid');
    }
  }

  loadFormData() {
    // Load Step 1 data
    const step1Data = this.validator.getStepData(1);
    const nameInput = document.getElementById('nameInput');
    if (nameInput && step1Data && step1Data.name) {
      nameInput.value = step1Data.name;
      this.validateStep1(step1Data.name);
    }

    // Load Step 2 data
    const step2Data = this.validator.getStepData(2);
    const slider = document.getElementById('struggleSlider');
    if (slider && step2Data && step2Data.struggleRating !== null) {
      slider.value = step2Data.struggleRating;
      // Update slider fill progress
      const min = parseFloat(slider.min) || 1;
      const max = parseFloat(slider.max) || 5;
      const progress = ((step2Data.struggleRating - min) / (max - min)) * 100;
      slider.style.setProperty('--slider-progress', `${progress}%`);
    }

    // Update button states for all steps
    this.updateNextButtonState(1);
    this.updateNextButtonState(2);
  }

  updateNextButtonState(stepIndex) {
    const canProceed = this.validator.canProceedToNext(stepIndex);
    
    if (stepIndex === 1) {
      const nextBtn = document.getElementById('nextBtn2');
      if (nextBtn) {
        nextBtn.disabled = !canProceed;
      }
    } else if (stepIndex === 2) {
      const nextBtn = document.getElementById('nextBtn3');
      if (nextBtn) {
        nextBtn.disabled = !canProceed;
      }
    }
  }

  setupKeyboard() {
    document.addEventListener('keydown', (e) => {
      // Left arrow - previous step
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.goToPrevious();
      }
      // Right arrow - next step (only if valid)
      else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (this.validator.canProceedToNext(this.currentStepIndex)) {
          this.goToNext();
        }
      }
      // Enter - advance to next (only if valid and not in input)
      else if (e.key === 'Enter' && !e.target.matches('textarea, input')) {
        e.preventDefault();
        if (this.validator.canProceedToNext(this.currentStepIndex)) {
          this.goToNext();
        }
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
      this.updateNextButtonState(newStepIndex);
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
    this.updateNextButtonState(stepIndex);

    // Auto-focus on step entry
    if (stepIndex === 1) {
      setTimeout(() => {
        const nameInput = document.getElementById('nameInput');
        if (nameInput) {
          nameInput.focus();
        }
      }, 300);
    }

    // Re-enable smooth scrolling
    if (!smooth) {
      setTimeout(() => {
        this.container.style.scrollBehavior = 'smooth';
      }, 0);
    }
  }

  goToNext() {
    // Check if current step is valid before proceeding
    if (!this.validator.canProceedToNext(this.currentStepIndex)) {
      return;
    }
    
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

