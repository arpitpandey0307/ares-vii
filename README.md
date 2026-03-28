# Frontend Odyssey: Journey to Mars

An immersive, cinematic WebGL storytelling experience that takes users on a visual journey from Earth to Mars through scroll-driven 3D animations.

## 🚀 Features

- **5-Section Narrative Journey**: Hero, Launch, Deep Space, Mars Orbit, Landing
- **Three.js 3D Rendering**: 15,000 star particles, Earth & Mars spheres, rocket, asteroids, terrain
- **GSAP Scroll Animations**: Camera path scrubbing, parallax effects, section pinning
- **Interactive Elements**: Custom cursor, planet modals, audio toggle, card hover effects
- **Fully Responsive**: Desktop, tablet, and mobile with graceful degradation
- **Accessibility**: Reduced motion support, keyboard navigation, ARIA labels
- **Performance Optimized**: Lazy loading, resource disposal, FPS monitoring

## 📁 Project Structure

```
/
├── index.html          # Main HTML structure
├── style.css           # Design system and styles
├── loader.js           # Asset preloader
├── main.js             # Three.js scene management
├── scroll.js           # GSAP scroll animations
├── interactions.js     # User interactions
└── assets/
    ├── textures/       # Planet textures (add your own)
    ├── audio/          # Ambient space audio (add your own)
    └── fonts/          # Custom fonts (optional)
```

## 🎨 Tech Stack

- **HTML5** - Semantic structure
- **CSS3** - Custom properties, animations, responsive design
- **Vanilla JavaScript** - No frameworks, pure ES6+
- **Three.js** - WebGL 3D rendering
- **GSAP** - Animation library with ScrollTrigger

## 🛠️ Setup

1. **Clone or download** this project

2. **Add assets** (optional but recommended):
   - Place planet textures in `assets/textures/`
   - Place ambient audio in `assets/audio/ambient_space.mp3`
   - Free resources:
     - Textures: https://www.solarsystemscope.com/textures/
     - Audio: https://freesound.org/

3. **Serve the project**:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve
   
   # Or use any local server
   ```

4. **Open in browser**:
   ```
   http://localhost:8000
   ```

## 🎮 Controls

- **Scroll** - Navigate through the journey
- **Click planets** - View planetary data
- **Hover cards** - See 3D tilt effects
- **Click mission logs** - Flip cards to read entries
- **Sound toggle** - Enable/disable ambient audio
- **Share button** - Share your journey

## 📱 Responsive Breakpoints

- **Desktop** (>1024px): Full 3D experience
- **Tablet** (768-1024px): Reduced particles, maintained 3D
- **Mobile** (<768px): CSS gradient fallback, preserved interactions

## ♿ Accessibility

- **Reduced Motion**: Respects `prefers-reduced-motion` preference
- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Screen Readers**: Semantic HTML and ARIA labels
- **Focus Management**: Visible focus states and modal focus trapping

## 🎯 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Safari 14+

## 📝 Customization

### Colors
Edit CSS custom properties in `style.css`:
```css
:root {
  --space-black: #03040A;
  --neon-accent: #4DFFB4;
  /* ... */
}
```

### Camera Path
Edit camera positions in `main.js`:
```javascript
const points = [
  new THREE.Vector3(0, 0, 50),    // Section 1
  new THREE.Vector3(20, 30, 40),  // Section 2
  // ...
];
```

### Content
Edit section content directly in `index.html`

## 🐛 Troubleshooting

**3D scene not rendering:**
- Check browser console for errors
- Ensure Three.js CDN is loading
- Try a different browser

**Scroll animations not working:**
- Ensure GSAP and ScrollTrigger CDNs are loading
- Check that JavaScript is enabled

**Performance issues:**
- The app automatically degrades quality on low FPS
- Try disabling browser extensions
- Use a more powerful device

## 📄 License

This project is open source and available for educational purposes.

## 🙏 Credits

- Three.js - https://threejs.org/
- GSAP - https://greensock.com/gsap/
- Google Fonts - Orbitron & Inter

---

**Built with ❤️ for the Frontend Odyssey Hackathon**
