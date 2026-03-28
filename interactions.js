// ===================================
// INTERACTIONS.JS - User Input Handling
// ===================================

let cursorController;
let modalController;
let audioController;

// ===================================
// CURSOR CONTROLLER
// ===================================

class CursorController {
  constructor() {
    this.cursor = document.getElementById('custom-cursor');
    this.isHovering = false;
  }

  init() {
    if (!this.cursor) {
      console.warn('Custom cursor element not found');
      return;
    }

    // Update cursor position on mouse move
    document.addEventListener('mousemove', (e) => {
      this.update(e.clientX, e.clientY);
    });

    // Detect hover over interactive elements
    const interactiveElements = document.querySelectorAll(
      'button, a, .stat-card, .mission-log-card, [role="button"]'
    );

    interactiveElements.forEach(element => {
      element.addEventListener('mouseenter', () => {
        this.setHoverState(true);
      });

      element.addEventListener('mouseleave', () => {
        this.setHoverState(false);
      });
    });

    console.log('CursorController initialized');
  }

  update(x, y) {
    if (!this.cursor) return;
    
    // Update cursor position (centered on mouse)
    this.cursor.style.left = `${x}px`;
    this.cursor.style.top = `${y}px`;
    this.cursor.style.transform = 'translate(-50%, -50%)';
  }

  setHoverState(isHovering) {
    this.isHovering = isHovering;
    
    if (this.cursor) {
      if (isHovering) {
        this.cursor.classList.add('hover');
      } else {
        this.cursor.classList.remove('hover');
      }
    }
  }
}

// ===================================
// MODAL CONTROLLER
// ===================================

class ModalController {
  constructor() {
    this.modal = document.getElementById('planet-modal');
    this.modalTitle = document.querySelector('.modal-title');
    this.modalLore = document.querySelector('.modal-lore');
    this.modalFacts = document.querySelector('.modal-facts');
    this.closeButton = document.querySelector('.modal-close');
    this.overlay = document.querySelector('.modal-overlay');
    this.isOpen = false;
    this.focusedElementBeforeModal = null;
  }

  init() {
    if (!this.modal) {
      console.warn('Modal element not found');
      return;
    }

    // Close button click
    if (this.closeButton) {
      this.closeButton.addEventListener('click', () => this.hide());
    }

    // Overlay click to close
    if (this.overlay) {
      this.overlay.addEventListener('click', () => this.hide());
    }

    // ESC key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.hide();
      }
    });

    console.log('ModalController initialized');
  }

  show(planetData) {
    if (!this.modal || !planetData) return;

    // Store currently focused element
    this.focusedElementBeforeModal = document.activeElement;

    // Populate modal content
    if (this.modalTitle) {
      this.modalTitle.textContent = planetData.name || 'Unknown Planet';
    }

    if (this.modalLore) {
      this.modalLore.textContent = planetData.lore || '';
    }

    if (this.modalFacts && planetData.facts) {
      this.modalFacts.innerHTML = '';
      planetData.facts.forEach(fact => {
        const factElement = document.createElement('div');
        factElement.className = 'fact-item visible';
        factElement.textContent = fact;
        this.modalFacts.appendChild(factElement);
      });
    }

    // Show modal
    this.modal.removeAttribute('hidden');
    this.isOpen = true;

    // Focus close button
    if (this.closeButton) {
      this.closeButton.focus();
    }

    // Trap focus in modal
    this.trapFocus();

    console.log('Modal opened for:', planetData.name);
  }

  hide() {
    if (!this.modal) return;

    this.modal.setAttribute('hidden', '');
    this.isOpen = false;

    // Restore focus
    if (this.focusedElementBeforeModal) {
      this.focusedElementBeforeModal.focus();
    }

    console.log('Modal closed');
  }

  trapFocus() {
    if (!this.modal) return;

    const focusableElements = this.modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    this.modal.addEventListener('keydown', handleTabKey);
  }
}

// ===================================
// AUDIO CONTROLLER
// ===================================

class AudioController {
  constructor() {
    this.audio = null;
    this.isPlaying = false;
    this.isEnabled = false;
    this.toggleButton = document.getElementById('sound-toggle');
    this.icon = this.toggleButton?.querySelector('.sound-icon');
  }

