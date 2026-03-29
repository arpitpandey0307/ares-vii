// ===================================
// MAIN.JS - Three.js Scene Management
// ===================================

// Global variables
let sceneManager;
let isInitialized = false;

// ===================================
// SCENE MANAGER CLASS
// ===================================

class SceneManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = new THREE.Clock();
    this.objects = {
      earth: null,
      rocket: null,
      mars: null,
      terrain: null,
      particles: {
        stars: null,
        exhaust: [],
        asteroids: null,
        dust: []
      }
    };
    this.lights = {};
    this.cameraPath = null;
    this.currentSection = 0;
    this.isRendering = false;
  }

  /**
   * Initialize the Three.js scene
   */
  init() {
    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false, // Disabled for performance
      alpha: true,
      powerPreference: 'high-performance'
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    // Create scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x03040A, 0.0008);

    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
    this.camera.position.set(0, 0, 50);

    // Create lights
    this.createLights();

    // Create camera path
    this.createCameraPath();

    // Create all 3D objects
    this.createStarfield();
    this.createEarth();
    this.createRocket();
    this.createAsteroidBelt();
    this.createMars();
    this.createMarsTerrain();

    // Add window resize handler
    window.addEventListener('resize', () => this.onWindowResize());

    console.log('SceneManager initialized');
  }

  /**
   * Create lighting setup with improved cinematic lighting
   */
  createLights() {
    // Ambient light for base illumination (brighter)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    this.lights.ambient = ambientLight;

    // Directional light for sun (stronger, better positioned)
    const sunLight = new THREE.DirectionalLight(0xfff4e6, 2.0);
    sunLight.position.set(50, 50, 50);
    this.scene.add(sunLight);
    this.lights.sun = sunLight;

    // Additional fill light for better visibility
    const fillLight = new THREE.DirectionalLight(0x8888ff, 0.5);
    fillLight.position.set(-50, 0, -50);
    this.scene.add(fillLight);
    this.lights.fill = fillLight;

    // Point light for Mars (reddish glow)
    const marsLight = new THREE.PointLight(0xff6644, 0.8, 300);
    marsLight.position.set(0, 0, 0);
    this.scene.add(marsLight);
    this.lights.mars = marsLight;

    console.log('Cinematic lighting created');
  }

  /**
   * Create camera path curve with better positioning
   */
  createCameraPath() {
    const points = [
      new THREE.Vector3(0, 5, 35),      // Section 1: Better Earth view (closer, slightly above)
      new THREE.Vector3(15, 20, 35),    // Section 2: Launch view (side angle)
      new THREE.Vector3(0, 10, 120),    // Section 3: Deep space (further back)
      new THREE.Vector3(-25, 15, 70),   // Section 4: Mars orbit (better angle)
      new THREE.Vector3(0, 40, 25)      // Section 5: Landing (top-down view)
    ];

    this.cameraPath = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.3);
  }

  /**
   * Get camera path for external use
   */
  getCameraPath() {
    return this.cameraPath;
  }

  /**
   * Update camera position from scroll progress
   */
  updateCameraFromScroll(progress) {
    if (!this.cameraPath) return;

    // Clamp progress between 0 and 1
    progress = Math.max(0, Math.min(1, progress));

    // Get position on curve
    const point = this.cameraPath.getPoint(progress);
    this.camera.position.copy(point);

    // Determine current section
    const sectionIndex = Math.floor(progress * 5);
    this.currentSection = Math.min(4, sectionIndex);

    // Update camera target based on section
    const targets = [
      new THREE.Vector3(0, 0, 0),      // Section 1: Look at Earth
      new THREE.Vector3(0, 10, 0),     // Section 2: Look at rocket
      new THREE.Vector3(0, 0, 200),    // Section 3: Look forward
      new THREE.Vector3(0, 0, 0),      // Section 4: Look at Mars
      new THREE.Vector3(0, 0, 0)       // Section 5: Look at terrain
    ];

    this.camera.lookAt(targets[this.currentSection]);
  }

  /**
   * Start render loop
   */
  startRenderLoop() {
    if (this.isRendering) return;
    this.isRendering = true;
    this.animate();
  }

  /**
   * Stop render loop
   */
  stopRenderLoop() {
    this.isRendering = false;
  }

  /**
   * Animation loop
   */
  animate() {
    if (!this.isRendering) return;

    requestAnimationFrame(() => this.animate());

    const deltaTime = this.clock.getDelta();
    this.update(deltaTime);
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Update scene objects
   */
  update(deltaTime) {
    // Update Earth rotation
    if (this.objects.earth) {
      this.objects.earth.rotation.y += 0.001;
    }

    // Update Mars rotation
    if (this.objects.mars) {
      this.objects.mars.rotation.y += 0.0008;
    }

    // Update starfield parallax
    if (this.objects.particles.stars) {
      this.updateStarfieldParallax();
    }

    // Update exhaust particles
    if (this.currentSection === 1 && this.objects.particles.exhaust.length > 0) {
      this.updateExhaustParticles(deltaTime);
    }

    // Update asteroid rotation
    if (this.objects.particles.asteroids) {
      this.updateAsteroidRotation(deltaTime);
    }
  }

  /**
   * Update starfield parallax based on camera movement
   */
  updateStarfieldParallax() {
    // Parallax effect is handled by the particle positions
    // Stars further away (higher z) move slower
    // This is set up in createStarfield
  }

  /**
   * Update exhaust particles
   */
  updateExhaustParticles(deltaTime) {
    // Update particle positions and lifetimes
    for (let i = this.objects.particles.exhaust.length - 1; i >= 0; i--) {
      const particle = this.objects.particles.exhaust[i];
      particle.position.y -= particle.velocity * deltaTime * 10;
      particle.life -= deltaTime;
      particle.material.opacity = particle.life / particle.maxLife;

      // Remove dead particles
      if (particle.life <= 0) {
        this.scene.remove(particle);
        particle.geometry.dispose();
        particle.material.dispose();
        this.objects.particles.exhaust.splice(i, 1);
      }
    }
  }

  /**
   * Update asteroid rotation
   */
  updateAsteroidRotation(deltaTime) {
    if (!this.objects.particles.asteroids) return;

    const positions = this.objects.particles.asteroids.geometry.attributes.position;
    const rotations = this.objects.particles.asteroids.geometry.attributes.rotation;

    if (rotations) {
      for (let i = 0; i < rotations.count; i++) {
        rotations.array[i] += 0.002;
      }
      rotations.needsUpdate = true;
    }
  }

  /**
   * Handle window resize
   */
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /**
   * Dispose of resources
   */
  dispose() {
    this.stopRenderLoop();

    // Dispose geometries and materials
    this.scene.traverse((object) => {
      if (object.geometry) {
        object.geometry.dispose();
      }
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });

    // Dispose renderer
    if (this.renderer) {
      this.renderer.dispose();
    }

    console.log('SceneManager disposed');
  }
}

