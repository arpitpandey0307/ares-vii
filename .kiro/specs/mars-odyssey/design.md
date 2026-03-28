# Design Document

## Overview

The Mars Odyssey interactive experience is a scroll-driven WebGL application that combines Three.js 3D rendering with GSAP animation to create a cinematic journey from Earth to Mars. The architecture follows a modular design with clear separation between rendering (Three.js), animation orchestration (GSAP), user interactions, and application lifecycle management.

The application uses a single persistent WebGL canvas as a fixed background, with HTML content overlaid on top. As users scroll, both the 3D camera and 2D UI elements animate in synchronization, creating a cohesive narrative experience across five distinct sections. The design prioritizes performance through lazy loading, resource disposal, and responsive degradation strategies.

## Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser Window                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │          HTML Content Layer (z-index: 10)             │  │
│  │  - Section overlays with text and UI                  │  │
│  │  - Mission stats, cards, buttons                      │  │
│  │  - Modals and HUD elements                            │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │       WebGL Canvas Layer (z-index: 1, fixed)          │  │
│  │  - Three.js renderer                                  │  │
│  │  - Scene with camera, lights, 3D objects              │  │
│  │  - Particle systems                                   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

         ↓ User Scroll Event ↓

┌─────────────────────────────────────────────────────────────┐
│                   GSAP ScrollTrigger                         │
│  - Monitors scroll position                                  │
│  - Updates animation progress                                │
│  - Triggers section transitions                              │
└─────────────────────────────────────────────────────────────┘

         ↓ Animation Updates ↓

┌──────────────────┐         ┌──────────────────┐
│   Three.js       │         │   GSAP Timeline  │
│   Scene Manager  │ ←────→  │   Controller     │
│  - Camera path   │         │  - UI animations │
│  - Object states │         │  - Text reveals  │
└──────────────────┘         └──────────────────┘
```

### Module Responsibilities

**loader.js** - Application Bootstrap
- Preloads critical assets (textures, audio, fonts)
- Displays countdown loader UI
- Initializes other modules once assets are ready
- Manages loading progress feedback

**main.js** - Three.js Scene Management
- Creates and configures WebGL renderer
- Builds scene graph with all 3D objects
- Manages camera and lighting
- Implements particle systems
- Handles render loop with requestAnimationFrame
- Exposes scene objects for animation control

**scroll.js** - Scroll Animation Orchestration
- Configures GSAP ScrollTrigger instances
- Defines camera path along CatmullRomCurve3
- Coordinates 3D and 2D animation timelines
- Manages section pinning and transitions
- Scrubs animations based on scroll position

**interactions.js** - User Input Handling
- Implements custom cursor with hover effects
- Handles click events on planets and UI elements
- Manages modal display and dismissal
- Controls audio playback toggle
- Implements mousemove-based terrain rotation

**style.css** - Visual Design System
- Defines CSS custom properties for colors and spacing
- Implements responsive layout grid
- Provides base styles for HUD elements
- Defines CSS animations for non-3D effects
- Handles responsive breakpoints

### Data Flow

1. **Initialization Flow**
   - loader.js starts asset preloading
   - Once complete, initializes main.js (Three.js scene)
   - main.js signals ready, scroll.js sets up ScrollTriggers
   - interactions.js attaches event listeners
   - Loader dissolves, revealing Section 1

2. **Scroll Interaction Flow**
   - User scrolls → Browser scroll event
   - ScrollTrigger calculates progress (0-1)
   - scroll.js updates camera position on spline
   - scroll.js triggers GSAP timeline updates
   - main.js render loop draws updated scene
   - CSS transforms update UI element positions

3. **User Interaction Flow**
   - User clicks planet → interactions.js detects click
   - Raycaster determines which 3D object was clicked
   - Modal data fetched and displayed
   - Click outside modal → dismiss and return to scroll

## Components and Interfaces

### Three.js Scene Components

#### SceneManager
```javascript
class SceneManager {
  constructor(canvas)
  init()
  createStarfield(count)
  createEarth()
  createRocket()
  createAsteroidBelt(count)
  createMars()
  createMarsTerrain()
  getCameraPath() // Returns CatmullRomCurve3
  update(deltaTime)
  dispose()
  