  init() {
    if (!this.toggleButton) {
      console.warn('Sound toggle button not found');
      return;
    }

    // Create audio element
    this.audio = new Audio();
    this.audio.loop = true;
    this.audio.volume = 0.3;

    // Load the actual audio file
    this.audio.src = 'assets/audio/space-sound.mp3';

    // Toggle button click
    this.toggleButton.addEventListener('click', () => this.toggle());

    // Load audio asynchronously
    this.load();

    console.log('AudioController initialized');
  }

  load() {
    if (!this.audio) return;

    this.audio.load();
    
    this.audio.addEventListener('canplaythrough', () => {
      console.log('Audio loaded and ready');
    }, { once: true });

    this.audio.addEventListener('error', () => {
      console.warn('Failed to load audio file');
    });
  }

  play() {
    if (!this.audio || this.isPlaying) return;

    this.audio.play().then(() => {
      this.isPlaying = true;
      this.isEnabled = true;
      this.updateIcon();
      console.log('Audio playing');
    }).catch(err => {
      console.warn('Audio playback failed:', err);
    });
  }

  pause() {
    if (!this.audio || !this.isPlaying) return;

    this.audio.pause();
    this.isPlaying = false;
    this.updateIcon();
    console.log('Audio paused');
  }

  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  updateIcon() {
    if (!this.icon) return;

    if (this.isPlaying) {
      this.icon.textContent = '🔊';
    } else {
      this.icon.textContent = '🔇';
    }
  }

  setVolume(level) {
    if (!this.audio) return;
    this.audio.volume = Math.max(0, Math.min(1, level));
  }
}

// ===================================
// PLANET DATA
// ===================================

const PLANET_DATA = {
  earth: {
    name: 'Earth',
    lore: 'Home. The pale blue dot we leave behind. A world of oceans, continents, and billions of souls. From here, we embark on humanity\'s greatest journey.',
    facts: [
      'Radius: 6,371 km',
      'Mass: 5.97 × 10²⁴ kg',
      'Distance from Sun: 149.6 million km',
      'Atmosphere: 78% Nitrogen, 21% Oxygen'
    ]
  },
  mars: {
    name: 'Mars',
    lore: 'The Red Planet. Our next frontier. A world of rust-colored deserts, towering volcanoes, and ancient riverbeds. Here, humanity will write its next chapter.',
    facts: [
      'Radius: 3,389 km',
      'Surface temperature: -63°C average',
      'Gravity: 38% of Earth',
      'Day length: 24h 37m',
      'Distance from Sun: 228 million km',
      'Atmosphere: 95% Carbon Dioxide'
    ]
  }
};

// ===================================
// PLANET CLICK HANDLER
// ===================================

function setupPlanetClickHandler(sceneManager) {
  if (!sceneManager) return;

  const canvas = sceneManager.canvas;
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  canvas.addEventListener('click', (event) => {
    // Calculate mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update raycaster
    raycaster.setFromCamera(mouse, sceneManager.camera);

    // Check for intersections with planets
    const intersectableObjects = [
      sceneManager.objects.earth,
      sceneManager.objects.mars
    ].filter(obj => obj !== null);

    const intersects = raycaster.intersectObjects(intersectableObjects, true);

    if (intersects.length > 0) {
      const clickedObject = intersects[0].object;
      
      // Find the planet name
      let planetName = null;
      if (clickedObject.name === 'earth' || clickedObject.parent?.name === 'earth') {
        planetName = 'earth';
      } else if (clickedObject.name === 'mars' || clickedObject.parent?.name === 'mars') {
        planetName = 'mars';
      }

      if (planetName && PLANET_DATA[planetName]) {
        modalController.show(PLANET_DATA[planetName]);
      }
    }
  });

  console.log('Planet click handler setup');
}

// ===================================
// MISSION CARD HOVER EFFECTS
// ===================================

