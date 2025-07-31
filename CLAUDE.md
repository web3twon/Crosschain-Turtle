# TurtleClubGame

## Project Overview

**Crosschain Turtle** is a modern web-based Frogger-style arcade game built with vanilla JavaScript and HTML5 Canvas. Players control a turtle navigating through dangerous roads and rivers to reach safe nests.

### Game Features
- **Responsive Design**: Works on desktop and mobile devices with touch/swipe controls
- **Progressive Difficulty**: 4+ levels with increasing speed and complexity
- **Rich Audio**: Background music, sound effects, and dynamic audio based on player position
- **Advanced Graphics**: Sprite-based rendering with direction-aware animations
- **Cross-Platform**: Runs in any modern web browser

### Technical Architecture
- **Engine**: Custom JavaScript game engine with fixed timestep physics
- **Rendering**: HTML5 Canvas with sprite-based graphics and responsive scaling
- **Audio**: Web Audio API with crossfading background music and positional audio
- **Input**: Keyboard (WASD/Arrow keys) and touch/swipe gesture support
- **Performance**: Anti-throttling mechanisms to maintain 60fps on all devices

### Core Game Mechanics
- **Movement**: Grid-based movement with 8-directional sprite rotation
- **Collision Detection**: Precise hit-box collision for vehicles and platforms
- **Platform Physics**: Advanced lily pad grouping and log riding mechanics
- **Lives System**: 3 lives with respawning and timer-based gameplay
- **Scoring**: Points for forward progress, reaching nests, and time bonuses

---

# Development Notes

## Browser Throttling Fix (July 2025)

### Issue Identified
Game objects (vehicles, lily pads, logs) were slowing down after ~3 seconds of player inactivity, then returning to normal speed when player moved again. This occurred on both desktop and mobile browsers.

### Root Cause Analysis
Three specialized agents analyzed the codebase and identified the issue:

1. **Browser RequestAnimationFrame Throttling**: Modern browsers throttle `requestAnimationFrame` from 60fps to ~4fps after detecting user inactivity (~3 seconds)
2. **Missing Delta Time Scaling**: Game objects moved per-frame instead of per-time-unit, so slower frame rates caused apparent slowdown
3. **Incomplete Anti-Throttling**: Anti-throttling mechanisms only worked for touch input, not keyboard input

### Technical Details
- Chrome's intensive timer throttling (Chrome 88+) kicks in after inactivity detection
- `updateVehicles()` and `updatePlatforms()` used raw speed values without time scaling
- `preventThrottling()` function only activated during touch events

### Solution Implemented
1. **Added Delta Time Scaling**:
   - Modified `updateVehicles(deltaSeconds)` and `updatePlatforms(deltaSeconds)` to scale movement by elapsed time
   - Updated `updateFixed()` to pass delta time in seconds to movement functions

2. **Extended Anti-Throttling**:
   - Added `startActivityTimer()` for keyboard input events
   - Implemented `startContinuousActivityTimer()` that runs every 2 seconds during gameplay
   - Ensures browser never detects "inactivity" during active gameplay

3. **Proper Resource Management**:
   - All anti-throttling timers properly cleaned up when game ends
   - No memory leaks or unnecessary background processes

### Files Modified
- `game.js`: Lines 130-220 (event listeners), 272-320 (timer management), 1196-1220 (movement functions), 1804-1812 (game loop), 895-940 (game start/end)

### Result
- ✅ Consistent object speeds regardless of player activity
- ✅ Works on all desktop and mobile browsers  
- ✅ No performance degradation
- ✅ Proper resource cleanup

### Key Learnings
- Modern browsers aggressively throttle animations during perceived inactivity
- Always implement time-based movement scaling for consistent game physics
- Anti-throttling mechanisms must cover all input types (touch + keyboard)
- Continuous activity signaling prevents browser optimizations from affecting gameplay

---

## Vehicle Flickering Fix (July 2025)

### Issue Identified
Vehicles (especially in bottom rows) were flickering when the browser window was resized to different sizes. Flickering became more pronounced at non-standard screen sizes and affected multiple vehicle rows when window was very small or large.

### Root Cause Analysis
The issue was caused by **CSS-based canvas scaling combined with pixelated image rendering**:

1. **CSS Scaling Approach**: Canvas had fixed internal resolution (800x600) but was scaled via CSS `width: 100%; height: 100%`
2. **Pixelated Rendering**: CSS properties `image-rendering: pixelated` and `image-rendering: crisp-edges` 
3. **Non-Integer Scaling**: When browser window created non-integer scale ratios (e.g., 1.33x), pixelated rendering caused visual artifacts
4. **Accumulating Errors**: Rounding errors accumulated more noticeably at screen edges (bottom rows)

