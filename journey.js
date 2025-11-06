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
      },
      step3: {
        audioBlob: null,
        audioUrl: null,
        duration: null,
        timestamp: null,
        hasRecording: false
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

  validateStep3() {
    // Check if audio recording exists (check hasRecording flag since blob can't be stored)
    return this.userData.step3 && this.userData.step3.hasRecording === true;
  }

  canProceedToNext(stepIndex) {
    if (stepIndex === 1) {
      const name = this.userData.step1.name || "";
      return this.validateStep1(name).valid;
    } else if (stepIndex === 2) {
      // For step 2, if no rating is saved, default to 3 (slider default)
      const rating = this.userData.step2.struggleRating !== null ? this.userData.step2.struggleRating : 3;
      return this.validateStep2(rating).valid;
    } else if (stepIndex === 3) {
      return this.validateStep3();
    }
    return true; // Steps 0 and beyond don't require validation
  }

  saveStepData(stepNumber, data) {
    if (stepNumber === 1) {
      this.userData.step1 = { ...this.userData.step1, ...data };
    } else if (stepNumber === 2) {
      this.userData.step2 = { ...this.userData.step2, ...data };
    } else if (stepNumber === 3) {
      this.userData.step3 = { ...this.userData.step3, ...data };
    }
    this.saveData();
  }

  getStepData(stepNumber) {
    if (stepNumber === 1) {
      return this.userData.step1;
    } else if (stepNumber === 2) {
      return this.userData.step2;
    } else if (stepNumber === 3) {
      return this.userData.step3;
    }
    return null;
  }
}

// Audio Recording System
class AudioRecorder {
  constructor(validator, navigator) {
    this.validator = validator;
    this.navigator = navigator;
    this.mediaRecorder = null;
    this.audioStream = null;
    this.audioChunks = [];
    this.recordingStartTime = null;
    this.timerInterval = null;
    this.isRecording = false;
    this.isPlaying = false;
    this.currentAudioBlob = null; // Store blob in memory (can't be stored in localStorage)
    
    // DOM elements
    this.recordBtn = document.getElementById('recordBtn');
    this.stopBtn = document.getElementById('stopBtn');
    this.rerecordBtn = document.getElementById('rerecordBtn');
    this.recordingIndicator = document.getElementById('recordingIndicator');
    this.recordingTimer = document.getElementById('recordingTimer');
    this.recordingFeedback = document.getElementById('recordingFeedback');
    this.audioError = document.getElementById('audioError');
    this.audioPlayerContainer = document.getElementById('audioPlayerContainer');
    this.audioPlayer = document.getElementById('audioPlayer');
    this.audioPlayPauseBtn = document.getElementById('audioPlayPauseBtn');
    this.audioPlayPauseIcon = document.getElementById('audioPlayPauseIcon');
    this.audioProgressBar = document.getElementById('audioProgressBar');
    this.audioProgressFill = document.getElementById('audioProgressFill');
    this.audioCurrentTime = document.getElementById('audioCurrentTime');
    this.audioDuration = document.getElementById('audioDuration');
    
    this.init();
  }

  init() {
    if (!this.recordBtn) return;
    
    // Wire up button events
    this.recordBtn.addEventListener('click', () => this.startRecording());
    this.stopBtn.addEventListener('click', () => this.stopRecording());
    this.rerecordBtn.addEventListener('click', () => this.deleteRecording());
    
    // Custom audio player controls
    if (this.audioPlayPauseBtn) {
      this.audioPlayPauseBtn.addEventListener('click', () => this.togglePlayback());
    }
    
    if (this.audioProgressBar) {
      this.audioProgressBar.addEventListener('click', (e) => this.seekAudio(e));
    }
    
    // Audio player events
    if (this.audioPlayer) {
      this.audioPlayer.addEventListener('timeupdate', () => this.updateProgress());
      this.audioPlayer.addEventListener('ended', () => this.onPlaybackEnded());
      this.audioPlayer.addEventListener('loadedmetadata', () => this.updateDuration());
    }
    
    // Load existing recording if available
    this.loadExistingRecording();
  }