  // Public properties
  scene
  camera
  renderer
  objects: {
    earth,
    rocket,
    mars,
    terrain,
    particles: { stars, exhaust, asteroids, dust }
  }
}
```

#### ParticleSystem
```javascript
class ParticleSystem {
  constructor(count, config)
  init()
  update(deltaTime)
  emit(position, velocity, count)
  dispose()
  
  // Config: { size, color, velocity, lifetime, texture }
}
```

### GSAP Animation Components

#### ScrollController
```javascript
class ScrollController {
  constructor(sceneManager)
  init()
  createCameraPathAnimation()
  createSectionAnimations()
  createParallaxEffects()
  setupSectionPinning()
  
  // ScrollTrigger instances
  triggers: []
  timeline: gsap.timeline()
}
```

### Interaction Components

#### CursorController
```javascript
class CursorController {
  constructor()
  init()
  update(x, y)
  setHoverState(isHovering)
}
```

#### ModalController
```javascript
class ModalController {
  constructor()
  show(planetData)
  hide()
  isOpen()
}
```

#### AudioController
```javascript
class AudioController {
  constructor()
  init()
  load(url)
  play()
  pause()
  toggle()
  setVolume(level)
}
```

### Asset Loader

#### AssetManager
```javascript
class AssetManager {
  constructor()
  loadTexture(path)
  loadAudio(path)
  loadFont(name)
  getProgress() // Returns 0-1
  onComplete(callback)
  