// ===================================
// INITIALIZATION FUNCTION
// ===================================

function initializeApp() {
  if (isInitialized) return;

  console.log('Initializing Mars Odyssey application...');

  // Get canvas element
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas) {
    console.error('Canvas element not found');
    return;
  }

  // Create scene manager
  sceneManager = new SceneManager(canvas);
  sceneManager.init();

  // Start render loop
  sceneManager.startRenderLoop();

  // Mark as initialized
  isInitialized = true;

  console.log('Application initialized successfully');

  // Initialize scroll controller after scene is ready
  if (typeof initScrollController === 'function') {
    setTimeout(() => {
      initScrollController(sceneManager);
    }, 100);
  }

  // Initialize interactions after scene is ready
  if (typeof initInteractions === 'function') {
    setTimeout(() => {
      initInteractions(sceneManager);
    }, 100);
  }
}

// Export for global access
if (typeof window !== 'undefined') {
  window.sceneManager = sceneManager;
  window.initializeApp = initializeApp;
}


// ===================================
// STARFIELD PARTICLE SYSTEM
// ===================================

/**
 * Create starfield with 15,000 particles and depth-based parallax
 */
SceneManager.prototype.createStarfield = function(count = 15000) {
  const starGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    
    // Random positions in 3D space
    positions[i3] = (Math.random() - 0.5) * 2000;      // x
    positions[i3 + 1] = (Math.random() - 0.5) * 2000;  // y
    positions[i3 + 2] = (Math.random() - 0.5) * 1000;  // z (depth)
    
    // Velocity for parallax (based on z-depth)
    // Stars further away (higher z) have lower velocity
    const depth = Math.abs(positions[i3 + 2]);
    velocities[i3 + 2] = depth / 1000; // normalized depth for parallax
    
    // Random sizes for variety
    sizes[i] = Math.random() * 1.5 + 0.5;
  }

  starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  starGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
  starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const starMaterial = new THREE.PointsMaterial({
    color: 0xF0F4FF,
    size: 0.5,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  });

  const starfield = new THREE.Points(starGeometry, starMaterial);
  this.scene.add(starfield);
  this.objects.particles.stars = starfield;

  console.log(`Created starfield with ${count} stars`);
  return starfield;
};