  async requestMicrophonePermission() {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support audio recording. Please use a modern browser like Chrome, Firefox, or Edge.');
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      return stream;
    } catch (error) {
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        throw new Error('Microphone permission was denied. Please allow microphone access and try again.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        throw new Error('No microphone found. Please connect a microphone and try again.');
      } else if (error.name === 'NotSupportedError') {
        throw new Error('Audio recording is not supported in this browser. Please use Chrome, Firefox, or Edge.');
      } else {
        throw new Error('Failed to access microphone. Please check your settings and try again.');
      }
    }
  }

  async startRecording() {
    try {
      this.hideError();
      
      // Request microphone permission
      this.audioStream = await this.requestMicrophonePermission();
      
      // Determine MIME type
      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/ogg';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/wav';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = ''; // Use browser default
          }
        }
      }
      
      // Create MediaRecorder
      const options = mimeType ? { mimeType } : {};
      this.mediaRecorder = new MediaRecorder(this.audioStream, options);
      this.audioChunks = [];
      
      // Handle data available
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };
      
      // Handle recording stop
      this.mediaRecorder.onstop = () => {
        this.processRecording();
      };
      
      // Handle errors
      this.mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        this.showError('Recording error occurred. Please try again.');
        this.stopRecording();
      };
      
      // Start recording
      this.mediaRecorder.start(100); // Collect data every 100ms
      this.isRecording = true;
      this.recordingStartTime = Date.now();
      
      // Update UI
      this.recordBtn.classList.add('hidden');
      this.stopBtn.classList.remove('hidden');
      this.rerecordBtn.classList.add('hidden');
      this.recordingFeedback.classList.remove('hidden');
      this.recordingIndicator.classList.add('recording');
      this.audioPlayerContainer.classList.add('hidden');
      
      // Start timer
      this.startTimer();
      
    } catch (error) {
      console.error('Error starting recording:', error);
      this.showError(error.message);
    }
  }

  stopRecording() {
    if (!this.mediaRecorder || !this.isRecording) return;
    
    try {
      this.mediaRecorder.stop();
      this.isRecording = false;
      this.stopTimer();
      
      // Stop all tracks
      if (this.audioStream) {
        this.audioStream.getTracks().forEach(track => track.stop());
        this.audioStream = null;
      }
      
      // Update UI
      this.stopBtn.classList.add('hidden');
      this.recordingIndicator.classList.remove('recording');
      this.recordingFeedback.classList.add('hidden');
      
    } catch (error) {
      console.error('Error stopping recording:', error);
      this.showError('Error stopping recording. Please try again.');
    }
  }

  processRecording() {
    try {
      // Create blob from chunks
      const blob = new Blob(this.audioChunks, { type: this.mediaRecorder.mimeType || 'audio/webm' });
      this.currentAudioBlob = blob; // Store in memory
      
      // Calculate duration
      const duration = Math.round((Date.now() - this.recordingStartTime) / 1000);
      
      // Create object URL for playback
      const audioUrl = URL.createObjectURL(blob);
      
      // Store metadata in validator (blob stored in memory, not localStorage)
      // Note: Blob cannot be stored in localStorage, so it will be lost on page refresh
      this.validator.saveStepData(3, {
        audioBlob: null, // Can't store blob in localStorage
        audioUrl: audioUrl,
        duration: duration,
        timestamp: Date.now(),
        hasRecording: true // Flag to indicate recording exists
      });
      
      // Update UI
      this.showPlaybackControls();
      this.setupAudioPlayer(audioUrl, duration);
      
      // Update next button state
      this.navigator.updateNextButtonState(3);
      
    } catch (error) {
      console.error('Error processing recording:', error);
      this.showError('Error processing recording. Please try again.');
    }
  }

  setupAudioPlayer(audioUrl, duration) {
    if (!this.audioPlayer) return;
    
    this.audioPlayer.src = audioUrl;
    // audioPlayerContainer visibility is handled by showPlaybackControls()
    this.updateDurationDisplay(duration);
  }

  playRecording() {
    if (!this.audioPlayer || !this.audioPlayer.src) return;
    
    if (this.audioPlayer.paused) {
      this.audioPlayer.play().catch(error => {
        console.error('Error playing audio:', error);
        this.showError('Error playing recording. Please try again.');
      });
    } else {
      this.audioPlayer.pause();
    }
  }

  togglePlayback() {
    this.playRecording();
  }

  onPlaybackEnded() {
    this.isPlaying = false;
    if (this.audioPlayPauseIcon) {
      this.audioPlayPauseIcon.textContent = '▶';
    }
    if (this.audioProgressFill) {
      this.audioProgressFill.style.width = '0%';
    }
    if (this.audioCurrentTime) {
      this.audioCurrentTime.textContent = '0:00';
    }
  }

  updateProgress() {
    if (!this.audioPlayer) return;
    
    const current = this.audioPlayer.currentTime;
    const duration = this.audioPlayer.duration || 0;
    
    if (duration > 0) {
      const progress = (current / duration) * 100;
      if (this.audioProgressFill) {
        this.audioProgressFill.style.width = `${progress}%`;
      }
      if (this.audioCurrentTime) {
        this.audioCurrentTime.textContent = this.formatTime(current);
      }
    }
    
    this.isPlaying = !this.audioPlayer.paused;
    if (this.audioPlayPauseIcon) {
      this.audioPlayPauseIcon.textContent = this.isPlaying ? '⏸' : '▶';
    }
  }

  updateDuration() {
    if (!this.audioPlayer) return;
    const duration = this.audioPlayer.duration || 0;
    this.updateDurationDisplay(duration);
  }

  updateDurationDisplay(duration) {
    if (this.audioDuration) {
      this.audioDuration.textContent = this.formatTime(duration);
    }
  }

  seekAudio(e) {
    if (!this.audioPlayer || !this.audioProgressBar) return;
    
    const rect = this.audioProgressBar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const duration = this.audioPlayer.duration || 0;
    const newTime = percentage * duration;
    
    this.audioPlayer.currentTime = newTime;
  }

  deleteRecording() {
    // Clear audio data
    if (this.audioPlayer) {
      this.audioPlayer.pause();
      this.audioPlayer.src = '';
    }
    
    // Revoke object URL
    const step3Data = this.validator.getStepData(3);
    if (step3Data && step3Data.audioUrl) {
      URL.revokeObjectURL(step3Data.audioUrl);
    }
    
    // Clear blob from memory
    this.currentAudioBlob = null;
    
    // Clear from validator
    this.validator.saveStepData(3, {
      audioBlob: null,
      audioUrl: null,
      duration: null,
      timestamp: null,
      hasRecording: false
    });
    
    // Reset UI
    this.recordBtn.classList.remove('hidden');
    this.rerecordBtn.classList.add('hidden');
    this.audioPlayerContainer.classList.add('hidden');
    this.recordingFeedback.classList.add('hidden');
    this.hideError();
    
    // Update next button state
    this.navigator.updateNextButtonState(3);
  }

  showPlaybackControls() {
    this.recordBtn.classList.add('hidden');
    this.audioPlayerContainer.classList.remove('hidden');
    this.rerecordBtn.classList.remove('hidden');
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      if (this.recordingStartTime) {
        const elapsed = Math.floor((Date.now() - this.recordingStartTime) / 1000);
        if (this.recordingTimer) {
          this.recordingTimer.textContent = this.formatTime(elapsed);
        }
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  showError(message) {
    if (this.audioError) {
      this.audioError.textContent = message;
      this.audioError.classList.add('show');
    }
  }

  hideError() {
    if (this.audioError) {
      this.audioError.textContent = '';
      this.audioError.classList.remove('show');
    }
  }

  loadExistingRecording() {
    const step3Data = this.validator.getStepData(3);
    // Note: Object URLs are temporary and won't persist across page reloads
    // Blobs also can't be stored in localStorage
    // For MVP: If user refreshes page, they'll need to re-record
    // This is acceptable for MVP - in production, you'd upload to a server
    if (step3Data && step3Data.hasRecording && step3Data.audioUrl) {
      // Try to restore playback if URL is still valid
      try {
        this.showPlaybackControls();
        this.setupAudioPlayer(step3Data.audioUrl, step3Data.duration || 0);
      } catch (e) {
        // URL is invalid (page was refreshed), clear the data
        this.validator.saveStepData(3, {
          audioBlob: null,
          audioUrl: null,
          duration: null,
          timestamp: null,
          hasRecording: false
        });
      }
    }
  }
}

// Journey Navigation System
class JourneyNavigator {
  constructor() {
    this.totalSteps = 4;
    this.currentStepIndex = 0;
    this.container = document.getElementById('journeyContainer');
    this.progressBar = document.getElementById('progressBar');
    this.steps = Array.from(document.querySelectorAll('.step-section'));
    this.validator = new FormValidator();
    this.audioRecorder = null;
    
    this.init();
  }

  init() {
    // Wire up navigation buttons
    this.setupButtons();
    
    // Setup form inputs and validation
    this.setupForms();
    
    // Setup audio recording
    this.setupAudioRecording();
    
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

  setupAudioRecording() {
    // Initialize AudioRecorder
    this.audioRecorder = new AudioRecorder(this.validator, this);
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
    this.updateNextButtonState(3);
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
    } else if (stepIndex === 3) {
      const nextBtn = document.getElementById('nextBtn4');
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