  // Lazy loading
  preloadSection(sectionIndex)
  unloadSection(sectionIndex)
}
```

## Data Models

### Section Configuration
```javascript
const SECTIONS = [
  {
    id: 'hero',
    index: 0,
    title: 'MISSION: ARES VII',
    subtitle: "Humanity's next great leap — 140 million miles away.",
    cameraPosition: { x: 0, y: 0, z: 50 },
    cameraTarget: { x: 0, y: 0, z: 0 },
    objects: ['earth', 'starfield'],
    animations: ['earthRotation', 'textGlitch'],
    scrollDuration: 1 // viewport heights
  },
  {
    id: 'launch',
    index: 1,
    title: 'LAUNCH SEQUENCE',
    cameraPosition: { x: 20, y: 30, z: 40 },
    cameraTarget: { x: 0, y: 10, z: 0 },
    objects: ['rocket', 'earth', 'starfield'],
    animations: ['rocketRise', 'exhaustParticles'],
    scrollDuration: 2, // pinned section
    stats: [
      { label: 'Distance', value: 0, unit: 'km', target: 400 },
      { label: 'Speed', value: 0, unit: 'km/s', target: 11.2 },
      { label: 'Fuel', value: 100, unit: '%', target: 85 },
      { label: 'Crew', value: 6, unit: '', target: 6 }
    ]
  },
  {
    id: 'deep-space',
    index: 2,
    title: 'INTERSTELLAR TRAVEL',
    cameraPosition: { x: 0, y: 0, z: 100 },
    cameraTarget: { x: 0, y: 0, z: 200 },
    objects: ['asteroids', 'starfield'],
    animations: ['starWarp', 'asteroidRotation'],
    scrollDuration: 3, // extended pinned section
    missionLogs: [
      { day: 30, title: 'Systems Check', content: 'All systems nominal...' },
      { day: 60, title: 'Midpoint', content: 'Halfway to Mars...' },
      { day: 90, title: 'Final Approach', content: 'Mars visible ahead...' }
    ]
  },
  {
    id: 'mars-orbit',
    index: 3,
    title: 'APPROACHING MARS',
    cameraPosition: { x: -30, y: 20, z: 80 },
    cameraTarget: { x: 0, y: 0, z: 0 },
    objects: ['mars', 'starfield'],
    animations: ['marsGrow', 'dustStorm'],
    scrollDuration: 1.5,
    facts: [
      'Surface temperature: -63°C average',
      'Gravity: 38% of Earth',
      'Day length: 24h 37m',
      'Distance from Sun: 228M km'
    ]
  },
  {
    id: 'landing',
    index: 4,
    title: 'TOUCHDOWN — SOL 1',
    cameraPosition: { x: 0, y: 50, z: 30 },
    cameraTarget: { x: 0, y: 0, z: 0 },
    objects: ['terrain', 'mars'],
    animations: ['landingDust', 'terrainRotation'],
    scrollDuration: 1,
    objectives: [
      'Deploy solar panels',
      'Establish communication',
      'Collect soil samples',
      'Set up habitat',
      'Begin exploration'
    ]
  }
];
```

### Planet Data Model
```javascript
const PLANET_DATA = {
  earth: {
    name: 'Earth',
    radius: 6371,
    texture: 'assets/textures/earth_map.jpg',
    normalMap: 'assets/textures/earth_normal.jpg',
    cloudTexture: 'assets/textures/earth_clouds.jpg',
    atmosphere: {
      color: 0x4488ff,
      intensity: 0.3
    },
    rotation: { x: 0, y: 0.001, z: 0 },
    lore: 'Home. The pale blue dot we leave behind...'
  },
  mars: {
    name: 'Mars',
    radius: 3389,
    texture: 'assets/textures/mars_map.jpg',
    normalMap: 'assets/textures/mars_normal.jpg',
    displacementMap: 'assets/textures/mars_displacement.jpg',
    atmosphere: {
      color: 0xff6644,
      intensity: 0.1
    },
    rotation: { x: 0, y: 0.0008, z: 0 },
    lore: 'The Red Planet. Our next frontier...'
  }
};
```

### Animation Configuration
```javascript
const ANIMATION_CONFIG = {
  loader: {
    duration: 3,
    countdownFrom: 10,
    dissolveEffect: 'fade'
  },
  textReveal: {
    stagger: 0.03,
    duration: 0.8,
    ease: 'power2.out'
  },
  cameraPath: {
    tension: 0.5,
    closed: false,
    points: [
      new THREE.Vector3(0, 0, 50),    // Section 1
      new THREE.Vector3(20, 30, 40),  // Section 2
      new THREE.Vector3(0, 0, 100),   // Section 3
      new THREE.Vector3(-30, 20, 80), // Section 4
      new THREE.Vector3(0, 50, 30)    // Section 5
    ]
  },
  particles: {
    stars: { count: 15000, size: 0.5, speed: 0.0001 },
    exhaust: { count: 500, size: 2, lifetime: 2, emitRate: 50 },
    asteroids: { count: 3000, size: 1.5, rotationSpeed: 0.002 },
    dust: { count: 1000, size: 1, lifetime: 1.5, radialSpeed: 5 }
  }
};
```

### Responsive Configuration
```javascript
const RESPONSIVE_CONFIG = {
  desktop: {
    breakpoint: 1024,
    renderer: { antialias: false, pixelRatio: Math.min(window.devicePixelRatio, 2) },
    particles: { multiplier: 1.0 },
    effects: { all: true }
  },
  tablet: {
    breakpoint: 768,
    renderer: { antialias: false, pixelRatio: 1.5 },
    particles: { multiplier: 0.4 },
    effects: { all: true }
  },
  mobile: {
    breakpoint: 0,
    renderer: { enabled: false },
    particles: { multiplier: 0 },
    effects: { cssOnly: true },
    fallback: 'gradient-animation'
  }
};
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Section configuration completeness
*For any* section in the SECTIONS array, that section must have all required properties: id, index, title, cameraPosition, cameraTarget, objects, animations, and scrollDuration.
**Validates: Requirements 1.3**

### Property 2: Sequential section navigation
*For any* scroll position value, as scroll progress increases, the active section index must increase monotonically (never decrease), ensuring sections are traversed in order: 0 → 1 → 2 → 3 → 4.
**Validates: Requirements 1.4**

### Property 3: Desktop viewport section height
*For any* section element when viewport width exceeds 1024px, the computed height must equal the viewport height (100vh).
**Validates: Requirements 1.5**

### Property 4: Starfield parallax depth correlation
*For any* two star particles at different z-positions, the particle with greater z-depth (further away) must move slower than the particle with lesser z-depth when camera moves, creating parallax effect.
**Validates: Requirements 2.1**

### Property 5: Camera path scroll synchronization
*For any* scroll progress value between 0 and 1, the camera position must equal the point on the CatmullRomCurve3 path at that progress value, ensuring camera movement is perfectly synchronized with scroll.
**Validates: Requirements 2.7, 3.1**

