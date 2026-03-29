# 🚀 ARES VII - Journey to Mars

An immersive WebGL storytelling experience that takes you on a cinematic journey from Earth to Mars. Built for the Frontend Odyssey hackathon.

## 🌐 Live Demo

**[View Live Demo →](https://ares-vii.vercel.app/)**

## ✨ Features

- **Immersive 3D Experience**: Real-time WebGL rendering with Three.js
- **Scroll-Driven Narrative**: 5 interactive sections telling the story of humanity's journey to Mars
- **Cinematic Animations**: Smooth GSAP-powered animations synchronized with scroll
- **Realistic Visuals**: High-quality 2K textures for Earth and Mars
- **Interactive Elements**: Custom cursor, planet modals, mission logs, and more
- **Audio Experience**: Synchronized countdown audio during loading
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Accessibility**: Full keyboard navigation and screen reader support

## 🎬 Journey Sections

1. **Hero - Earth**: Mission briefing and launch preparation
2. **Launch Sequence**: Escape velocity and departure from Earth
3. **Deep Space**: Interstellar travel and mission logs
4. **Mars Orbit**: Approaching the Red Planet
5. **Landing**: Touchdown on Mars and mission completion

## 🛠️ Technologies Used

- **Three.js** - 3D rendering and WebGL
- **GSAP** - Professional animations and ScrollTrigger
- **Vanilla JavaScript** - No framework dependencies
- **CSS3** - Modern styling with custom properties
- **HTML5** - Semantic markup

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge, Safari)
- A local web server (Python, Node.js, or VS Code Live Server)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/arpitpandey0307/ares-vii.git
cd ares-vii
```

2. Start a local server:

**Using Python:**
```bash
python -m http.server 8000
```

**Using Node.js:**
```bash
npx http-server -p 8000
```

**Using VS Code:**
- Right-click `index.html`
- Select "Open with Live Server"

3. Open your browser and navigate to:
```
http://localhost:8000
```

## 📁 Project Structure

```
ares-vii/
├── index.html              # Main HTML file
├── style.css               # Styles and animations
├── main.js                 # Three.js scene setup
├── loader.js               # Preloader and countdown
├── scroll.js               # Scroll animations
├── interactions.js         # User interactions
├── assets/
│   ├── textures/          # Earth and Mars textures
│   │   ├── 2k_earth_daymap.jpg
│   │   ├── 2k_earth_clouds.jpg
│   │   ├── 2k_mars.jpg
│   │   └── 2k_earth_normal_map.tif
│   └── audio/             # Sound effects
│       ├── countdown.mp3
│       └── space-sound.mp3
└── README.md
```

## 🎨 Key Features Breakdown

### 3D Scene
- Realistic Earth with cloud layer and normal mapping
- Detailed Mars with authentic surface textures
- Dynamic starfield with 2000+ particles
- Animated rocket with exhaust particles
- Asteroid belt and space debris

### Animations
- Smooth camera path through 5 sections
- Scroll-driven 3D transformations
- Parallax effects on UI elements
- Particle systems for exhaust and stars
- Dramatic countdown with glow effects

### UI/UX
- Custom animated cursor
- Interactive stat cards with 3D rotation
- Flip cards for mission logs
- Progress indicators and HUD elements
- Mission clock with live timer
- Audio toggle controls

## 🎯 Performance

- Optimized for 60fps on modern hardware
- Efficient particle systems
- Lazy loading for section assets
- Hardware-accelerated CSS animations
- Mobile fallback with gradient background

## 🌟 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Edge 90+
- ✅ Safari 14+
- ❌ Internet Explorer (not supported)

## 📱 Mobile Support

The experience is fully responsive with:
- Touch-friendly controls
- Optimized performance for mobile GPUs
- Fallback gradient background for low-end devices
- Adapted UI for smaller screens

## 🎵 Audio

The experience includes:
- Countdown audio during loading (10 seconds)
- Ambient space sound (toggleable)
- Audio attempts autoplay but respects browser policies
- Falls back to user interaction if autoplay is blocked

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

**Arpit Pandey**
- GitHub: [@arpitpandey0307](https://github.com/arpitpandey0307)

## 🙏 Acknowledgments

- Textures from NASA and public domain sources
- Three.js community for excellent documentation
- GSAP for powerful animation tools
- Frontend Odyssey hackathon for the inspiration

## 🚀 Deployment

This project is deployed on Vercel:
- **Live URL**: [https://ares-vii.vercel.app/](https://ares-vii.vercel.app/)
- **Automatic deployments** from main branch
- **Optimized** for production with CDN

---

**Built with ❤️ for the Frontend Odyssey Hackathon**

*Experience the journey. Explore the cosmos. Reach for Mars.* 🌌