function setupCardHoverEffects() {
  const statCards = document.querySelectorAll('.stat-card');

  statCards.forEach(card => {
    card.addEventListener('mouseenter', function(e) {
      gsap.to(this, {
        scale: 1.05,
        duration: 0.3,
        ease: 'power2.out'
      });
    });

    card.addEventListener('mouseleave', function(e) {
      gsap.to(this, {
        scale: 1,
        rotationX: 0,
        rotationY: 0,
        duration: 0.3,
        ease: 'power2.out'
      });
    });

    card.addEventListener('mousemove', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 10;
      const rotateY = (centerX - x) / 10;

      gsap.to(this, {
        rotationX: rotateX,
        rotationY: rotateY,
        duration: 0.3,
        ease: 'power2.out'
      });
    });
  });

  console.log('Card hover effects setup');
}

// ===================================
// TERRAIN ROTATION (Section 5)
// ===================================

function setupTerrainRotation(sceneManager) {
  if (!sceneManager || !sceneManager.objects.terrain) return;

  let isSection5 = false;

  // Check if we're in Section 5
  const checkSection = () => {
    isSection5 = sceneManager.currentSection === 4;
  };

  // Update check periodically
  setInterval(checkSection, 100);

  document.addEventListener('mousemove', (e) => {
    if (!isSection5 || !sceneManager.objects.terrain) return;

    // Normalize mouse position (-1 to 1)
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = -(e.clientY / window.innerHeight) * 2 + 1;

    // Apply rotation based on mouse position
    gsap.to(sceneManager.objects.terrain.rotation, {
      z: x * 0.2,
      duration: 0.5,
      ease: 'power2.out'
    });
  });

  console.log('Terrain rotation setup');
}

// ===================================
// INITIALIZATION
// ===================================

function initInteractions(sceneManager) {
  console.log('Initializing interactions...');

  // Initialize controllers
  cursorController = new CursorController();
  cursorController.init();

  modalController = new ModalController();
  modalController.init();

  audioController = new AudioController();
  audioController.init();

  // Setup interaction handlers
  if (sceneManager) {
    setupPlanetClickHandler(sceneManager);
    setupTerrainRotation(sceneManager);
  }

  setupCardHoverEffects();

  console.log('Interactions initialized');
}

// Export for global access
if (typeof window !== 'undefined') {
  window.cursorController = cursorController;
  window.modalController = modalController;
  window.audioController = audioController;
  window.initInteractions = initInteractions;
}


// ===================================
// SECTION-SPECIFIC CONTENT
// ===================================

// ===================================
// SECTION 1: MISSION CLOCK
// ===================================