### Property 6: Earth shrink during scroll progression
*For any* scroll progress value beyond Section 1 (progress > 0.2), the Earth sphere's scale must be less than or equal to its scale at the previous scroll position, ensuring continuous shrinking.
**Validates: Requirements 3.2**

### Property 7: Mars growth during approach
*For any* scroll progress value approaching Section 4 (0.5 < progress < 0.8), the Mars sphere's scale must be greater than or equal to its scale at the previous scroll position, ensuring continuous growth.
**Validates: Requirements 3.3**

### Property 8: Text reveal stagger timing
*For any* section that becomes active, each character in the section title must begin its reveal animation after the previous character, with consistent stagger delay between characters.
**Validates: Requirements 3.4**

### Property 9: Parallax speed differentiation
*For any* two UI elements with different parallax factors, the element with higher parallax factor must move a greater distance than the element with lower parallax factor for the same scroll distance.
**Validates: Requirements 3.5**

### Property 10: Custom cursor position tracking
*For any* mouse movement event, the custom cursor element's position must update to match the mouse coordinates within one animation frame.
**Validates: Requirements 4.1**

### Property 11: Card hover transformation
*For any* mission stat card element, when a hover event occurs, the element must have a 3D transform applied, and when hover ends, the transform must return to identity.
**Validates: Requirements 4.2**

### Property 12: Planet click modal display
*For any* planet object that is clicked, a modal must be displayed containing the data associated with that specific planet (name, lore, facts).
**Validates: Requirements 4.3**

### Property 13: Terrain rotation proportional to mouse position
*For any* mouse position in Section 5, the terrain mesh rotation must be proportional to the normalized mouse coordinates (x, y) relative to viewport center.
**Validates: Requirements 4.4**

### Property 14: Audio toggle state round-trip
*For any* audio playback state (playing or paused), toggling twice must return to the original state, ensuring toggle operations are reversible.
**Validates: Requirements 4.5, 11.2, 11.4**

### Property 15: Section transition effect trigger
*For any* section transition (change in active section index), a chromatic aberration effect must be triggered exactly once per transition.
**Validates: Requirements 5.2**

### Property 16: Color contrast accessibility
*For any* text element and its background, the computed color contrast ratio must be at least 4.5:1, ensuring readability.
**Validates: Requirements 6.5**

### Property 17: Responsive 3D rendering toggle
*For any* viewport width change that crosses a breakpoint (1024px or 768px), the 3D rendering state must update to match the configuration for that breakpoint.
**Validates: Requirements 7.5**

### Property 18: Resource disposal on section exit
*For any* section that becomes inactive, all geometries and textures unique to that section must be disposed from memory, preventing memory leaks.
**Validates: Requirements 8.2**

### Property 19: Lazy loading proximity trigger
*For any* section N, its textures must be loaded when the current active section is within 2 sections (N-2, N-1, N, N+1, N+2), and unloaded otherwise.
**Validates: Requirements 8.4**

### Property 20: Interactive element accessibility
*For any* interactive element (button, card, planet), it must have an aria-label attribute and be keyboard focusable (tabindex >= 0).
**Validates: Requirements 10.3, 10.4**

## Error Handling

### Three.js Rendering Errors

**WebGL Context Loss**
- Detect context loss via `webglcontextlost` event
- Pause render loop and display user-friendly message
- Attempt context restoration via `webglcontextrestored` event
- If restoration fails after 3 attempts, fall back to CSS gradient background

**Shader Compilation Errors**
- Wrap shader compilation in try-catch blocks
- Log detailed error messages to console for debugging
- Fall back to MeshBasicMaterial if custom shaders fail
- Display warning in development mode only

**Asset Loading Failures**
- Implement retry logic with exponential backoff (3 attempts)
- Use placeholder textures if loading fails after retries
- Continue application initialization even if non-critical assets fail
- Log failed asset URLs for debugging

### GSAP Animation Errors

**ScrollTrigger Initialization Failures**
- Verify DOM elements exist before creating ScrollTriggers
- Use defensive checks for null/undefined elements
- Gracefully degrade to CSS-only animations if GSAP fails to load
- Provide fallback scroll behavior using IntersectionObserver

**Timeline Conflicts**
- Ensure only one timeline controls each property at a time
- Kill existing tweens before creating new ones on the same target
- Use unique IDs for all ScrollTrigger instances to prevent conflicts

### User Interaction Errors

