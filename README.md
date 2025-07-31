# 🐢 Crosschain Turtle

A modern web-based Frogger-style arcade game built with vanilla JavaScript and HTML5 Canvas. Navigate your turtle through dangerous roads and rivers while avoiding NPC turtles blocking your path to reach safe nests!

## 🎮 Play the Game

**[Play Crosschain Turtle](https://web3twon.github.io/Crosschain-Turtle/)**

## 🎯 Game Features

- **Dynamic NPC Turtles**: Dark green turtles occupy lily pads, creating strategic challenges
- **Responsive Design**: Works on desktop and mobile devices with touch/swipe controls
- **Progressive Difficulty**: 4+ levels with increasing speed and complexity
- **Rich Audio**: Background music, sound effects, and dynamic audio based on player position
- **Advanced Graphics**: Sprite-based rendering with direction-aware animations
- **Cross-Platform**: Runs in any modern web browser

## 🕹️ How to Play

### Controls
- **Desktop**: Arrow keys or WASD for movement
- **Mobile**: Swipe gestures (up/down/left/right)

### Objective
Navigate your turtle across roads and rivers to reach all 5 nests at the top. Avoid vehicles on roads and water without platforms. Some lily pads are occupied by NPC turtles - you cannot land on those!

### Strategy Tips
- Plan your route around occupied lily pads
- Time your movements with platform motion
- Watch for 3-lily groups where both side pads might be occupied
- Use the middle pad when sides are blocked

## 🛠️ Technical Features

- **Custom Game Engine**: Fixed timestep physics with 60fps performance
- **Anti-Throttling**: Maintains consistent speeds regardless of browser optimizations
- **Smart Collision Detection**: Precise hit-box collision for vehicles and platforms
- **Advanced Platform Physics**: Lily pad grouping and log riding mechanics
- **Dynamic Canvas Scaling**: Crisp rendering at all screen sizes and DPI levels

## 🎨 Game Mechanics

- **Lives System**: 3 lives with respawning and timer-based gameplay
- **Scoring**: Points for forward progress, reaching nests, and time bonuses
- **NPC Turtle AI**: Strategic placement creates varied difficulty patterns
- **Platform Movement**: Lily pads and logs move at different speeds and directions

## 🚀 Development

Built with:
- Vanilla JavaScript (ES6+)
- HTML5 Canvas API
- Web Audio API
- CSS3 for responsive layout

No build process required - pure web technologies!

## 📱 Browser Support

Works on all modern browsers including:
- Chrome/Chromium
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

---

*Based on the classic Frogger arcade game with modern web enhancements and strategic NPC turtle mechanics.*