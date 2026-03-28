// ===================================
// ASSET LOADER - loader.js
// Handles preloading and initialization
// ===================================

class AssetManager {
  constructor() {
    this.assets = {
      textures: [],
      audio: [],
      fonts: []
    };
    this.loaded = 0;
    this.total = 0;
    this.onCompleteCallback = null;
    this.loadedSections = new Set();
  }

  /**
   * Add texture to loading queue
   */
  loadTexture(path) {
    this.total++;
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.loaded++;
        this.updateProgress();
        resolve(img);
      };
      img.onerror = () => {
        console.warn(`Failed to load texture: ${path}`);
        this.loaded++;
        this.updateProgress();
        resolve(null); // Continue even if texture fails
      };
      img.src = path;
    });
  }

  /**
   * Load audio file
   */
  loadAudio(path) {
    this.total++;
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.addEventListener('canplaythrough', () => {
        this.loaded++;
        this.updateProgress();
        resolve(audio);
      }, { once: true });
      audio.addEventListener('error', () => {
        console.warn(`Failed to load audio: ${path}`);
        this.loaded++;
        this.updateProgress();
        resolve(null); // Continue even if audio fails
      }, { once: true });
      audio.src = path;
      audio.load();
    });
  }

  /**
   * Check if font is loaded
   */
  loadFont(name) {
    this.total++;
    return document.fonts.ready.then(() => {
      this.loaded++;
      this.updateProgress();
      return true;
    }).catch(() => {
      console.warn(`Failed to load font: ${name}`);
      this.loaded++;
      this.updateProgress();
      return false;
    });
  }

  /**
   * Get loading progress (0-1)
   */
  getProgress() {
    return this.total === 0 ? 0 : this.loaded / this.total;
  }

  /**
   * Update progress bar and countdown
   */
  updateProgress() {
    const progress = this.getProgress();
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
      progressBar.style.width = `${progress * 100}%`;
    }

    // Check if loading is complete
    if (this.loaded >= this.total && this.onCompleteCallback) {
      this.onCompleteCallback();
    }
  }

  /**
   * Set callback for when loading completes
   */
  onComplete(callback) {
    this.onCompleteCallback = callback;
    // If already loaded, call immediately
    if (this.loaded >= this.total) {
      callback();
    }
  }

  /**
   * Preload section assets (lazy loading)
   */
  preloadSection(sectionIndex) {
    if (this.loadedSections.has(sectionIndex)) {
      return Promise.resolve();
    }

    // Mark as loaded
    this.loadedSections.add(sectionIndex);

    // In a real implementation, you would load section-specific textures here
    // For now, we'll just return a resolved promise
    return Promise.resolve();
  }

  /**
   * Unload section assets
   */
  unloadSection(sectionIndex) {
    this.loadedSections.delete(sectionIndex);
    // In a real implementation, you would dispose of textures here
  }
}

// ===================================
// PRELOADER UI CONTROLLER
// ===================================

class PreloaderController {
  constructor() {
    this.loaderElement = document.getElementById('loader');
    this.countdownElement = document.getElementById('countdown');
    this.progressBar = document.getElementById('progress-bar');
    this.statusElement = document.getElementById('loader-status');
    this.countdownValue = 10;
    this.countdownInterval = null;
    this.minDisplayTime = 10000; // Exactly 10 seconds
    this.startTime = Date.now();
    this.lottieAnimation = null;
    this.audioContext = null;
    this.tickSound = null;
  }