**Raycasting Misses**
- Return early if raycaster intersects array is empty
- Provide visual feedback (cursor change) only when hovering valid targets
- Prevent click handlers from firing on non-interactive objects

**Audio Playback Failures**
- Wrap audio.play() in try-catch (browsers may block autoplay)
- Require user interaction before attempting audio playback
- Display audio icon with visual indication if playback is blocked
- Provide manual play button as fallback

**Modal State Errors**
- Prevent multiple modals from opening simultaneously
- Ensure modal close handlers are always attached
- Trap focus within modal when open
- Restore focus to trigger element on close

### Performance Degradation

**Low Frame Rate Detection**
- Monitor frame time using performance.now()
- If average FPS drops below 30 for 3 consecutive seconds:
  - Reduce particle count by 50%
  - Disable post-processing effects
  - Lower renderer pixel ratio to 1.0
  - Display performance warning to user

**Memory Pressure**
- Monitor memory usage via performance.memory (Chrome)
- If heap size exceeds 80% of limit:
  - Aggressively dispose unused resources
  - Reduce texture resolution
  - Disable particle systems temporarily
  - Force garbage collection if available

### Responsive Breakpoint Errors

**Breakpoint Transition Glitches**
- Debounce resize events (250ms) to prevent rapid re-initialization
- Complete current animations before switching rendering modes
- Preserve scroll position when toggling between 3D and CSS modes
- Clear all ScrollTriggers before recreating at new breakpoint

### Accessibility Errors

**Reduced Motion Preference**
- Check `prefers-reduced-motion` on initialization and when changed
- Immediately kill all GSAP timelines if preference is enabled
- Disable particle systems and camera animations
- Provide static section layouts with instant transitions

**Keyboard Navigation Failures**
- Ensure all interactive elements are in logical tab order
- Provide skip links for keyboard users
- Trap focus in modals and restore on close
- Provide keyboard shortcuts for common actions (ESC to close modal)

## Testing Strategy

### Unit Testing Approach

Unit tests will verify specific examples, edge cases, and integration points between components. The testing framework will be **Vitest** for its speed, ESM support, and compatibility with Three.js.

**Key Unit Test Areas:**

1. **Component Initialization**
   - SceneManager creates renderer with correct settings
   - All required 3D objects are added to scene
   - Camera path curve is properly constructed
   - Asset loading completes successfully

2. **Section Configuration**
   - Each section has required properties
   - Section data matches expected structure
   - Planet data contains all required fields

3. **Responsive Behavior**
   - Correct configuration applied at each breakpoint
   - 3D rendering disabled on mobile
   - Particle counts adjusted at tablet breakpoint

4. **Accessibility**
   - All interactive elements have aria-labels
   - Focus management works correctly
   - Reduced motion preference is respected

5. **Error Handling**
   - Asset loading failures handled gracefully
   - WebGL context loss recovery works
   - Audio playback errors don't crash app

**Unit Test Example:**
```javascript
describe('SceneManager', () => {
  it('should create Earth with correct materials', () => {
    const manager = new SceneManager(canvas);
    manager.init();
    const earth = manager.objects.earth;
    
    expect(earth).toBeDefined();
    expect(earth.material.map).toBeDefined(); // texture
    expect(earth.material.normalMap).toBeDefined();
    expect(earth.children).toContain(cloudLayer);
  });
});
```

### Property-Based Testing Approach

Property-based tests will verify universal properties that should hold across all inputs using **fast-check**, a mature property-based testing library for JavaScript/TypeScript.

**Configuration:**
- Minimum 100 iterations per property test
- Seed-based reproducibility for failed tests
- Shrinking enabled to find minimal failing cases

**Key Property Test Areas:**

1. **Scroll Synchronization Properties**
   - Camera position matches curve at any scroll progress
   - Section transitions occur in correct order
   - Object scales change monotonically

2. **Parallax and Animation Properties**
   - Parallax speeds are correctly differentiated
   - Text stagger timing is consistent
   - Animation states are reversible (round-trip)

3. **Interaction Properties**
   - Cursor tracks mouse position accurately
   - Hover effects apply and remove correctly
   - Modal displays correct data for any planet

4. **Resource Management Properties**
   - Lazy loading triggers at correct distances
   - Resources are disposed on section exit
   - No memory leaks across section transitions

