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

  loadTexture(path) {
    this.total++;
    return new Promise((resolve) => {
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
        resolve(null);
      };
      img.src = path;
    });
  }

  loadAudio(path) {
    this.total++;
    return new Promise((resolve) => {
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
        resolve(null);
      }, { once: true });
      audio.src = path;
      audio.load();
    });
  }

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

  getProgress() {
    return this.total === 0 ? 0 : this.loaded / this.total;
  }

  updateProgress() {
    const progress = this.getProgress();
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
      progressBar.style.width = `${progress * 100}%`;
    }

    if (this.loaded >= this.total && this.onCompleteCallback) {
      this.onCompleteCallback();
    }
  }

  onComplete(callback) {
    this.onCompleteCallback = callback;
    if (this.loaded >= this.total) {
      callback();
    }
  }

  preloadSection(sectionIndex) {
    if (this.loadedSections.has(sectionIndex)) {
      return Promise.resolve();
    }
    this.loadedSections.add(sectionIndex);
    return Promise.resolve();
  }

  unloadSection(sectionIndex) {
    this.loadedSections.delete(sectionIndex);
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
    this.minDisplayTime = 10000;
    this.startTime = Date.now();
    this.countdownAudio = null;
  }

  initLottieAnimation() {
    const container = document.getElementById('lottie-rocket');
    if (!container) return;
    
    container.innerHTML = `
      <div class="rocket-container" style="width: 200px; height: 200px; position: relative; margin: 0 auto;">
        <div class="rocket" style="
          font-size: 5rem;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: rocketFloat 2s ease-in-out infinite;
          filter: drop-shadow(0 0 30px #FF6B35);
        ">🚀</div>
        <div class="rocket-trail" style="
          position: absolute;
          bottom: 20%;
          left: 50%;
          transform: translateX(-50%);
          width: 6px;
          height: 60px;
          background: linear-gradient(to bottom, #FF6B35, transparent);
          animation: trailPulse 0.5s ease-in-out infinite;
          box-shadow: 0 0 20px #FF6B35;
        "></div>
      </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes rocketFloat {
        0%, 100% { transform: translate(-50%, -50%) translateY(0) rotate(-45deg); }
        50% { transform: translate(-50%, -50%) translateY(-30px) rotate(-45deg); }
      }
      @keyframes trailPulse {
        0%, 100% { opacity: 0.5; height: 60px; }
        50% { opacity: 1; height: 80px; }
      }
    `;
    document.head.appendChild(style);
  }

  updateStatus(text) {
    if (this.statusElement) {
      this.statusElement.textContent = text;
      this.statusElement.style.animation = 'none';
      setTimeout(() => {
        this.statusElement.style.animation = 'pulse 2s ease-in-out infinite';
      }, 10);
    }
  }

  startCountdown() {
    this.initLottieAnimation();
    this.updateStatus('🚀 Initializing Mission Systems...');
    
    // Setup and autoplay audio
    this.countdownAudio = new Audio('assets/audio/countdown.mp3');
    this.countdownAudio.volume = 1.0;
    this.countdownAudio.loop = false;
    
    // Attempt autoplay with user interaction fallback
    const playAudio = () => {
      this.countdownAudio.play()
        .then(() => console.log('✅ Countdown audio playing'))
        .catch(err => {
          console.warn('⚠️ Autoplay blocked, trying on interaction:', err);
          // Retry on any user interaction
          const enableAudio = () => {
            this.countdownAudio.play()
              .then(() => {
                console.log('✅ Audio enabled after interaction');
                document.removeEventListener('click', enableAudio);
                document.removeEventListener('keydown', enableAudio);
                document.removeEventListener('touchstart', enableAudio);
              })
              .catch(e => console.error('❌ Audio failed:', e));
          };
          document.addEventListener('click', enableAudio, { once: true });
          document.addEventListener('keydown', enableAudio, { once: true });
          document.addEventListener('touchstart', enableAudio, { once: true });
        });
    };
    
    // Try to play immediately
    playAudio();

    // Countdown timer
    this.countdownInterval = setInterval(() => {
      this.countdownValue--;
      
      if (this.countdownElement) {
        this.countdownElement.textContent = this.countdownValue;
        
        // Dramatic pulse effect
        this.countdownElement.style.transform = 'scale(1.4)';
        this.countdownElement.style.textShadow = '0 0 50px #4DFFB4, 0 0 100px #4DFFB4, 0 0 150px #4DFFB4';
        setTimeout(() => {
          this.countdownElement.style.transform = 'scale(1)';
          this.countdownElement.style.textShadow = '0 0 30px #4DFFB4, 0 0 60px #4DFFB4';
        }, 200);
      }

      // Update status messages
      if (this.countdownValue === 9) {
        this.updateStatus('⚡ Initializing WebGL Renderer...');
      } else if (this.countdownValue === 7) {
        this.updateStatus('🌍 Loading 3D Assets...');
      } else if (this.countdownValue === 5) {
        this.updateStatus('✨ Compiling Shaders...');
      } else if (this.countdownValue === 3) {
        this.updateStatus('🔥 Preparing Launch Sequence...');
      } else if (this.countdownValue === 1) {
        this.updateStatus('🎯 Ready for Launch!');
      }

      if (this.countdownValue <= 0) {
        clearInterval(this.countdownInterval);
        if (this.countdownAudio) {
          this.countdownAudio.pause();
          this.countdownAudio.currentTime = 0;
        }
      }
    }, 1000);
  }

  dissolve() {
    const elapsed = Date.now() - this.startTime;
    const remainingTime = Math.max(0, this.minDisplayTime - elapsed);

    setTimeout(() => {
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval);
      }

      if (this.loaderElement) {
        this.loaderElement.classList.add('hidden');
        
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

let assetManager;
let preloaderController;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLoader);
} else {
  initLoader();
}

function initLoader() {
  assetManager = new AssetManager();
  preloaderController = new PreloaderController();

  preloaderController.startCountdown();

  assetManager.loadFont('Orbitron');
  assetManager.loadFont('Inter');
  
  assetManager.onComplete(() => {
    console.log('✅ Assets loaded, initializing application...');
    preloaderController.dissolve();

    setTimeout(() => {
      if (typeof initializeApp === 'function') {
        initializeApp();
      }
    }, 1000);
  });

  if (assetManager.total === 0) {
    setTimeout(() => {
      assetManager.updateProgress();
    }, 100);
  }
}

if (typeof window !== 'undefined') {
  window.assetManager = assetManager;
  window.preloaderController = preloaderController;
}
