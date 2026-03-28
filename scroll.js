// ===================================
// SCROLL.JS - GSAP ScrollTrigger Animations
// ===================================

let scrollController;

// ===================================
// SCROLL CONTROLLER CLASS
// ===================================

class ScrollController {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.triggers = [];
    this.timeline = null;
    this.currentSection = 0;
    this.previousSection = -1;
  }

  /**
   * Initialize all scroll animations
   */
  init() {
    // Register GSAP plugins
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.error('GSAP or ScrollTrigger not loaded');
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Create all scroll animations
    this.createCameraPathAnimation();
    this.createSectionAnimations();
    this.createParallaxEffects();
    this.setupSectionPinning();

    console.log('ScrollController initialized');
  }

  /**
   * Create camera path animation synchronized with scroll
   */
  createCameraPathAnimation() {
    const trigger = ScrollTrigger.create({
      trigger: 'body',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;
        this.sceneManager.updateCameraFromScroll(progress);

        // Track section changes
        const sectionIndex = Math.floor(progress * 5);
        const clampedSection = Math.min(4, sectionIndex);
        
        if (clampedSection !== this.currentSection) {
          this.previousSection = this.currentSection;
          this.currentSection = clampedSection;
          this.onSectionChange(this.currentSection, this.previousSection);
        }
      }
    });

    this.triggers.push(trigger);
    console.log('Camera path animation created');
  }

  /**
   * Handle section transitions
   */
  onSectionChange(newSection, oldSection) {
    console.log(`Section changed: ${oldSection} → ${newSection}`);

    // Trigger chromatic aberration flash effect
    this.triggerChromaticAberration();

    // Section-specific logic
    if (newSection === 1) {
      // Activate rocket exhaust in Section 2
      if (this.sceneManager.objects.rocket?.userData.exhaustEmitter) {
        this.sceneManager.objects.rocket.userData.exhaustEmitter.setActive(true);
      }
    } else {
      // Deactivate exhaust in other sections
      if (this.sceneManager.objects.rocket?.userData.exhaustEmitter) {
        this.sceneManager.objects.rocket.userData.exhaustEmitter.setActive(false);
      }
    }

    // Update exhaust emitter in render loop
    if (this.sceneManager.objects.rocket?.userData.exhaustEmitter) {
      const emitter = this.sceneManager.objects.rocket.userData.exhaustEmitter;
      const originalUpdate = this.sceneManager.update.bind(this.sceneManager);
      this.sceneManager.update = function(deltaTime) {
        originalUpdate(deltaTime);
        emitter.update(deltaTime);
      };
    }
  }

  /**
   * Trigger chromatic aberration flash effect
   */
  triggerChromaticAberration() {
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.top = '0';
    flash.style.left = '0';
    flash.style.width = '100%';
    flash.style.height = '100%';
    flash.style.background = 'rgba(255, 255, 255, 0.1)';
    flash.style.mixBlendMode = 'screen';
    flash.style.pointerEvents = 'none';
    flash.style.zIndex = '9998';
    document.body.appendChild(flash);

    gsap.to(flash, {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.out',
      onComplete: () => {
        document.body.removeChild(flash);
      }
    });
  }

  /**
   * Create section-specific animations
   */
  createSectionAnimations() {
    // Earth shrink and fade (Section 1 exit)
    if (this.sceneManager.objects.earth) {
      ScrollTrigger.create({
        trigger: '#section-hero',
        start: 'bottom center',
        end: 'bottom top',
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          const scale = 1 - progress * 0.5;
          const opacity = 1 - progress * 0.7;
          
          this.sceneManager.objects.earth.scale.set(scale, scale, scale);
          if (this.sceneManager.objects.earth.material) {
            this.sceneManager.objects.earth.material.opacity = opacity;
            this.sceneManager.objects.earth.material.transparent = true;
          }
        }
      });
    }

    // Mars growth (approaching Section 4)
    if (this.sceneManager.objects.mars) {
      ScrollTrigger.create({
        trigger: '#section-mars-orbit',
        start: 'top bottom',
        end: 'center center',
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          const scale = 0.1 + progress * 0.9;
          const z = -500 + progress * 500;
          
          this.sceneManager.objects.mars.scale.set(scale, scale, scale);
          this.sceneManager.objects.mars.position.z = z;
        }
      });
    }

    console.log('Section animations created');
  }

  /**
   * Create parallax effects for UI elements
   */
  createParallaxEffects() {
    // Parallax for mission stats
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
      const factor = 0.5 + (index * 0.2);
      
      ScrollTrigger.create({
        trigger: card,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          const y = (progress - 0.5) * 100 * factor;
          gsap.set(card, { y });
        }
      });
    });

    // Parallax for mission log cards
    const logCards = document.querySelectorAll('.mission-log-card');
    logCards.forEach((card, index) => {
      const factor = 0.8 + (index * 0.3);
      
      ScrollTrigger.create({
        trigger: card,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          const y = (progress - 0.5) * 80 * factor;
          gsap.set(card, { y });
        }
      });
    });

    console.log('Parallax effects created');
  }

  /**
   * Setup section pinning for Section 3 (Deep Space)
   */
  setupSectionPinning() {
    const deepSpaceSection = document.getElementById('section-deep-space');
    
    if (deepSpaceSection) {
      ScrollTrigger.create({
        trigger: deepSpaceSection,
        start: 'top top',
        end: '+=300%',
        pin: true,
        scrub: true,
        onEnter: () => {
          console.log('Entering deep space - activating warp effect');
          this.activateStarWarp();
        },
        onLeave: () => {
          console.log('Leaving deep space - deactivating warp effect');
          this.deactivateStarWarp();
        },
        onEnterBack: () => {
          this.activateStarWarp();
        },
        onLeaveBack: () => {
          this.deactivateStarWarp();
        }
      });

      console.log('Section 3 pinning setup');
    }
  }

  /**
   * Activate star warp effect
   */
  activateStarWarp() {
    if (this.sceneManager.objects.particles.stars) {
      gsap.to(this.sceneManager.objects.particles.stars.material, {
        size: 2,
        duration: 1,
        ease: 'power2.inOut'
      });
    }
  }

  /**
   * Deactivate star warp effect
   */
  deactivateStarWarp() {
    if (this.sceneManager.objects.particles.stars) {
      gsap.to(this.sceneManager.objects.particles.stars.material, {
        size: 0.5,
        duration: 1,
        ease: 'power2.inOut'
      });
    }
  }

  /**
   * Dispose of all ScrollTriggers
   */
  dispose() {
    this.triggers.forEach(trigger => trigger.kill());
    this.triggers = [];
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    console.log('ScrollController disposed');
  }
}