5. **Accessibility Properties**
   - All interactive elements are accessible
   - Contrast ratios meet requirements
   - Keyboard navigation works for any element

**Property Test Example:**
```javascript
import fc from 'fast-check';

describe('Property: Camera path scroll synchronization', () => {
  it('camera position matches curve at any scroll progress', () => {
    // Feature: mars-odyssey, Property 5: Camera path scroll synchronization
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 1 }), // scroll progress
        (progress) => {
          const manager = new SceneManager(canvas);
          manager.init();
          const curve = manager.getCameraPath();
          
          // Update camera based on scroll
          manager.updateCameraFromScroll(progress);
          
          // Expected position from curve
          const expectedPos = curve.getPoint(progress);
          const actualPos = manager.camera.position;
          
          // Positions should match within floating point tolerance
          expect(actualPos.distanceTo(expectedPos)).toBeLessThan(0.01);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

**Property Test Tagging:**
- Each property test MUST include a comment with format: `// Feature: mars-odyssey, Property {number}: {property_text}`
- This links tests directly to design document properties
- Enables traceability from requirements → properties → tests

### Integration Testing

Integration tests will verify that modules work together correctly:

1. **Loader → SceneManager Integration**
   - Assets loaded by loader are available to scene
   - Scene initialization waits for loader completion

2. **SceneManager → ScrollController Integration**
   - ScrollController can access and animate scene objects
   - Camera path updates are reflected in rendering

3. **ScrollController → Interactions Integration**
   - Scroll position affects interaction availability
   - Interactions don't interfere with scroll animations

4. **End-to-End User Flows**
   - Complete scroll journey from Section 1 to 5
   - Planet click → modal → close → resume scroll
   - Audio toggle → scroll → audio continues

### Testing Tools and Setup

**Framework:** Vitest
- Fast execution with native ESM support
- Compatible with Three.js and GSAP
- Built-in coverage reporting

**Property Testing:** fast-check
- Mature JavaScript PBT library
- Excellent shrinking capabilities
- Integrates seamlessly with Vitest

**Test Utilities:**
- **@testing-library/dom** - DOM interaction utilities
- **vitest-canvas-mock** - Mock canvas for Three.js tests
- **vitest-webgl-mock** - Mock WebGL context

**Coverage Goals:**
- Line coverage: > 80%
- Branch coverage: > 75%
- Property coverage: 100% of defined properties tested

### Test Execution Strategy

1. **Development:** Run unit tests on file save (watch mode)
2. **Pre-commit:** Run all unit tests + fast property tests (10 iterations)
3. **CI Pipeline:** Run full test suite with 100 iterations per property
4. **Performance Tests:** Run separately with real browser (Playwright)


## Implementation Details

### Three.js Scene Setup

**Renderer Configuration:**
```javascript
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#webgl-canvas'),
  antialias: window.innerWidth > 1024 ? false : false, // disabled for performance
  alpha: true,
  powerPreference: 'high-performance'
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
```

**Camera Setup:**
```javascript
const camera = new THREE.PerspectiveCamera(
  75, // FOV
  window.innerWidth / window.innerHeight, // aspect
  0.1, // near
  2000 // far
);
```

**Lighting:**
```javascript
// Ambient light for base illumination
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);

// Directional light for sun
const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
sunLight.position.set(100, 50, 100);

// Point light for Mars (reddish glow)
const marsLight = new THREE.PointLight(0xff6644, 0.5, 200);
```

### Particle System Implementation

**Starfield:**
```javascript
const starGeometry = new THREE.BufferGeometry();
const starCount = 15000;
const positions = new Float32Array(starCount * 3);
const velocities = new Float32Array(starCount * 3);

for (let i = 0; i < starCount * 3; i += 3) {
  positions[i] = (Math.random() - 0.5) * 2000;     // x
  positions[i + 1] = (Math.random() - 0.5) * 2000; // y
  positions[i + 2] = (Math.random() - 0.5) * 1000; // z (depth)
  
  // Velocity for parallax (based on z-depth)
  velocities[i + 2] = positions[i + 2] / 1000; // normalized depth
}

starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
starGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

const starMaterial = new THREE.PointsMaterial({
  color: 0xF0F4FF,
  size: 0.5,
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending
});

const starfield = new THREE.Points(starGeometry, starMaterial);
```