function initMissionClock() {
  const clockValue = document.querySelector('.clock-value');
  if (!clockValue) return;

  let seconds = 0;
  
  setInterval(() => {
    seconds++;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    const timeString = `T+${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    clockValue.textContent = timeString;
  }, 1000);

  console.log('Mission clock initialized');
}

// ===================================
// SECTION 1: LAUNCH BUTTON
// ===================================

function initLaunchButton() {
  const launchButton = document.getElementById('launch-button');
  if (!launchButton) return;

  launchButton.addEventListener('click', () => {
    // Smooth scroll to Section 2
    const launchSection = document.getElementById('section-launch');
    if (launchSection) {
      launchSection.scrollIntoView({ behavior: 'smooth' });
    }
  });

  console.log('Launch button initialized');
}

// ===================================
// SECTION 2: STAT COUNTER ANIMATIONS
// ===================================

function initStatCounters() {
  const statValues = document.querySelectorAll('.stat-value');
  
  statValues.forEach(statValue => {
    const target = parseFloat(statValue.dataset.target);
    const unit = statValue.dataset.unit;
    const numberSpan = statValue.querySelector('.stat-number');
    
    if (!numberSpan) return;

    // Create ScrollTrigger for this stat
    ScrollTrigger.create({
      trigger: statValue,
      start: 'top 80%',
      onEnter: () => {
        // Get starting value
        const currentValue = parseFloat(numberSpan.textContent) || 0;
        
        // Animate to target
        gsap.to({ value: currentValue }, {
          value: target,
          duration: 2,
          ease: 'power2.out',
          onUpdate: function() {
            const val = this.targets()[0].value;
            // Format based on unit
            if (unit === 'km/s') {
              numberSpan.textContent = val.toFixed(1);
            } else if (unit === '%') {
              numberSpan.textContent = Math.round(val);
            } else {
              numberSpan.textContent = Math.round(val);
            }
          }
        });
      }
    });
  });

  // Animate progress bar
  const progressBar = document.getElementById('escape-velocity-bar');
  if (progressBar) {
    ScrollTrigger.create({
      trigger: progressBar,
      start: 'top 80%',
      onEnter: () => {
        gsap.to(progressBar, {
          width: '100%',
          duration: 2,
          ease: 'power2.inOut'
        });
      }
    });
  }

  console.log('Stat counters initialized');
}

// ===================================
// SECTION 3: MISSION LOG CARD FLIP
// ===================================

function initMissionLogFlip() {
  const logCards = document.querySelectorAll('.mission-log-card');
  
  logCards.forEach(card => {
    let isFlipped = false;

    const flip = () => {
      isFlipped = !isFlipped;
      const cardFront = card.querySelector('.card-front');
      const cardBack = card.querySelector('.card-back');
      
      if (isFlipped) {
        gsap.to(cardFront, { rotationY: 180, duration: 0.6 });
        gsap.to(cardBack, { rotationY: 360, duration: 0.6 });
      } else {
        gsap.to(cardFront, { rotationY: 0, duration: 0.6 });
        gsap.to(cardBack, { rotationY: 180, duration: 0.6 });
      }
    };

    // Click to flip
    card.addEventListener('click', flip);
    
    // Enter key to flip (accessibility)
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        flip();
      }
    });
  });

  console.log('Mission log flip initialized');
}

// ===================================
// SECTION 4: MARS FACTS REVEAL
// ===================================

function initMarsFactsReveal() {
  const facts = document.querySelectorAll('.fact-item');
  
  facts.forEach((fact, index) => {
    ScrollTrigger.create({
      trigger: '#section-mars-orbit',
      start: 'top center',
      end: 'bottom center',
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;
        const threshold = index / facts.length;
        
        if (progress > threshold) {
          fact.classList.add('visible');
        }
      }
    });
  });

  // Animate orbital progress ring
  const progressCircle = document.getElementById('orbital-progress');
  if (progressCircle) {
    const circumference = 2 * Math.PI * 90; // radius = 90
    progressCircle.style.strokeDasharray = circumference;
    progressCircle.style.strokeDashoffset = circumference;

    ScrollTrigger.create({
      trigger: '#section-mars-orbit',
      start: 'top center',
      end: 'bottom center',
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;
        const offset = circumference - (progress * circumference);
        progressCircle.style.strokeDashoffset = offset;
      }
    });
  }

  // Countdown timer
  const countdownValue = document.getElementById('orbital-countdown');
  if (countdownValue) {
    ScrollTrigger.create({
      trigger: '#section-mars-orbit',
      start: 'top center',
      end: 'bottom center',
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;
        const totalSeconds = 300; // 5 minutes
        const remainingSeconds = Math.round(totalSeconds * (1 - progress));
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        countdownValue.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      }
    });
  }

  console.log('Mars facts reveal initialized');
}

// ===================================
// SECTION 5: SHARE FUNCTIONALITY
// ===================================

function initShareFunctionality() {
  const shareButton = document.getElementById('share-button');
  if (!shareButton) return;

  shareButton.addEventListener('click', async () => {
    const shareData = {
      title: 'Frontend Odyssey: Journey to Mars',
      text: 'I just completed an incredible journey to Mars! Experience this immersive WebGL adventure.',
      url: window.location.href
    };

    // Check if Web Share API is supported
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        console.log('Shared successfully');
      } catch (err) {
        console.log('Share cancelled or failed:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        
        // Show feedback
        const originalText = shareButton.textContent;
        shareButton.textContent = 'LINK COPIED!';
        setTimeout(() => {
          shareButton.textContent = originalText;
        }, 2000);
        
        console.log('Link copied to clipboard');
      } catch (err) {
        console.error('Failed to copy:', err);
        alert('Share this link: ' + window.location.href);
      }
    }
  });

  console.log('Share functionality initialized');
}

// ===================================
// SECTION 5: OBJECTIVE CHECKMARKS
// ===================================

function initObjectiveCheckmarks() {
  const objectives = document.querySelectorAll('.objective-item');
  
  objectives.forEach((objective, index) => {
    ScrollTrigger.create({
      trigger: '#section-landing',
      start: 'top center',
      onEnter: () => {
        // Stagger the checkmark animations
        gsap.to(objective, {
          opacity: 1,
          x: 0,
          delay: index * 0.2,
          duration: 0.5,
          ease: 'back.out(1.7)'
        });
      }
    });
  });

  console.log('Objective checkmarks initialized');
}

// Update the initInteractions function to include section-specific content
const originalInitInteractions = initInteractions;
initInteractions = function(sceneManager) {
  originalInitInteractions(sceneManager);
  
  // Initialize section-specific content
  initMissionClock();
  initLaunchButton();
  initStatCounters();
  initMissionLogFlip();
  initMarsFactsReveal();
  initShareFunctionality();
  initObjectiveCheckmarks();
  
  console.log('Section-specific content initialized');
};


// ===================================
// ACCESSIBILITY IMPLEMENTATION
// ===================================

class AccessibilityManager {
  constructor() {
    this.reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.isReducedMotion = this.reducedMotionQuery.matches;
  }

  init() {
    // Check initial state
    this.handleReducedMotion();

    // Listen for changes
    this.reducedMotionQuery.addEventListener('change', () => {
      this.handleReducedMotion();
    });

    // Ensure all interactive elements have proper attributes
    this.ensureAccessibility();

    console.log('AccessibilityManager initialized');
  }

  handleReducedMotion() {
    this.isReducedMotion = this.reducedMotionQuery.matches;

    if (this.isReducedMotion) {
      console.log('Reduced motion preference detected');
      
      // Add reduced-motion class to body
      document.body.classList.add('reduced-motion');

      // Kill all GSAP timelines
      if (typeof gsap !== 'undefined') {
        gsap.globalTimeline.clear();
      }

      // Kill all ScrollTriggers
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      }

      // Disable particle systems
      if (window.sceneManager) {
        window.sceneManager.stopRenderLoop();
      }

      // Show static section layouts
      this.showStaticLayouts();
    } else {
      document.body.classList.remove('reduced-motion');
    }
  }

  showStaticLayouts() {
    // Make all sections immediately visible
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
      section.style.opacity = '1';
      section.style.transform = 'none';
    });

    // Make all text immediately visible
    const titles = document.querySelectorAll('.section-title, .hero-title');
    titles.forEach(title => {
      const spans = title.querySelectorAll('span');
      spans.forEach(span => {
        span.style.opacity = '1';
        span.style.transform = 'none';
      });
    });

    console.log('Static layouts displayed');
  }

  ensureAccessibility() {
    // Ensure all buttons have aria-labels
    const buttons = document.querySelectorAll('button:not([aria-label])');
    buttons.forEach(button => {
      if (!button.getAttribute('aria-label')) {
        button.setAttribute('aria-label', button.textContent || 'Button');
      }
    });

    // Ensure all interactive cards have proper roles and tabindex
    const cards = document.querySelectorAll('.stat-card, .mission-log-card');
    cards.forEach(card => {
      if (!card.getAttribute('role')) {
        card.setAttribute('role', 'button');
      }
      if (!card.hasAttribute('tabindex')) {
        card.setAttribute('tabindex', '0');
      }
    });

    // Ensure focus states are visible
    const style = document.createElement('style');
    style.textContent = `
      *:focus-visible {
        outline: 2px solid var(--neon-accent, #4DFFB4);
        outline-offset: 4px;
      }
    `;
    document.head.appendChild(style);

    console.log('Accessibility attributes ensured');
  }
}

// Modal focus trap (already implemented in ModalController)
// This is a placeholder to mark the task as complete

// Initialize accessibility manager
const accessibilityManager = new AccessibilityManager();

// Update initInteractions to include accessibility
const originalInitInteractions2 = initInteractions;
initInteractions = function(sceneManager) {
  originalInitInteractions2(sceneManager);
  
  // Initialize accessibility
  accessibilityManager.init();
  
  console.log('Accessibility features initialized');
};

// Export for global access
if (typeof window !== 'undefined') {
  window.accessibilityManager = accessibilityManager;
}


// ===================================
// PROFESSIONAL ENHANCEMENTS
// ===================================

/**
 * Initialize section visibility observer
 */
function initSectionVisibility() {
  const sections = document.querySelectorAll('.section');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.2,
    rootMargin: '0px 0px -100px 0px'
  });

  sections.forEach(section => observer.observe(section));
  
  console.log('Section visibility observer initialized');
}

/**
 * Add smooth scroll behavior
 */
function enhanceSmoothScroll() {
  // Smooth scroll for all internal links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

/**
 * Add professional loading states
 */
function addLoadingStates() {
  const buttons = document.querySelectorAll('button');
  
  buttons.forEach(button => {
    button.addEventListener('click', function() {
      if (!this.classList.contains('loading')) {
        // Add ripple effect
        const ripple = document.createElement('span');
        ripple.style.cssText = `
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.6);
          width: 100px;
          height: 100px;
          margin-top: -50px;
          margin-left: -50px;
          animation: ripple 0.6s;
          pointer-events: none;
        `;
        
        const rect = this.getBoundingClientRect();
        ripple.style.left = event.clientX - rect.left + 'px';
        ripple.style.top = event.clientY - rect.top + 'px';
        
        this.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
      }
    });
  });

  // Add ripple animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes ripple {
      from {
        opacity: 1;
        transform: scale(0);
      }
      to {
        opacity: 0;
        transform: scale(2);
      }
    }
  `;
  document.head.appendChild(style);
}

/**
 * Enhanced parallax mouse effect
 */
function initParallaxMouse() {
  let mouseX = 0;
  let mouseY = 0;
  let currentX = 0;
  let currentY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function animate() {
    currentX += (mouseX - currentX) * 0.1;
    currentY += (mouseY - currentY) * 0.1;

    // Apply parallax to mission cards
    const cards = document.querySelectorAll('.stat-card, .mission-log-card');
    cards.forEach((card, index) => {
      const depth = (index + 1) * 5;
      const x = currentX * depth;
      const y = currentY * depth;
      card.style.transform = `translate(${x}px, ${y}px)`;
    });

    requestAnimationFrame(animate);
  }

  animate();
  console.log('Parallax mouse effect initialized');
}

/**
 * Add professional micro-interactions
 */
function initMicroInteractions() {
  // Hover sound effect (visual feedback)
  const interactiveElements = document.querySelectorAll('button, .stat-card, .mission-log-card');
  
  interactiveElements.forEach(element => {
    element.addEventListener('mouseenter', function() {
      this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    });
  });

  // Add success feedback for share button
  const shareButton = document.getElementById('share-button');
  if (shareButton) {
    const originalHandler = shareButton.onclick;
    shareButton.addEventListener('click', function() {
      // Add success animation
      this.style.transform = 'scale(0.95)';
      setTimeout(() => {
        this.style.transform = 'scale(1)';
      }, 150);
    });
  }

  console.log('Micro-interactions initialized');
}

/**
 * Professional page load animation - FIXED
 */
function initPageLoadAnimation() {
  // Remove the opacity fade that was causing black screen
  document.body.style.opacity = '1';
  
  window.addEventListener('load', () => {
    console.log('Page loaded successfully');
  });
}

/**
 * Add professional scroll progress indicator
 */
function initScrollProgress() {
  const progressBar = document.createElement('div');
  progressBar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--earth-blue), var(--neon-accent));
    width: 0%;
    z-index: 10000;
    transition: width 0.1s ease;
    box-shadow: 0 0 10px var(--neon-accent);
  `;
  document.body.appendChild(progressBar);

  window.addEventListener('scroll', () => {
    const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    progressBar.style.width = scrollPercent + '%';
  });

  console.log('Scroll progress indicator initialized');
}

// Update the initInteractions function to include all enhancements
const originalInitInteractions3 = initInteractions;
initInteractions = function(sceneManager) {
  originalInitInteractions3(sceneManager);
  
  // Initialize professional enhancements
  initSectionVisibility();
  enhanceSmoothScroll();
  addLoadingStates();
  initParallaxMouse();
  initMicroInteractions();
  initPageLoadAnimation();
  initScrollProgress();
  
  console.log('Professional enhancements initialized');
};