  /**
   * Create tick sound using Web Audio API
   */
  createTickSound() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
      return;
    }
  }

  /**
   * Play tick sound
   */
  playTick(isLast = false) {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Different frequency for last tick
    oscillator.frequency.value = isLast ? 1200 : 800;
    oscillator.type = 'sine';

    // Quick beep
    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.1);
  }

  /**
   * Initialize Lottie animation
   */
  initLottieAnimation() {
    const container = document.getElementById('lottie-rocket');
    if (!container || typeof lottie === 'undefined') {
      // Fallback to emoji if Lottie not available
      container.innerHTML = '<div style="font-size: 4rem; animation: rocket-launch 2s ease-in-out infinite;">🚀</div>';
      return;
    }

    // Create a simple rocket animation programmatically
    // In production, you would load a JSON animation file
    this.createFallbackRocketAnimation(container);
  }

  /**
   * Create fallback rocket animation
   */
  createFallbackRocketAnimation(container) {
    container.innerHTML = `
      <div class="rocket-container" style="width: 200px; height: 200px; position: relative; margin: 0 auto;">
        <div class="rocket" style="
          font-size: 4rem;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: rocketFloat 2s ease-in-out infinite;
        ">🚀</div>
        <div class="rocket-trail" style="
          position: absolute;
          bottom: 20%;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 40px;
          background: linear-gradient(to bottom, var(--hud-orange), transparent);
          animation: trailPulse 0.5s ease-in-out infinite;
        "></div>
      </div>
    `;

    // Add animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes rocketFloat {
        0%, 100% { transform: translate(-50%, -50%) translateY(0); }
        50% { transform: translate(-50%, -50%) translateY(-20px); }
      }
      @keyframes trailPulse {
        0%, 100% { opacity: 0.5; height: 40px; }
        50% { opacity: 1; height: 60px; }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Update status text
   */
  updateStatus(text) {
    if (this.statusElement) {
      this.statusElement.textContent = text;
    }
  }

  /**
   * Start countdown animation - EXACTLY 10 SECONDS
   */
  startCountdown() {
    this.initLottieAnimation();
    this.createTickSound();
    this.updateStatus('Initializing systems...');

    // Exactly 1 second per count
    this.countdownInterval = setInterval(() => {
      this.countdownValue--;
      
      if (this.countdownElement) {
        this.countdownElement.textContent = this.countdownValue;
        
        // Add pulse animation on each tick
        this.countdownElement.style.transform = 'scale(1.2)';
        setTimeout(() => {
          this.countdownElement.style.transform = 'scale(1)';
        }, 100);
      }

      // Play tick sound
      this.playTick(this.countdownValue === 0);

      // Update status messages
      if (this.countdownValue === 7) {
        this.updateStatus('Loading 3D assets...');
      } else if (this.countdownValue === 4) {
        this.updateStatus('Preparing launch sequence...');
      } else if (this.countdownValue === 1) {
        this.updateStatus('Ready for launch!');
      }

      if (this.countdownValue <= 0) {
        clearInterval(this.countdownInterval);
      }
    }, 1000); // Exactly 1000ms = 1 second per tick
  }

  /**
   * Dissolve loader with fade animation
   */
  dissolve() {
    // Ensure minimum display time
    const elapsed = Date.now() - this.startTime;
    const remainingTime = Math.max(0, this.minDisplayTime - elapsed);

    setTimeout(() => {
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval);
      }

      if (this.loaderElement) {
        this.loaderElement.classList.add('hidden');
        
        // Remove from DOM after animation completes
        setTimeout(() => {
          if (this.loaderElement && this.loaderElement.parentNode) {
            this.loaderElement.parentNode.removeChild(this.loaderElement);
          }
        }, 1000);
      }
    }, remainingTime);
  }
}

// ===================================
// INITIALIZATION
// ===================================

// Global instances
let assetManager;
let preloaderController;

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLoader);
} else {
  initLoader();
}

function initLoader() {
  // Create instances
  assetManager = new AssetManager();
  preloaderController = new PreloaderController();

  // Start countdown animation
  preloaderController.startCountdown();

  // Load fonts (Google Fonts are already loading via link tags)
  assetManager.loadFont('Orbitron');
  assetManager.loadFont('Inter');

  // Note: Textures and audio will be loaded by main.js when needed
  // For now, we'll just simulate some loading time
  
  // Set up completion callback
  assetManager.onComplete(() => {
    console.log('Assets loaded, initializing application...');
    
    // Dissolve loader
    preloaderController.dissolve();

    // Initialize main application after loader dissolves
    setTimeout(() => {
      if (typeof initializeApp === 'function') {
        initializeApp();
      }
    }, 1000);
  });

  // If no assets to load, complete immediately after minimum time
  if (assetManager.total === 0) {
    setTimeout(() => {
      assetManager.updateProgress();
    }, 100);
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.assetManager = assetManager;
  window.preloaderController = preloaderController;
}