// ===================================
// INITIALIZATION
// ===================================

function initScrollController(sceneManager) {
  if (!sceneManager) {
    console.error('SceneManager not provided to ScrollController');
    return;
  }

  scrollController = new ScrollController(sceneManager);
  scrollController.init();

  console.log('Scroll animations initialized');
}

// Export for global access
if (typeof window !== 'undefined') {
  window.scrollController = scrollController;
  window.initScrollController = initScrollController;
}


// ===================================
// TEXT REVEAL ANIMATIONS
// ===================================

/**
 * Create text reveal animations for section titles
 */
ScrollController.prototype.createTextRevealAnimations = function() {
  const sectionTitles = document.querySelectorAll('.section-title, .hero-title');
  
  sectionTitles.forEach((title) => {
    // Split text into characters
    const text = title.textContent;
    const chars = text.split('');
    title.innerHTML = '';
    
    chars.forEach((char) => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.display = 'inline-block';
      span.style.opacity = '0';
      span.style.transform = 'translateY(50px) rotateX(-90deg)';
      title.appendChild(span);
    });

    const charElements = title.querySelectorAll('span');

    ScrollTrigger.create({
      trigger: title,
      start: 'top 80%',
      onEnter: () => {
        gsap.to(charElements, {
          opacity: 1,
          y: 0,
          rotationX: 0,
          stagger: 0.03,
          duration: 0.8,
          ease: 'power2.out'
        });
      }
    });
  });

  console.log('Text reveal animations created');
};

// Call text reveal animations in init
const originalInit = ScrollController.prototype.init;
ScrollController.prototype.init = function() {
  originalInit.call(this);
  this.createTextRevealAnimations();
};