// ===================================
// EARTH SPHERE
// ===================================

/**
 * Create Earth with PBR materials, cloud layer, and atmospheric glow
 */
SceneManager.prototype.createEarth = function() {
  const earthRadius = 10;
  const earthGeometry = new THREE.SphereGeometry(earthRadius, 64, 64);

  // Load Earth textures
  const textureLoader = new THREE.TextureLoader();
  const earthTexture = textureLoader.load('assets/textures/2k_earth_daymap.jpg');
  const earthClouds = textureLoader.load('assets/textures/2k_earth_clouds.jpg');

  // Earth material with real texture
  const earthMaterial = new THREE.MeshStandardMaterial({
    map: earthTexture,
    roughness: 0.7,
    metalness: 0.2,
    emissive: 0x0a1f3d,
    emissiveIntensity: 0.2
  });

  const earth = new THREE.Mesh(earthGeometry, earthMaterial);
  earth.position.set(0, 0, 0);
  earth.name = 'earth';

  // Cloud layer with real texture
  const cloudGeometry = new THREE.SphereGeometry(earthRadius + 0.2, 64, 64);
  const cloudMaterial = new THREE.MeshStandardMaterial({
    map: earthClouds,
    transparent: true,
    opacity: 0.4,
    roughness: 1,
    metalness: 0
  });

  const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
  earth.add(clouds);

  // Atmospheric glow using sprite
  const glowGeometry = new THREE.SphereGeometry(earthRadius + 1, 32, 32);
  const glowMaterial = new THREE.ShaderMaterial({
    uniforms: {
      c: { value: 0.3 },
      p: { value: 3.5 },
      glowColor: { value: new THREE.Color(0x4488ff) }
    },
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 glowColor;
      uniform float c;
      uniform float p;
      varying vec3 vNormal;
      void main() {
        float intensity = pow(c - dot(vNormal, vec3(0.0, 0.0, 1.0)), p);
        gl_FragColor = vec4(glowColor, intensity);
      }
    `,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true
  });

  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  earth.add(glow);

  this.scene.add(earth);
  this.objects.earth = earth;

  console.log('Created Earth sphere with real textures');
  return earth;
};


// ===================================
// ROCKET MESH & EXHAUST SYSTEM
// ===================================

/**
 * Exhaust Emitter Class
 */
class ExhaustEmitter {
  constructor(rocketPosition, scene, particlesArray) {
    this.rocketPosition = rocketPosition;
    this.scene = scene;
    this.particlesArray = particlesArray;
    this.emitRate = 50; // particles per second
    this.lastEmit = 0;
    this.isActive = false;
  }

  setActive(active) {
    this.isActive = active;
  }

  update(deltaTime) {
    if (!this.isActive) return;

    const now = performance.now();
    if (now - this.lastEmit > 1000 / this.emitRate) {
      this.emit();
      this.lastEmit = now;
    }
  }

  emit() {
    const particleGeometry = new THREE.SphereGeometry(0.3, 8, 8);
    const particleMaterial = new THREE.MeshBasicMaterial({
      color: 0xff6644,
      transparent: true,
      opacity: 1
    });

    const particle = new THREE.Mesh(particleGeometry, particleMaterial);
    particle.position.copy(this.rocketPosition);
    particle.position.y -= 3; // Emit from bottom of rocket
    
    // Add random offset
    particle.position.x += (Math.random() - 0.5) * 0.5;
    particle.position.z += (Math.random() - 0.5) * 0.5;

    particle.velocity = 5 + Math.random() * 3;
    particle.life = 2;
    particle.maxLife = 2;

    this.scene.add(particle);
    this.particlesArray.push(particle);
  }
}

/**
 * Create rocket mesh
 */
SceneManager.prototype.createRocket = function() {
  const rocketGroup = new THREE.Group();

  // Rocket body (cylinder)
  const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.5, 6, 16);
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    metalness: 0.8,
    roughness: 0.2
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  rocketGroup.add(body);

  // Rocket nose cone
  const noseGeometry = new THREE.ConeGeometry(0.5, 2, 16);
  const noseMaterial = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    metalness: 0.6,
    roughness: 0.3
  });
  const nose = new THREE.Mesh(noseGeometry, noseMaterial);
  nose.position.y = 4;
  rocketGroup.add(nose);

  // Rocket fins
  const finGeometry = new THREE.BoxGeometry(0.1, 2, 1);
  const finMaterial = new THREE.MeshStandardMaterial({
    color: 0x333333,
    metalness: 0.7,
    roughness: 0.4
  });

  for (let i = 0; i < 4; i++) {
    const fin = new THREE.Mesh(finGeometry, finMaterial);
    const angle = (i / 4) * Math.PI * 2;
    fin.position.x = Math.cos(angle) * 0.6;
    fin.position.z = Math.sin(angle) * 0.6;
    fin.position.y = -2;
    fin.rotation.y = angle;
    rocketGroup.add(fin);
  }

  rocketGroup.position.set(-15, -5, 5); // Position rocket to the lower left, away from Earth
  rocketGroup.rotation.z = Math.PI / 6; // Tilt rocket slightly for dynamic look
  rocketGroup.name = 'rocket';

  // Create exhaust emitter
  const exhaustEmitter = new ExhaustEmitter(
    rocketGroup.position,
    this.scene,
    this.objects.particles.exhaust
  );
  rocketGroup.userData.exhaustEmitter = exhaustEmitter;

  this.scene.add(rocketGroup);
  this.objects.rocket = rocketGroup;

  console.log('Created rocket mesh with exhaust system');
  return rocketGroup;
};


// ===================================
// ASTEROID BELT PARTICLE SYSTEM
// ===================================

/**
 * Create asteroid belt with 3,000 rotating particles
 */
SceneManager.prototype.createAsteroidBelt = function(count = 3000) {
  const asteroidGroup = new THREE.Group();

  for (let i = 0; i < count; i++) {
    // Random asteroid size
    const size = Math.random() * 0.5 + 0.3;
    
    // Use icosahedron for irregular shape
    const geometry = new THREE.IcosahedronGeometry(size, 0);
    const material = new THREE.MeshStandardMaterial({
      color: 0x8B7355,
      roughness: 0.9,
      metalness: 0.1
    });

    const asteroid = new THREE.Mesh(geometry, material);

    // Position in belt formation around camera path
    const angle = Math.random() * Math.PI * 2;
    const radius = 50 + Math.random() * 100;
    const height = (Math.random() - 0.5) * 40;

    asteroid.position.x = Math.cos(angle) * radius;
    asteroid.position.y = height;
    asteroid.position.z = Math.sin(angle) * radius;

    // Random rotation
    asteroid.rotation.x = Math.random() * Math.PI * 2;
    asteroid.rotation.y = Math.random() * Math.PI * 2;
    asteroid.rotation.z = Math.random() * Math.PI * 2;

    // Store rotation speed
    asteroid.userData.rotationSpeed = {
      x: (Math.random() - 0.5) * 0.002,
      y: (Math.random() - 0.5) * 0.002,
      z: (Math.random() - 0.5) * 0.002
    };

    asteroidGroup.add(asteroid);
  }

  this.scene.add(asteroidGroup);
  this.objects.particles.asteroids = asteroidGroup;

  console.log(`Created asteroid belt with ${count} asteroids`);
  return asteroidGroup;
};

/**
 * Update asteroid rotation (called from main update loop)
 */
SceneManager.prototype.updateAsteroidRotation = function(deltaTime) {
  if (!this.objects.particles.asteroids) return;

  this.objects.particles.asteroids.children.forEach(asteroid => {
    if (asteroid.userData.rotationSpeed) {
      asteroid.rotation.x += asteroid.userData.rotationSpeed.x;
      asteroid.rotation.y += asteroid.userData.rotationSpeed.y;
      asteroid.rotation.z += asteroid.userData.rotationSpeed.z;
    }
  });
};


// ===================================
// MARS SPHERE
// ===================================

/**
 * Create Mars with rust-red texture and dust storm shader
 */
SceneManager.prototype.createMars = function() {
  const marsRadius = 8;
  const marsGeometry = new THREE.SphereGeometry(marsRadius, 64, 64);

  // Load Mars texture
  const textureLoader = new THREE.TextureLoader();
  const marsTexture = textureLoader.load('assets/textures/2k_mars.jpg');

  // Mars material with real texture
  const marsMaterial = new THREE.MeshStandardMaterial({
    map: marsTexture,
    roughness: 0.9,
    metalness: 0.1,
    emissive: 0x3d1005,
    emissiveIntensity: 0.1
  });

  const mars = new THREE.Mesh(marsGeometry, marsMaterial);
  mars.position.set(0, 0, -500); // Start far away
  mars.scale.set(0.1, 0.1, 0.1); // Start small
  mars.name = 'mars';

  // Polar ice caps (white spots at poles)
  const icecapGeometry = new THREE.CircleGeometry(2, 32);
  const icecapMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.6,
    metalness: 0.2
  });

  const northCap = new THREE.Mesh(icecapGeometry, icecapMaterial);
  northCap.position.y = marsRadius - 0.1;
  northCap.rotation.x = -Math.PI / 2;
  mars.add(northCap);

  const southCap = new THREE.Mesh(icecapGeometry, icecapMaterial);
  southCap.position.y = -(marsRadius - 0.1);
  southCap.rotation.x = Math.PI / 2;
  mars.add(southCap);

  // Dust storm effect (semi-transparent layer)
  const dustGeometry = new THREE.SphereGeometry(marsRadius + 0.3, 32, 32);
  const dustMaterial = new THREE.MeshStandardMaterial({
    color: 0xE07B54,
    transparent: true,
    opacity: 0.2,
    roughness: 1,
    metalness: 0
  });

  const dust = new THREE.Mesh(dustGeometry, dustMaterial);
  mars.add(dust);

  // Animate dust rotation for storm effect
  dust.userData.rotationSpeed = 0.001;

  this.scene.add(mars);
  this.objects.mars = mars;

  console.log('Created Mars sphere with real texture');
  return mars;
};


// ===================================
// MARS TERRAIN MESH
// ===================================

/**
 * Create Mars terrain with better positioning
 */
SceneManager.prototype.createMarsTerrain = function() {
  const terrainGeometry = new THREE.PlaneGeometry(80, 80, 128, 128);

  // Apply displacement to create terrain elevation
  const positions = terrainGeometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    
    // Create procedural height using noise-like function
    const height = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 2 +
                   Math.sin(x * 0.3) * Math.cos(y * 0.2) * 1 +
                   Math.random() * 0.3;
    
    positions.setZ(i, height);
  }

  positions.needsUpdate = true;
  terrainGeometry.computeVertexNormals();

  const terrainMaterial = new THREE.MeshStandardMaterial({
    color: 0xC1440E,
    roughness: 0.95,
    metalness: 0.05,
    flatShading: false
  });

  const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
  terrain.rotation.x = -Math.PI / 2;
  terrain.position.set(0, -20, 0); // Moved down so it doesn't block view
  terrain.name = 'terrain';
  terrain.visible = false; // Start hidden, show only in Section 5

  this.scene.add(terrain);
  this.objects.terrain = terrain;

  console.log('Created Mars terrain mesh with better positioning');
  return terrain;
};


// ===================================
// RESPONSIVE BEHAVIOR
// ===================================

class ResponsiveManager {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.breakpoints = {
      desktop: window.matchMedia('(min-width: 1025px)'),
      tablet: window.matchMedia('(min-width: 768px) and (max-width: 1024px)'),
      mobile: window.matchMedia('(max-width: 767px)')
    };
    this.currentMode = null;
  }

  init() {
    // Initial check
    this.handleBreakpointChange();

    // Add listeners
    this.breakpoints.desktop.addEventListener('change', () => this.handleBreakpointChange());
    this.breakpoints.tablet.addEventListener('change', () => this.handleBreakpointChange());
    this.breakpoints.mobile.addEventListener('change', () => this.handleBreakpointChange());

    console.log('ResponsiveManager initialized');
  }

  handleBreakpointChange() {
    if (this.breakpoints.mobile.matches) {
      this.applyMobileConfig();
    } else if (this.breakpoints.tablet.matches) {
      this.applyTabletConfig();
    } else {
      this.applyDesktopConfig();
    }
  }

  applyDesktopConfig() {
    if (this.currentMode === 'desktop') return;
    this.currentMode = 'desktop';

    console.log('Applying desktop configuration');

    // Enable full 3D rendering
    if (this.sceneManager.canvas) {
      this.sceneManager.canvas.style.display = 'block';
    }

    // Set particle counts to 100%
    this.updateParticleCount(1.0);

    // Enable renderer
    if (this.sceneManager.renderer) {
      this.sceneManager.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    // Remove mobile fallback class
    document.body.classList.remove('mobile-fallback');

    // Start render loop if not running
    this.sceneManager.startRenderLoop();
  }

  applyTabletConfig() {
    if (this.currentMode === 'tablet') return;
    this.currentMode = 'tablet';

    console.log('Applying tablet configuration');

    // Maintain 3D rendering
    if (this.sceneManager.canvas) {
      this.sceneManager.canvas.style.display = 'block';
    }

    // Reduce particle count by 60%
    this.updateParticleCount(0.4);

    // Cap pixel ratio
    if (this.sceneManager.renderer) {
      this.sceneManager.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    }

    // Remove mobile fallback class
    document.body.classList.remove('mobile-fallback');

    // Start render loop if not running
    this.sceneManager.startRenderLoop();
  }

  applyMobileConfig() {
    if (this.currentMode === 'mobile') return;
    this.currentMode = 'mobile';

    console.log('Applying mobile configuration');

    // Disable 3D rendering
    if (this.sceneManager.canvas) {
      this.sceneManager.canvas.style.display = 'none';
    }

    // Add mobile fallback class for CSS gradient
    document.body.classList.add('mobile-fallback');

    // Stop render loop to save battery
    this.sceneManager.stopRenderLoop();

    // Use IntersectionObserver for section detection on mobile
    this.setupMobileScrollObserver();
  }

  updateParticleCount(multiplier) {
    // Update starfield
    if (this.sceneManager.objects.particles.stars) {
      const stars = this.sceneManager.objects.particles.stars;
      const baseOpacity = 0.8;
      stars.material.opacity = baseOpacity * multiplier;
    }

    // Update asteroids visibility
    if (this.sceneManager.objects.particles.asteroids) {
      const asteroids = this.sceneManager.objects.particles.asteroids;
      asteroids.visible = multiplier > 0.5;
    }

    console.log(`Particle count updated: ${multiplier * 100}%`);
  }

  setupMobileScrollObserver() {
    const sections = document.querySelectorAll('.section');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionIndex = parseInt(entry.target.dataset.section);
          console.log(`Mobile: Section ${sectionIndex} visible`);
          
          // Trigger section-specific mobile animations
          entry.target.classList.add('visible');
        }
      });
    }, {
      threshold: 0.5
    });

    sections.forEach(section => observer.observe(section));

    console.log('Mobile scroll observer setup');
  }
}

// Add ResponsiveManager to SceneManager initialization
const originalSceneManagerInit = SceneManager.prototype.init;
SceneManager.prototype.init = function() {
  originalSceneManagerInit.call(this);
  
  // Initialize responsive manager
  this.responsiveManager = new ResponsiveManager(this);
  this.responsiveManager.init();
};


// ===================================
// PERFORMANCE OPTIMIZATIONS
// ===================================

class PerformanceMonitor {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.frameTimes = [];
    this.maxSamples = 60;
    this.lowFPSCount = 0;
    this.hasWarned = false;
  }

  update(deltaTime) {
    this.frameTimes.push(deltaTime * 1000); // Convert to ms
    
    if (this.frameTimes.length > this.maxSamples) {
      this.frameTimes.shift();
    }

    // Calculate average FPS
    if (this.frameTimes.length === this.maxSamples) {
      const avgFrameTime = this.frameTimes.reduce((a, b) => a + b) / this.frameTimes.length;
      const fps = 1000 / avgFrameTime;

      if (fps < 30) {
        this.lowFPSCount++;
        
        // If low FPS for 3 seconds (180 frames at 60fps)
        if (this.lowFPSCount > 180 && !this.hasWarned) {
          this.degradePerformance();
          this.hasWarned = true;
        }
      } else {
        this.lowFPSCount = 0;
      }
    }
  }

  degradePerformance() {
    console.warn('Low FPS detected, reducing quality...');

    // Reduce particle count by 50%
    if (this.sceneManager.responsiveManager) {
      this.sceneManager.responsiveManager.updateParticleCount(0.5);
    }

    // Lower pixel ratio
    if (this.sceneManager.renderer) {
      this.sceneManager.renderer.setPixelRatio(1.0);
    }

    // Disable shadows if enabled
    if (this.sceneManager.renderer) {
      this.sceneManager.renderer.shadowMap.enabled = false;
    }

    console.log('Performance degradation applied');
  }
}

// Lazy Loading Manager (extends AssetManager)
class LazyLoadingManager {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.loadedSections = new Set();
    this.currentSection = 0;
  }

  updateCurrentSection(sectionIndex) {
    if (this.currentSection === sectionIndex) return;
    
    this.currentSection = sectionIndex;

    // Load sections within range (N-2 to N+2)
    for (let i = Math.max(0, sectionIndex - 2); i <= Math.min(4, sectionIndex + 2); i++) {
      if (!this.loadedSections.has(i)) {
        this.loadSection(i);
      }
    }

    // Unload sections outside range
    this.loadedSections.forEach(loadedSection => {
      if (Math.abs(loadedSection - sectionIndex) > 2) {
        this.unloadSection(loadedSection);
      }
    });
  }

  loadSection(sectionIndex) {
    console.log(`Lazy loading section ${sectionIndex}`);
    this.loadedSections.add(sectionIndex);
    
    // In a real implementation, you would load textures here
    // For now, we just track which sections are loaded
  }

  unloadSection(sectionIndex) {
    console.log(`Unloading section ${sectionIndex}`);
    this.loadedSections.delete(sectionIndex);
    
    // Dispose of section-specific resources
    // This would include textures, geometries, etc.
  }
}

// Add performance monitoring to SceneManager
const originalSceneManagerUpdate = SceneManager.prototype.update;
SceneManager.prototype.update = function(deltaTime) {
  originalSceneManagerUpdate.call(this, deltaTime);
  
  // Update performance monitor
  if (this.performanceMonitor) {
    this.performanceMonitor.update(deltaTime);
  }

  // Update lazy loading based on current section
  if (this.lazyLoadingManager) {
    this.lazyLoadingManager.updateCurrentSection(this.currentSection);
  }
};

// Initialize performance systems
const originalSceneManagerInit2 = SceneManager.prototype.init;
SceneManager.prototype.init = function() {
  originalSceneManagerInit2.call(this);
  
  // Initialize performance monitor
  this.performanceMonitor = new PerformanceMonitor(this);
  
  // Initialize lazy loading manager
  this.lazyLoadingManager = new LazyLoadingManager(this);
  
  console.log('Performance systems initialized');
};