**Exhaust Particles:**
```javascript
class ExhaustEmitter {
  constructor(rocketPosition) {
    this.particles = [];
    this.emitRate = 50; // particles per second
    this.lastEmit = 0;
  }
  
  update(deltaTime) {
    const now = performance.now();
    if (now - this.lastEmit > 1000 / this.emitRate) {
      this.emit();
      this.lastEmit = now;
    }
    
    // Update existing particles
    this.particles.forEach(p => {
      p.position.y -= p.velocity * deltaTime;
      p.life -= deltaTime;
      p.opacity = p.life / p.maxLife;
    });
    
    // Remove dead particles
    this.particles = this.particles.filter(p => p.life > 0);
  }
  
  emit() {
    this.particles.push({
      position: this.rocketPosition.clone(),
      velocity: 5 + Math.random() * 3,
      life: 2,
      maxLife: 2,
      opacity: 1
    });
  }
}
```

### GSAP ScrollTrigger Configuration

**Camera Path Animation:**
```javascript
const cameraPath = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 0, 50),    // Section 1: Earth view
  new THREE.Vector3(20, 30, 40),  // Section 2: Launch
  new THREE.Vector3(0, 0, 100),   // Section 3: Deep space
  new THREE.Vector3(-30, 20, 80), // Section 4: Mars orbit
  new THREE.Vector3(0, 50, 30)    // Section 5: Landing
]);

ScrollTrigger.create({
  trigger: 'body',
  start: 'top top',
  end: 'bottom bottom',
  scrub: 1, // smooth scrubbing
  onUpdate: (self) => {
    const progress = self.progress;
    const point = cameraPath.getPoint(progress);
    camera.position.copy(point);
    
    // Update camera target based on section
    const sectionIndex = Math.floor(progress * 5);
    const target = SECTIONS[sectionIndex].cameraTarget;
    camera.lookAt(target.x, target.y, target.z);
  }
});
```

**Section Pinning (Deep Space):**
```javascript
ScrollTrigger.create({
  trigger: '#section-deep-space',
  start: 'top top',
  end: '+=300%', // pinned for 3x viewport height
  pin: true,
  scrub: true,
  onEnter: () => {
    // Activate star warp effect
    gsap.to(starMaterial, {
      size: 2,
      duration: 1
    });
  },
  onLeave: () => {
    // Deactivate star warp
    gsap.to(starMaterial, {
      size: 0.5,
      duration: 1
    });
  }
});
```

**Text Reveal Animation:**
```javascript
gsap.registerPlugin(SplitText);

SECTIONS.forEach((section, index) => {
  const split = new SplitText(`#section-${section.id} h1`, {
    type: 'chars'
  });
  
  ScrollTrigger.create({
    trigger: `#section-${section.id}`,
    start: 'top center',
    onEnter: () => {
      gsap.from(split.chars, {
        opacity: 0,
        y: 50,
        rotationX: -90,
        stagger: 0.03,
        duration: 0.8,
        ease: 'power2.out'
      });
    }
  });
});
```

### Responsive Implementation

**Breakpoint Detection:**
```javascript
const breakpoints = {
  desktop: window.matchMedia('(min-width: 1025px)'),
  tablet: window.matchMedia('(min-width: 768px) and (max-width: 1024px)'),
  mobile: window.matchMedia('(max-width: 767px)')
};

function handleBreakpointChange() {
  if (breakpoints.mobile.matches) {
    // Disable 3D, show CSS gradient
    renderer.domElement.style.display = 'none';
    document.body.classList.add('mobile-fallback');
    
    // Use IntersectionObserver for scroll animations
    setupIntersectionObserver();
  } else if (breakpoints.tablet.matches) {
    // Reduce particle count
    updateParticleCount(0.4);
    renderer.domElement.style.display = 'block';
  } else {
    // Full desktop experience
    updateParticleCount(1.0);
    renderer.domElement.style.display = 'block';
  }
}