### Technical Details
- CSS scaling with `image-rendering: pixelated` works well for exact integer ratios (2x, 3x) but fails at fractional ratios
- Browser engines struggle to render crisp pixels when scaling involves subpixel positioning
- Bottom vehicles flickered more because they're closer to canvas edges where rounding errors accumulate

### Solution Implemented
**Switched from CSS scaling to dynamic canvas resolution**:

1. **Dynamic Canvas Resolution**: 
   - Canvas internal size now matches actual display size (`canvas.width = displayWidth * devicePixelRatio`)
   - Eliminates CSS scaling entirely - canvas renders at native resolution

2. **Device Pixel Ratio Support**:
   - Accounts for high-DPI displays (Retina, 4K) for crisp rendering
   - `ctx.scale(devicePixelRatio, devicePixelRatio)` ensures proper pixel density

3. **Context Coordinate Scaling**:
   - `ctx.scale(scaleX, scaleY)` transforms game coordinates to display coordinates
   - All game logic remains in 800x600 coordinate system

4. **Removed Problematic CSS**:
   - Removed `image-rendering: pixelated` and `image-rendering: crisp-edges`
   - Canvas now uses browser's default smooth scaling

### Files Modified
- `game.js`: Lines 91-126 (updateCanvasScale method), 1439-1450 (render method)
- `index.html`: Lines 105-113 (removed image-rendering CSS properties)

### Result
- ✅ No more vehicle flickering at any screen size
- ✅ Crisp rendering on high-DPI displays  
- ✅ Smooth scaling at all aspect ratios
- ✅ Better performance (no CSS transform overhead)

### Key Learnings
- CSS scaling with `image-rendering: pixelated` only works well at integer ratios
- Dynamic canvas resolution provides better quality and compatibility
- Always account for `devicePixelRatio` for proper high-DPI support
- Context scaling is more reliable than CSS scaling for pixel-perfect games

---

## Development Guidelines

### Performance
- Always use delta time scaling for movement calculations
- Implement anti-throttling for all input methods
- Monitor browser throttling policies as they evolve

### Testing
- Test game behavior after 3+ seconds of inactivity
- Verify consistent speeds on mobile and desktop
- Check for proper timer cleanup on game end

---

## Project Structure

### Core Files
```
TurtleClubGame/
├── index.html              # Main HTML file with game UI and styles
├── game.js                 # Complete game engine and logic (~1850 lines)
├── assets/
│   ├── images/            # Game sprites and graphics
│   │   ├── turtle.png     # Player sprite (animated)
│   │   ├── car.png        # Vehicle sprites
│   │   ├── bus.png
│   │   ├── truck.png
│   │   ├── log.png        # Platform sprites
│   │   ├── lilypad.png
│   │   ├── water1.png     # Background textures
│   │   ├── road2.png
│   │   ├── grass.png
│   │   └── nest.png       # Goal sprites
│   └── sounds/            # Audio assets
│       ├── background.mp3 # Background music
│       ├── traffic.mp3    # Ambient road sounds
│       ├── river.mp3      # Ambient water sounds
│       ├── horn1.mp3      # Vehicle collision sound
│       ├── splash.mp3     # Water death sound
│       ├── nest.mp3       # Goal reached sound
│       └── levelfinish.mp3# Level completion sound
└── CLAUDE.md              # This documentation file
```

### Key Classes and Components

#### TurtleGame Class (game.js)
- **Constructor**: Initialize game canvas, audio, sprites, and state
- **Game Loop**: `gameLoop()` - Main update/render cycle with fixed timestep
- **Input Handling**: Keyboard and touch/swipe gesture detection
- **Physics**: Vehicle movement, platform physics, collision detection
- **Audio System**: Dynamic background music and positional sound effects
- **Rendering**: Sprite-based graphics with responsive canvas scaling

#### Game State Management
- **Player State**: Position, direction, platform riding, lives, score
- **World State**: Vehicles, platforms, homes, level progression
- **Audio State**: Background music crossfading, dynamic volume control
- **Input State**: Keyboard mapping, touch gesture recognition

---

## Setup and Development

### Requirements
- Modern web browser with HTML5 Canvas and Web Audio API support
- Local web server (for audio file loading - browser security restrictions)

### Running the Game
1. Clone/download the project files
2. Start a local web server (e.g., `python -m http.server` or `live-server`)
3. Open `index.html` in a web browser
4. Click "Start Game" to begin playing

### Controls
- **Desktop**: Arrow keys or WASD for movement
- **Mobile**: Swipe gestures (up/down/left/right)
- **Goal**: Navigate the turtle across roads and rivers to reach all 5 nests

### Development Commands
No build process required - pure vanilla JavaScript and HTML5.