breakpoints.desktop.addEventListener('change', handleBreakpointChange);
breakpoints.tablet.addEventListener('change', handleBreakpointChange);
breakpoints.mobile.addEventListener('change', handleBreakpointChange);
```

**Mobile Fallback:**
```css
.mobile-fallback {
  background: linear-gradient(
    180deg,
    #03040A 0%,
    #060D1F 25%,
    #1A0A2E 50%,
    #2D1B3D 75%,
    #C1440E 100%
  );
  animation: gradientShift 20s ease infinite;
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 0%; }
  50% { background-position: 0% 100%; }
}
```

### Performance Optimizations

**Lazy Loading Strategy:**
```javascript
class AssetManager {
  constructor() {
    this.loadedSections = new Set();
    this.currentSection = 0;
  }
  
  updateCurrentSection(index) {
    this.currentSection = index;
    
    // Load sections within range
    for (let i = Math.max(0, index - 2); i <= Math.min(4, index + 2); i++) {
      if (!this.loadedSections.has(i)) {
        this.loadSection(i);
      }
    }
    
    // Unload sections outside range
    this.loadedSections.forEach(sectionIndex => {
      if (Math.abs(sectionIndex - index) > 2) {
        this.unloadSection(sectionIndex);
      }
    });
  }
  
  loadSection(index) {
    const section = SECTIONS[index];
    section.objects.forEach(objName => {
      // Load textures for this object
      const textures = PLANET_DATA[objName]?.textures || [];
      textures.forEach(url => this.textureLoader.load(url));
    });
    this.loadedSections.add(index);
  }
  
  unloadSection(index) {
    const section = SECTIONS[index];
    section.objects.forEach(objName => {
      // Dispose geometries and materials
      const obj = sceneManager.objects[objName];
      if (obj) {
        obj.geometry?.dispose();
        obj.material?.dispose();
        obj.material?.map?.dispose();
      }
    });
    this.loadedSections.delete(index);
  }
}
```

**Frame Rate Monitoring:**
```javascript
class PerformanceMonitor {
  constructor() {
    this.frameTimes = [];
    this.maxSamples = 60;
  }
  
  update(deltaTime) {
    this.frameTimes.push(deltaTime);
    if (this.frameTimes.length > this.maxSamples) {
      this.frameTimes.shift();
    }
    
    const avgFrameTime = this.frameTimes.reduce((a, b) => a + b) / this.frameTimes.length;
    const fps = 1000 / avgFrameTime;
    
    if (fps < 30 && this.frameTimes.length === this.maxSamples) {
      this.degradePerformance();
    }
  }
  
  degradePerformance() {
    console.warn('Low FPS detected, reducing quality');
    
    // Reduce particle count
    sceneManager.updateParticleCount(0.5);
    
    // Lower pixel ratio
    renderer.setPixelRatio(1.0);
    
    // Disable expensive effects
    renderer.shadowMap.enabled = false;
  }
}
```

### Accessibility Implementation

**Reduced Motion Support:**
```javascript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function handleReducedMotion() {
  if (prefersReducedMotion.matches) {
    // Kill all GSAP animations
    gsap.globalTimeline.clear();
    ScrollTrigger.getAll().forEach(st => st.kill());
    
    // Disable particle systems
    sceneManager.disableParticles();
    
    // Show static layouts
    document.body.classList.add('reduced-motion');
    
    // Use instant section transitions
    setupStaticSections();
  }
}

prefersReducedMotion.addEventListener('change', handleReducedMotion);
handleReducedMotion(); // Check on load
```

**Keyboard Navigation:**
```javascript
// Focus trap for modal
function trapFocus(modal) {
  const focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
    
    if (e.key === 'Escape') {
      closeModal();
    }
  });
}
```

## Deployment Considerations

### Build Process
- Bundle with Vite for optimal tree-shaking and code splitting
- Separate chunks for Three.js, GSAP, and application code
- Compress textures to WebP format with fallbacks
- Minify and compress all assets

### Performance Budget
- Initial bundle: < 200KB (gzipped)
- Three.js chunk: < 150KB (gzipped)
- Total assets (textures + audio): < 5MB
- Time to Interactive: < 3s on 3G

### Browser Support
- Chrome/Edge: 90+
- Firefox: 88+
- Safari: 14+
- Mobile Safari: 14+
- No IE11 support (WebGL 2 required)

### Hosting Recommendations
- CDN for static assets (textures, audio)
- Enable Brotli compression
- Set aggressive cache headers for immutable assets
- Use HTTP/2 for multiplexing

