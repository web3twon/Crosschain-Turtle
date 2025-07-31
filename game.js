class TurtleGame {
    constructor() {
        console.log('TurtleGame constructor starting...');
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            console.error('Canvas element not found!');
            throw new Error('Canvas element gameCanvas not found');
        }
        console.log('Canvas found:', this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            console.error('Could not get 2D context!');
            throw new Error('Could not get 2D rendering context');
        }
        console.log('2D context obtained');
        
        this.GAME_WIDTH = 800;
        this.GAME_HEIGHT = 600;
        this.TILE_SIZE = 50;
        this.GRID_WIDTH = this.GAME_WIDTH / this.TILE_SIZE;
        this.GRID_HEIGHT = this.GAME_HEIGHT / this.TILE_SIZE;
        
        // Scaling properties for responsive canvas
        this.scaleX = 1;
        this.scaleY = 1;
        this.displayWidth = this.GAME_WIDTH;
        this.displayHeight = this.GAME_HEIGHT;
        
        this.sprites = {};
        this.spritesLoaded = false;
        this.loadingProgress = 0;
        
        this.sounds = {};
        this.soundsLoaded = false;
        this.backgroundSounds = {
            traffic: null,
            river: null
        };
        this.backgroundMusic = {
            primary: null,
            secondary: null,
            currentTrack: 'primary',
            isLooping: false
        };
        this.audioFadeInterval = null;
        this.targetVolumes = {
            traffic: 0.324,  // Reduced by another 10% from 0.36
            river: 0.18225,  // Reduced by another 10% from 0.2025
            backgroundMusic: 0.3  // Keep background music at same level
        };
        
        this.gameStarted = false;
        this.gameRunning = false;
        this.lastTime = 0;
        this.deltaTime = 0;
        this.animationFrameId = null;
        
        this.player = {
            x: 7,
            y: 11,
            direction: 'up',
            ridingPlatform: null,
            lilyPadIndex: 0
        };
        
        this.vehicles = [];
        this.platforms = [];
        this.npcTurtles = []; // Array to track NPC turtles on lily pads
        this.homes = [false, false, false, false, false];
        
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.timer = 90;
        this.timerInterval = null;
        
        this.message = '';
        this.messageTimeout = null;
        
        this.deathFlash = false;
        this.deathFlashTimeout = null;
        
        this.keys = {};
        this.lastMoveTime = 0;
        this.moveDelay = 80; // Reduced from 150ms to 80ms for better responsiveness
        
        // DeFi Theme System
        this.enableDeFiTheme = false; // Feature toggle for DeFi theming
        this.scrollingTextOffset = 0; // For animating road lane text
        
        // Touch control properties
        this.touchStartX = null;
        this.touchStartY = null;
        this.touchEndX = null;
        this.touchEndY = null;
        this.minSwipeDistance = 30;
        this.isTouching = false;
        
        console.log('Starting INSTANT game initialization...');
        this.initializeGame();
        this.updateCanvasScale();
        console.log('TurtleGame constructor completed INSTANTLY - ready to play!');
    }

    updateCanvasScale() {
        // Get the actual display size of the canvas
        const rect = this.canvas.getBoundingClientRect();
        const newDisplayWidth = rect.width;
        const newDisplayHeight = rect.height;
        
        // Only update if size actually changed to avoid unnecessary operations
        if (Math.abs(newDisplayWidth - this.displayWidth) < 1 && 
            Math.abs(newDisplayHeight - this.displayHeight) < 1) {
            return; // No significant change, skip update
        }
        
        this.displayWidth = newDisplayWidth;
        this.displayHeight = newDisplayHeight;
        
        // Calculate scale factors based on device pixel ratio for crisp rendering
        const dpr = window.devicePixelRatio || 1;
        const scaledWidth = Math.round(newDisplayWidth * dpr);
        const scaledHeight = Math.round(newDisplayHeight * dpr);
        
        // Set canvas internal resolution to match display size
        this.canvas.width = scaledWidth;
        this.canvas.height = scaledHeight;
        
        // Scale context to match device pixel ratio
        this.ctx.scale(dpr, dpr);
        
        // Calculate scale factors for game coordinates
        this.scaleX = newDisplayWidth / this.GAME_WIDTH;
        this.scaleY = newDisplayHeight / this.GAME_HEIGHT;
        
        // Scale context to game coordinates
        this.ctx.scale(this.scaleX, this.scaleY);
        
        console.log(`Canvas scaled: ${this.scaleX.toFixed(2)}x, ${this.scaleY.toFixed(2)}y, DPR: ${dpr}`);
    }

    async initializeGame() {
        console.log('initializeGame() called - INSTANT STARTUP MODE');
        
        // INSTANT STARTUP: Don't wait for anything!
        this.setupEventListeners();
        this.spritesLoaded = true;  // Lie to the system - game is ready
        this.soundsLoaded = true;   // Everything will load in background
        
        console.log('Game initialized INSTANTLY - ready to play!');
        
        // Show ready message immediately
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.GAME_WIDTH, this.GAME_HEIGHT);
        this.ctx.fillStyle = '#4ade80';
        this.ctx.font = '24px Inter';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Ready to Play!', this.GAME_WIDTH / 2, this.GAME_HEIGHT / 2);
        
        // Start loading everything in background (non-blocking)
        this.loadAllResourcesInBackground();
        
        this.render();
    }
    
    // Load all resources in background - completely non-blocking
    loadAllResourcesInBackground() {
        console.log('Starting background resource loading...');
        
        // Load sprites quietly in background
        setTimeout(() => {
            this.loadSpritesQuietly();
        }, 100); // Small delay to let UI render first
        
        // Load sounds quietly in background  
        setTimeout(() => {
            this.loadSoundsQuietly();
        }, 500); // Slightly later to prioritize sprites
    }
    
    // Load sprites silently without blocking UI
    async loadSpritesQuietly() {
        console.log('Loading sprites silently in background...');
        const spriteList = [
            'turtle', 'car', 'carleft', 'carright', 'bus', 'busleft', 'busright', 
            'truck', 'truckleft', 'truckright', 'log', 'lilypad', 
            'water1', 'road2', 'grass', 'nest'
        ];
        
        spriteList.forEach((spriteName) => {
            const img = new Image();
            img.onload = () => {
                this.sprites[spriteName] = img;
                console.log(`Background loaded: ${spriteName}`);
            };
            img.onerror = () => {
                console.log(`Background failed: ${spriteName} (ignored)`);
            };
            img.src = `assets/images/${spriteName}.png`;
        });
    }
    
    // Load sounds silently without blocking UI
    async loadSoundsQuietly() {
        console.log('Loading sounds silently in background...');
        const allSounds = ['horn1', 'splash', 'nest', 'levelfinish', 'traffic', 'river', 'background'];
        
        allSounds.forEach((soundName) => {
            const audio = new Audio();
            audio.preload = 'none'; // Don't preload, load when needed
            audio.oncanplaythrough = () => {
                this.sounds[soundName] = audio;
                console.log(`Background loaded: ${soundName}`);
                this.setupBackgroundAudio(soundName);
                this.setSoundVolume(soundName);
            };
            audio.onerror = () => {
                console.log(`Background failed: ${soundName} (ignored)`);
            };
            audio.src = `assets/sounds/${soundName}.mp3`;
        });
    }
    
    // Set sound volumes when they load
    setSoundVolume(soundName) {
        if (this.sounds[soundName]) {
            switch(soundName) {
                case 'horn1': this.sounds[soundName].volume = 0.486; break;
                case 'splash': this.sounds[soundName].volume = 0.405; break;
                case 'nest': this.sounds[soundName].volume = 0.405; break;
                case 'levelfinish': this.sounds[soundName].volume = 0.567; break;
            }
        }
    }
    
    // Load large background sounds asynchronously after game starts
    loadBackgroundSoundsAsync(backgroundSounds) {
        console.log('Loading background sounds asynchronously...');
        
        backgroundSounds.forEach((soundName) => {
            console.log(`Loading background sound: ${soundName}`);
            const audio = new Audio();
            
            // No timeout for background sounds, let them load when they can
            audio.preload = 'none'; // Don't preload, load on demand
            audio.oncanplaythrough = () => {
                this.sounds[soundName] = audio;
                console.log(`Background sound loaded: ${soundName}`);
                this.setupBackgroundAudio(soundName);
            };
            audio.onerror = (error) => {
                console.error(`Failed to load background sound: ${soundName}`, error);
            };
            
            const audioPath = `assets/sounds/${soundName}.mp3`;
            audio.src = audioPath;
        });
    }
    
    // Set up background audio when it becomes available
    setupBackgroundAudio(soundName) {
        if (soundName === 'traffic' && this.sounds.traffic) {
            this.backgroundSounds.traffic = this.sounds.traffic;
            this.backgroundSounds.traffic.loop = true;
            this.backgroundSounds.traffic.volume = 0.324;
        }
        
        if (soundName === 'river' && this.sounds.river) {
            this.backgroundSounds.river = this.sounds.river;
            this.backgroundSounds.river.loop = true;
            this.backgroundSounds.river.volume = 0;
        }
        
        if (soundName === 'background' && this.sounds.background) {
            this.backgroundMusic.primary = this.sounds.background.cloneNode();
            this.backgroundMusic.secondary = this.sounds.background.cloneNode();
            this.backgroundMusic.primary.volume = 0;
            this.backgroundMusic.secondary.volume = 0;
            this.backgroundMusic.primary.loop = false;
            this.backgroundMusic.secondary.loop = false;
            console.log('Background music ready for playback');
        }
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            // Try to start background music on first user interaction
            this.tryStartBackgroundMusic();
            
            // Start activity timer to prevent browser throttling during keyboard input
            this.startActivityTimer();
            
            // Prevent arrow keys from scrolling the page
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
            }
            
            this.keys[e.key] = true;
            this.handlePlayerMovement(e.key);
        });
        
        document.addEventListener('keyup', (e) => {
            // Prevent arrow keys from scrolling the page
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
            }
            
            this.keys[e.key] = false;
        });

        // Handle window resize for responsive canvas
        window.addEventListener('resize', () => {
            this.updateCanvasScale();
        });

        // Handle orientation change on mobile
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.updateCanvasScale();
            }, 100);
        });

        // Touch event listeners for swipe detection - listen on document for full screen swipes
        document.addEventListener('touchstart', (e) => {
            // Try to start background music on first user interaction
            this.tryStartBackgroundMusic();
            
            this.isTouching = true;
            
            // Start activity timer to prevent browser throttling during static touch
            this.startActivityTimer();
            
            // Only handle swipes during gameplay
            if (!this.gameRunning) return;
            
            e.preventDefault();
            const touch = e.touches[0];
            this.touchStartX = touch.clientX;
            this.touchStartY = touch.clientY;
        }, { passive: false });

        document.addEventListener('touchmove', (e) => {
            // Force browser to stay active during touch
            if (this.gameRunning) {
                e.preventDefault();
                // Trigger a tiny dummy canvas operation to prevent throttling
                this.preventThrottling();
            }
        }, { passive: false });

        // Add a periodic activity signal during static touches and gameplay
        this.activityTimer = null;
        this.continuousActivityTimer = null;

        document.addEventListener('touchend', (e) => {
            this.isTouching = false;
            this.stopActivityTimer();
            
            // Only handle swipes during gameplay
            if (!this.gameRunning) return;
            
            e.preventDefault();
            if (this.touchStartX === null || this.touchStartY === null) {
                return;
            }

            const touch = e.changedTouches[0];
            this.touchEndX = touch.clientX;
            this.touchEndY = touch.clientY;

            this.handleSwipe();
        }, { passive: false });

        document.addEventListener('touchcancel', () => {
            this.isTouching = false;
            this.stopActivityTimer();
            this.resetTouchVariables();
        }, { passive: false });

        // iOS-compatible button event handlers
        this.setupButtonEventHandlers();
    }

    setupButtonEventHandlers() {
        const startGameBtn = document.getElementById('startGameBtn');
        const playAgainBtn = document.getElementById('playAgainBtn');

        // Prevent rapid double-taps
        let buttonClickInProgress = false;

        // Function to handle start game with proper iOS compatibility
        const handleStartGame = (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Prevent rapid double-taps
            if (buttonClickInProgress) return;
            buttonClickInProgress = true;
            
            // Try to start background music on button interaction
            this.tryStartBackgroundMusic();
            
            if (this.spritesLoaded) {
                this.startGame();
            } else {
                console.log('Game not ready yet');
            }
            
            // Reset button click flag after short delay
            setTimeout(() => {
                buttonClickInProgress = false;
            }, 300);
        };

        // Add multiple event types for maximum iOS compatibility
        if (startGameBtn) {
            // Standard click event
            startGameBtn.addEventListener('click', handleStartGame, { passive: false });
            
            // Touch events for iOS
            startGameBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                // Add visual feedback
                startGameBtn.style.transform = 'scale(0.98)';
                startGameBtn.style.opacity = '0.8';
            }, { passive: false });
            
            startGameBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Remove visual feedback
                startGameBtn.style.transform = '';
                startGameBtn.style.opacity = '';
                
                // Handle the start game action
                handleStartGame(e);
            }, { passive: false });
            
            startGameBtn.addEventListener('touchcancel', (e) => {
                // Remove visual feedback if touch is cancelled
                startGameBtn.style.transform = '';
                startGameBtn.style.opacity = '';
            }, { passive: false });
        }

        if (playAgainBtn) {
            // Standard click event
            playAgainBtn.addEventListener('click', handleStartGame, { passive: false });
            
            // Touch events for iOS
            playAgainBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                // Add visual feedback
                playAgainBtn.style.transform = 'scale(0.98)';
                playAgainBtn.style.opacity = '0.8';
            }, { passive: false });
            
            playAgainBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Remove visual feedback
                playAgainBtn.style.transform = '';
                playAgainBtn.style.opacity = '';
                
                // Handle the start game action
                handleStartGame(e);
            }, { passive: false });
            
            playAgainBtn.addEventListener('touchcancel', (e) => {
                // Remove visual feedback if touch is cancelled
                playAgainBtn.style.transform = '';
                playAgainBtn.style.opacity = '';
            }, { passive: false });
        }
    }

    handleSwipe() {
        if (this.touchStartX === null || this.touchStartY === null || 
            this.touchEndX === null || this.touchEndY === null) {
            return;
        }

        const deltaX = this.touchEndX - this.touchStartX;
        const deltaY = this.touchEndY - this.touchStartY;
        
        // Calculate absolute distances
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);
        
        // Check if swipe distance meets minimum threshold
        if (Math.max(absDeltaX, absDeltaY) < this.minSwipeDistance) {
            this.resetTouchVariables();
            return;
        }

        // Determine swipe direction based on which axis has greater movement
        let swipeDirection = '';
        
        if (absDeltaX > absDeltaY) {
            // Horizontal swipe
            if (deltaX > 0) {
                swipeDirection = 'ArrowRight';
            } else {
                swipeDirection = 'ArrowLeft';
            }
        } else {
            // Vertical swipe
            if (deltaY > 0) {
                swipeDirection = 'ArrowDown';
            } else {
                swipeDirection = 'ArrowUp';
            }
        }

        // Trigger player movement
        this.handlePlayerMovement(swipeDirection);
        
        this.resetTouchVariables();
    }

    resetTouchVariables() {
        this.touchStartX = null;
        this.touchStartY = null;
        this.touchEndX = null;
        this.touchEndY = null;
    }

    startActivityTimer() {
        this.stopActivityTimer();
        
        this.activityTimer = setInterval(() => {
            this.preventThrottling();
        }, 16);
        
        // Clear timer after 5 seconds to avoid unnecessary work
        setTimeout(() => {
            this.stopActivityTimer();
        }, 5000);
    }

    stopActivityTimer() {
        if (this.activityTimer) {
            clearInterval(this.activityTimer);
            this.activityTimer = null;
        }
    }

    startContinuousActivityTimer() {
        this.stopContinuousActivityTimer();
        
        // Run continuously during gameplay to prevent any throttling
        this.continuousActivityTimer = setInterval(() => {
            if (this.gameRunning) {
                this.preventThrottling();
            }
        }, 2000); // Every 2 seconds to stay under 3-second browser threshold
    }

    stopContinuousActivityTimer() {
        if (this.continuousActivityTimer) {
            clearInterval(this.continuousActivityTimer);
            this.continuousActivityTimer = null;
        }
    }

    preventThrottling() {
        this.ctx.save();
        this.ctx.globalAlpha = 0.001;
        this.ctx.fillRect(0, 0, 1, 1);
        this.ctx.restore();
        
        this.canvas.style.transform = this.canvas.style.transform || 'translateZ(0)';
    }


    // New improved lily pad system methods
    isWaterLane(y) {
        return y >= 2 && y <= 5;
    }

    findLilyPadGroupAt(x, y) {
        return this.platforms.find(platform => {
            if (platform.y !== y || platform.type !== 'lilypad_group') return false;
            
            const platformLeft = Math.floor(platform.x);
            const platformRight = platformLeft + platform.width;
            return x >= platformLeft && x < platformRight;
        });
    }

    findValidPlatformPosition(targetX, targetY) {
        if (!this.isWaterLane(targetY)) {
            return { valid: true, x: targetX, y: targetY, lilyPadIndex: 0 };
        }

        // Find any platform at target position (lily pads or logs)
        const platform = this.platforms.find(p => {
            if (p.y !== targetY) return false;
            
            const platformLeft = p.x;
            const platformRight = p.x + p.width;
            return targetX >= platformLeft && targetX < platformRight;
        });
        
        if (!platform) {
            return { valid: false, reason: 'No platform at position' };
        }

        if (platform.type === 'lilypad_group') {
            // For lily pad groups, calculate discrete lily pad position
            const platformLeft = Math.floor(platform.x);
            const lilyPadIndex = Math.max(0, Math.min(platform.groupSize - 1, targetX - platformLeft));
            const lilyPadCenterX = platformLeft + lilyPadIndex;

            // Check if this lily pad is occupied by an NPC turtle
            const isOccupied = this.npcTurtles.some(npcTurtle => 
                npcTurtle.platform === platform && npcTurtle.lilyPadIndex === lilyPadIndex
            );

            if (isOccupied) {
                return { valid: false, reason: 'Lily pad occupied by turtle' };
            }

            return {
                valid: true,
                x: lilyPadCenterX,
                y: targetY,
                lilyPadIndex: lilyPadIndex,
                platform: platform
            };
        } else {
            // For logs, center player on the platform
            const platformCenter = platform.x + (platform.width / 2);
            return {
                valid: true,
                x: platformCenter - 0.5,
                y: targetY,
                lilyPadIndex: 0,
                platform: platform
            };
        }
    }

    validatePlatformMovement(newX, newY) {
        // If not in water, movement is always valid (land areas)
        if (!this.isWaterLane(newY)) {
            return { valid: true, x: newX, y: newY, lilyPadIndex: 0 };
        }

        // Current position validation
        const currentGroup = this.player.ridingPlatform;
        
        // If moving within same row and on a platform
        if (newY === this.player.y && currentGroup) {
            if (currentGroup.type === 'lilypad_group') {
                // Lily pad group logic (existing)
                const currentPlatformLeft = Math.floor(currentGroup.x);
                const targetLilyPadIndex = newX - currentPlatformLeft;
                
                // Check if target is within current group boundaries
                if (targetLilyPadIndex >= 0 && targetLilyPadIndex < currentGroup.groupSize) {
                    // Check if target lily pad is occupied by an NPC turtle
                    const isOccupied = this.npcTurtles.some(npcTurtle => 
                        npcTurtle.platform === currentGroup && npcTurtle.lilyPadIndex === targetLilyPadIndex
                    );

                    if (isOccupied) {
                        return { valid: false, reason: 'Lily pad occupied by turtle' };
                    }

                    // Movement within same group - valid if not occupied
                    return {
                        valid: true,
                        x: currentPlatformLeft + targetLilyPadIndex,
                        y: newY,
                        lilyPadIndex: targetLilyPadIndex,
                        platform: currentGroup
                    };
                } else {
                    // Trying to move outside current group - death
                    return { valid: false, reason: 'Moving beyond lily pad group boundary' };
                }
            } else if (currentGroup.type === 'log') {
                // Log logic - different behavior based on log size
                const platformLeft = currentGroup.x;
                const platformRight = currentGroup.x + currentGroup.width;
                
                if (currentGroup.width >= 4) {
                    // Double log (4+ width) - allow side-to-side movement
                    if (newX >= platformLeft && newX < platformRight) {
                        return {
                            valid: true,
                            x: newX,
                            y: newY,
                            lilyPadIndex: 0,
                            platform: currentGroup
                        };
                    } else {
                        return { valid: false, reason: 'Moving beyond log boundary' };
                    }
                } else {
                    // Single log (width < 4) - only allow direction changes, no lateral movement
                    return { valid: false, reason: 'Cannot move sideways on single log' };
                }
            }
        }

        // Moving to different row - must land on valid platform
        return this.findValidPlatformPosition(newX, newY);
    }

    handlePlayerMovement(key) {
        if (!this.gameRunning) return;
        
        const currentTime = Date.now();
        if (currentTime - this.lastMoveTime < this.moveDelay) return;
        
        let newX = this.player.x;
        let newY = this.player.y;
        let newDirection = this.player.direction;
        let attemptedMove = false;
        
        switch(key) {
            case 'ArrowUp':
                newY = Math.max(0, this.player.y - 1);
                newDirection = 'up';
                attemptedMove = (newY !== this.player.y);
                break;
            case 'ArrowDown':
                newY = Math.min(this.GRID_HEIGHT - 1, this.player.y + 1);
                newDirection = 'down';
                attemptedMove = (newY !== this.player.y);
                break;
            case 'ArrowLeft':
                newX = Math.max(0, this.player.x - 1);
                newDirection = 'left';
                attemptedMove = (newX !== this.player.x);
                break;
            case 'ArrowRight':
                newX = Math.min(this.GRID_WIDTH - 1, this.player.x + 1);
                newDirection = 'right';
                attemptedMove = (newX !== this.player.x);
                break;
            default:
                return;
        }
        
        // Always update direction
        this.player.direction = newDirection;
        
        // If player attempted to move, validate the movement
        if (attemptedMove) {
            const validation = this.validatePlatformMovement(newX, newY);
            
            if (validation.valid) {
                // Valid movement - update player position
                const oldY = this.player.y;
                
                this.player.x = validation.x;
                this.player.y = validation.y;
                this.player.lilyPadIndex = validation.lilyPadIndex;
                
                // Update platform riding
                if (validation.platform) {
                    this.player.ridingPlatform = validation.platform;
                } else if (newY !== oldY) {
                    // Clear platform riding when changing rows to non-water areas
                    this.player.ridingPlatform = null;
                }
                
                // Award points for forward movement
                if (newY < oldY) {
                    this.score += 10;
                }
                
                this.lastMoveTime = currentTime;
                
                // Player movement logged
            } else {
                // Invalid movement - player dies
                // Invalid movement
                // Play splash sound for water-related deaths
                if (validation.reason && (validation.reason.includes('water') || validation.reason.includes('platform') || validation.reason.includes('lily pad') || validation.reason.includes('log'))) {
                    this.playSound('splash');
                }
                this.playerDie();
                return;
            }
        }
        
        this.updateUI();
    }

    async loadSprites() {
        console.log('loadSprites() called');
        const spriteList = [
            'turtle', 'car', 'carleft', 'carright', 'bus', 'busleft', 'busright', 'truck', 'truckleft', 'truckright', 'log', 'lilypad', 
            'water1', 'road2', 'grass', 'nest'
        ];
        console.log('Sprite list:', spriteList);
        
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.GAME_WIDTH, this.GAME_HEIGHT);
        this.ctx.fillStyle = '#4ade80';
        this.ctx.font = '24px Inter';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Loading Sprites...', this.GAME_WIDTH / 2, this.GAME_HEIGHT / 2);
        
        const loadPromises = spriteList.map((spriteName, index) => {
            return new Promise((resolve, reject) => {
                console.log(`Attempting to load sprite: ${spriteName}`);
                const img = new Image();
                
                // Add timeout for iOS compatibility
                const timeout = setTimeout(() => {
                    console.error(`Timeout loading sprite: ${spriteName}`);
                    resolve(); // Don't reject, just resolve to continue
                }, 10000); // 10 second timeout
                
                img.onload = () => {
                    clearTimeout(timeout);
                    this.sprites[spriteName] = img;
                    this.loadingProgress = ((index + 1) / spriteList.length) * 100;
                    
                    this.ctx.fillStyle = '#1a1a1a';
                    this.ctx.fillRect(0, this.GAME_HEIGHT / 2 + 20, this.GAME_WIDTH, 40);
                    this.ctx.fillStyle = '#4ade80';
                    this.ctx.fillText(`Loading: ${Math.round(this.loadingProgress)}%`, this.GAME_WIDTH / 2, this.GAME_HEIGHT / 2 + 40);
                    
                    console.log(`Successfully loaded: ${spriteName}`);
                    resolve();
                };
                
                img.onerror = (error) => {
                    clearTimeout(timeout);
                    console.error(`Failed to load sprite: ${spriteName}`, error);
                    console.error(`Image src was: assets/images/${spriteName}.png`);
                    resolve(); // Don't reject, just resolve to continue
                };
                
                // iOS Safari sometimes needs crossOrigin set
                img.crossOrigin = 'anonymous';
                const imagePath = `assets/images/${spriteName}.png`;
                console.log(`Setting image src: ${imagePath}`);
                img.src = imagePath;
            });
        });
        
        try {
            // Set a maximum wait time for all images
            const imageLoadingTimeout = new Promise((resolve) => {
                setTimeout(() => {
                    console.warn('Image loading timeout reached, continuing with available sprites');
                    resolve();
                }, 15000); // 15 second total timeout
            });
            
            await Promise.race([
                Promise.all(loadPromises),
                imageLoadingTimeout
            ]);
            
            console.log('Sprite loading completed (or timed out)');
            console.log('Loaded sprites:', Object.keys(this.sprites));
            
            this.ctx.fillStyle = '#1a1a1a';
            this.ctx.fillRect(0, 0, this.GAME_WIDTH, this.GAME_HEIGHT);
            this.ctx.fillStyle = '#4ade80';
            this.ctx.fillText('Ready to Play!', this.GAME_WIDTH / 2, this.GAME_HEIGHT / 2);
            
        } catch (error) {
            console.error('Failed to load some sprites:', error);
        }
    }

    async loadSounds() {
        console.log('loadSounds() called');
        
        // Split sounds into essential (small) and background (large) for iOS optimization
        const essentialSounds = ['horn1', 'splash', 'nest', 'levelfinish']; // Small files ~26-47KB
        const backgroundSounds = ['traffic', 'river', 'background']; // Large files 378KB-16MB
        
        console.log('Essential sounds:', essentialSounds);
        console.log('Background sounds (will load after):', backgroundSounds);
        
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.GAME_WIDTH, this.GAME_HEIGHT);
        this.ctx.fillStyle = '#4ade80';
        this.ctx.font = '24px Inter';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Loading Essential Sounds...', this.GAME_WIDTH / 2, this.GAME_HEIGHT / 2 + 50);
        
        // Load essential sounds first (fast loading)
        const loadEssentialPromises = essentialSounds.map((soundName, index) => {
            return new Promise((resolve, reject) => {
                console.log(`Attempting to load essential sound: ${soundName}`);
                const audio = new Audio();
                
                // Shorter timeout for essential sounds
                const timeout = setTimeout(() => {
                    console.error(`Timeout loading essential sound: ${soundName}`);
                    resolve();
                }, 5000); // 5 second timeout for essential sounds
                
                audio.preload = 'metadata'; // Load metadata only, faster than 'auto'
                audio.oncanplaythrough = () => {
                    clearTimeout(timeout);
                    this.sounds[soundName] = audio;
                    console.log(`Successfully loaded essential sound: ${soundName}`);
                    resolve();
                };
                audio.onerror = (error) => {
                    clearTimeout(timeout);
                    console.error(`Failed to load essential sound: ${soundName}`, error);
                    resolve();
                };
                
                const audioPath = `assets/sounds/${soundName}.mp3`;
                console.log(`Setting essential audio src: ${audioPath}`);
                audio.src = audioPath;
            });
        });
        
        try {
            // Load essential sounds first (fast)
            const essentialTimeout = new Promise((resolve) => {
                setTimeout(() => {
                    console.warn('Essential sound loading timeout, continuing');
                    resolve();
                }, 6000); // 6 second timeout for essential sounds
            });
            
            await Promise.race([
                Promise.all(loadEssentialPromises),
                essentialTimeout
            ]);
            
            console.log('Essential sounds loaded, game can start now');
            console.log('Essential sounds loaded:', Object.keys(this.sounds));
            
            // Load background sounds asynchronously (don't wait)
            this.loadBackgroundSoundsAsync(backgroundSounds);
            
            // Set volumes for essential sound effects (reduced by another 10%)
            if (this.sounds.horn1) this.sounds.horn1.volume = 0.486; // Reduced by another 10% from 0.54
            if (this.sounds.splash) this.sounds.splash.volume = 0.405; // Reduced by another 10% from 0.45
            if (this.sounds.nest) this.sounds.nest.volume = 0.405; // Reduced by another 10% from 0.45
            if (this.sounds.levelfinish) this.sounds.levelfinish.volume = 0.567; // Reduced by another 10% from 0.63
            
        } catch (error) {
            console.error('Failed to load some sounds');
        }
    }

    playSound(soundName) {
        if (this.sounds[soundName] && this.soundsLoaded) {
            try {
                // Create a new audio instance for overlapping sounds
                const audioClone = this.sounds[soundName].cloneNode();
                audioClone.volume = this.sounds[soundName].volume;
                audioClone.currentTime = 0;
                audioClone.play().catch(e => {
                    console.log(`Could not play sound ${soundName}:`, e);
                });
            } catch (e) {
                console.log(`Error cloning sound ${soundName}:`, e);
                // Fallback to original method
                this.sounds[soundName].currentTime = 0;
                this.sounds[soundName].play().catch(e => {
                    console.log(`Could not play sound ${soundName}:`, e);
                });
            }
        }
    }

    tryStartBackgroundMusic() {
        // Only try once and only if not already playing
        if (!this.backgroundMusic.isLooping && this.backgroundMusic.primary && this.soundsLoaded) {
            // Starting background music
            this.startBackgroundMusic();
        }
    }

    startBackgroundMusic() {
        if (!this.backgroundMusic.primary) {
            console.log('No background music available');
            return;
        }
        
        console.log('Attempting to start background music...');
        this.backgroundMusic.isLooping = true;
        this.backgroundMusic.currentTrack = 'primary';
        
        // Start playing the primary track and fade it in
        this.backgroundMusic.primary.play().then(() => {
            console.log('Background music started successfully');
            this.fadeInBackgroundMusic();
            this.setupMusicLooping();
        }).catch(e => {
            console.log('Could not play background music:', e);
            // Try again in a moment (sometimes audio context needs time)
            setTimeout(() => {
                this.backgroundMusic.primary.play().then(() => {
                    console.log('Background music started on retry');
                    this.fadeInBackgroundMusic();
                    this.setupMusicLooping();
                }).catch(e2 => {
                    console.log('Background music failed on retry:', e2);
                });
            }, 1000);
        });
    }

    fadeInBackgroundMusic() {
        if (!this.backgroundMusic.primary) return;
        
        const fadeInDuration = 2000; // 2 seconds fade in
        const targetVolume = this.targetVolumes.backgroundMusic;
        const fadeSteps = 60;
        const stepDuration = fadeInDuration / fadeSteps;
        const volumeStep = targetVolume / fadeSteps;
        
        let currentStep = 0;
        
        const fadeInterval = setInterval(() => {
            const currentTrack = this.backgroundMusic[this.backgroundMusic.currentTrack];
            if (currentStep < fadeSteps && currentTrack) {
                currentTrack.volume = volumeStep * currentStep;
                currentStep++;
            } else {
                clearInterval(fadeInterval);
                if (currentTrack) {
                    currentTrack.volume = targetVolume;
                }
            }
        }, stepDuration);
    }

    setupMusicLooping() {
        if (!this.backgroundMusic.primary || !this.backgroundMusic.secondary) return;
        
        const checkLoop = () => {
            if (!this.backgroundMusic.isLooping) return;
            
            const currentTrack = this.backgroundMusic[this.backgroundMusic.currentTrack];
            const nextTrackName = this.backgroundMusic.currentTrack === 'primary' ? 'secondary' : 'primary';
            const nextTrack = this.backgroundMusic[nextTrackName];
            
            // Start crossfade when 3 seconds left in current track
            const timeLeft = currentTrack.duration - currentTrack.currentTime;
            
            if (timeLeft <= 3 && timeLeft > 2.9) {
                this.crossfadeToNextTrack(nextTrackName);
            }
            
            // Check every 100ms
            setTimeout(checkLoop, 100);
        };
        
        checkLoop();
    }

    crossfadeToNextTrack(nextTrackName) {
        const currentTrack = this.backgroundMusic[this.backgroundMusic.currentTrack];
        const nextTrack = this.backgroundMusic[nextTrackName];
        
        if (!nextTrack) return;
        
        // Start the next track
        nextTrack.currentTime = 0;
        nextTrack.volume = 0;
        nextTrack.play().catch(e => {
            console.log('Could not play next background track:', e);
        });
        
        // Crossfade duration
        const crossfadeDuration = 3000; // 3 seconds
        const steps = 60;
        const stepDuration = crossfadeDuration / steps;
        const volumeStep = this.targetVolumes.backgroundMusic / steps;
        
        let step = 0;
        
        const crossfadeInterval = setInterval(() => {
            if (step < steps) {
                // Fade out current track
                if (currentTrack) {
                    currentTrack.volume = Math.max(0, this.targetVolumes.backgroundMusic - (volumeStep * step));
                }
                // Fade in next track
                if (nextTrack) {
                    nextTrack.volume = Math.min(this.targetVolumes.backgroundMusic, volumeStep * step);
                }
                step++;
            } else {
                // Crossfade complete
                clearInterval(crossfadeInterval);
                if (currentTrack) {
                    currentTrack.pause();
                    currentTrack.currentTime = 0;
                }
                this.backgroundMusic.currentTrack = nextTrackName;
            }
        }, stepDuration);
    }

    stopBackgroundMusic() {
        this.backgroundMusic.isLooping = false;
        
        if (this.backgroundMusic.primary) {
            this.backgroundMusic.primary.pause();
        }
        if (this.backgroundMusic.secondary) {
            this.backgroundMusic.secondary.pause();
        }
    }

    startBackgroundSounds() {
        if (this.backgroundSounds.traffic) {
            this.backgroundSounds.traffic.play().catch(e => {
                console.log('Could not play traffic sound:', e);
            });
        }
        if (this.backgroundSounds.river) {
            this.backgroundSounds.river.play().catch(e => {
                console.log('Could not play river sound:', e);
            });
            // Start fade-in for river sound over 15 seconds
            this.fadeInRiver();
        }
        
        // Start dynamic audio updates
        this.startDynamicAudio();
    }

    fadeInRiver() {
        if (!this.backgroundSounds.river) return;
        
        const fadeInDuration = 15000; // 15 seconds
        const targetVolume = this.targetVolumes.river;
        const fadeSteps = 60; // 60 steps for smooth fade
        const stepDuration = fadeInDuration / fadeSteps;
        const volumeStep = targetVolume / fadeSteps;
        
        let currentStep = 0;
        
        const fadeInterval = setInterval(() => {
            if (currentStep < fadeSteps && this.backgroundSounds.river) {
                this.backgroundSounds.river.volume = volumeStep * currentStep;
                currentStep++;
            } else {
                clearInterval(fadeInterval);
                if (this.backgroundSounds.river) {
                    this.backgroundSounds.river.volume = targetVolume;
                }
            }
        }, stepDuration);
    }

    startDynamicAudio() {
        if (this.audioFadeInterval) {
            clearInterval(this.audioFadeInterval);
        }
        
        this.audioFadeInterval = setInterval(() => {
            if (this.gameRunning) {
                this.updateAudioBasedOnPosition();
            }
        }, 100); // Update every 100ms for smooth transitions
    }

    updateAudioBasedOnPosition() {
        if (!this.backgroundSounds.traffic || !this.backgroundSounds.river) return;
        
        const playerY = this.player.y;
        
        // Define zones
        const roadZone = playerY >= 7 && playerY <= 10; // Road lanes
        const waterZone = playerY >= 2 && playerY <= 5; // Water lanes
        const grassZone = playerY < 2 || playerY > 10; // Grass areas
        
        let targetTrafficVolume, targetRiverVolume;
        
        if (roadZone) {
            // On road - traffic louder, river quieter
            targetTrafficVolume = this.targetVolumes.traffic;
            targetRiverVolume = this.targetVolumes.river * 0.3;
        } else if (waterZone) {
            // On water - river louder, traffic quieter
            targetTrafficVolume = this.targetVolumes.traffic * 0.4;
            targetRiverVolume = this.targetVolumes.river * 1.5;
        } else {
            // On grass - balanced levels
            targetTrafficVolume = this.targetVolumes.traffic * 0.7;
            targetRiverVolume = this.targetVolumes.river * 0.8;
        }
        
        // Smooth fade to target volumes
        this.smoothVolumeTransition('traffic', targetTrafficVolume);
        this.smoothVolumeTransition('river', targetRiverVolume);
    }

    smoothVolumeTransition(soundType, targetVolume) {
        if (!this.backgroundSounds[soundType]) return;
        
        const currentVolume = this.backgroundSounds[soundType].volume;
        const volumeDifference = targetVolume - currentVolume;
        const fadeSpeed = 0.02; // Smooth fade speed
        
        if (Math.abs(volumeDifference) > 0.01) {
            const volumeChange = volumeDifference * fadeSpeed;
            this.backgroundSounds[soundType].volume = Math.max(0, Math.min(1, currentVolume + volumeChange));
        }
    }

    stopBackgroundSounds() {
        if (this.audioFadeInterval) {
            clearInterval(this.audioFadeInterval);
            this.audioFadeInterval = null;
        }
        
        if (this.backgroundSounds.traffic) {
            this.backgroundSounds.traffic.pause();
        }
        if (this.backgroundSounds.river) {
            this.backgroundSounds.river.pause();
        }
    }

    startGame() {
        this.gameStarted = true;
        this.gameRunning = true;
        
        document.getElementById('startScreen').style.display = 'none';
        document.getElementById('gameOverScreen').style.display = 'none';
        
        // Clear any existing timeouts/intervals
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        if (this.messageTimeout) {
            clearTimeout(this.messageTimeout);
        }
        if (this.deathFlashTimeout) {
            clearTimeout(this.deathFlashTimeout);
        }
        
        // Reset game state
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.timer = 90;  // Reset timer to 90 seconds when starting new game
        this.homes = [false, false, false, false, false];
        this.message = '';
        this.deathFlash = false;
        
        this.initializeLevel();
        this.startTimer();
        this.updateUI();
        
        // Start background sounds when game begins
        this.startBackgroundSounds();
        
        // Start background music now that user has interacted
        if (!this.backgroundMusic.isLooping && this.backgroundMusic.primary) {
            console.log('Starting background music after user interaction');
            this.startBackgroundMusic();
        }
        
        // Start continuous anti-throttling during gameplay
        this.startContinuousActivityTimer();
        
        console.log('Game started!');
        this.lastTime = performance.now();
        this.gameLoop(this.lastTime);
    }

    startTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        // Only reset timer to 90 seconds when starting a new game or advancing levels
        // Timer continues from current value when player dies
        if (this.timer <= 0) {
            this.timer = 90;
        }
        
        this.timerInterval = setInterval(() => {
            if (this.gameRunning) {
                this.timer--;
                this.updateUI();
                
                if (this.timer <= 0) {
                    console.log('Time up!');
                    this.playerDie();
                }
            }
        }, 1000);
    }

    updateUI() {
        document.getElementById('scoreDisplay').textContent = this.score;
        document.getElementById('livesDisplay').textContent = this.lives;
        document.getElementById('levelDisplay').textContent = this.level;
        
        const timerElement = document.getElementById('timerDisplay');
        timerElement.textContent = this.timer;
        
        // Change timer color based on remaining time
        if (this.timer <= 10) {
            timerElement.style.color = '#dc2626';
            timerElement.style.animation = 'pulse 1s infinite';
        } else if (this.timer <= 20) {
            timerElement.style.color = '#ea580c';
            timerElement.style.animation = 'none';
        } else {
            timerElement.style.color = '#4ade80';
            timerElement.style.animation = 'none';
        }
    }

    initializeLevel() {
        this.vehicles = [];
        this.platforms = [];
        this.npcTurtles = []; // Reset NPC turtles for new level
        this.player.x = 7;
        this.player.y = 11;
        this.player.direction = 'up';
        this.player.ridingPlatform = null;
        this.player.lilyPadIndex = 0;
        
        this.createVehicles();
        this.createPlatforms();
    }

    createVehicles() {
        // Position vehicles ON grid rows, not between them
        // Road spans rows 7, 8, 9, 10 - vehicles should be AT these coordinates
        
        // Speed multiplier patterns that rotate each level
        const speedPatterns = [
            [0.8, 1.6, 1.0, 1.4], // Level 1: slow, fastest, medium, fast
            [1.4, 1.0, 1.6, 0.8], // Level 2: fast, medium, fastest, slow
            [1.0, 0.8, 1.4, 1.6], // Level 3: medium, slow, fast, fastest
            [1.6, 1.4, 0.8, 1.0], // Level 4: fastest, fast, slow, medium
        ];
        
        // Get speed pattern for current level (cycle through patterns)
        const patternIndex = (this.level - 1) % speedPatterns.length;
        const currentPattern = speedPatterns[patternIndex];
        
        const lanes = [
            { y: 7, direction: -1, speedMultiplier: currentPattern[0] }, // Top lane (row 7): LEFT
            { y: 8, direction: 1, speedMultiplier: currentPattern[1] },  // 2nd lane (row 8): RIGHT  
            { y: 9, direction: -1, speedMultiplier: currentPattern[2] }, // 3rd lane (row 9): LEFT
            { y: 10, direction: 1, speedMultiplier: currentPattern[3] }  // Bottom lane (row 10): RIGHT
        ];
        const vehicleTypes = ['car', 'bus', 'truck'];
        
        lanes.forEach((laneInfo, index) => {
            const direction = laneInfo.direction;
            const baseSpeed = 0.025 + (this.level - 1) * 0.005; // Increases each level
            const speed = baseSpeed * laneInfo.speedMultiplier * direction;
            
            for (let i = 0; i < 3; i++) {
                const vehicleType = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
                
                // Start vehicles spread across the screen, not off-screen
                let startX;
                if (direction > 0) {
                    startX = (i * 5) + Math.random() * 2; // Start between 0-15
                } else {
                    startX = this.GRID_WIDTH - 1 - (i * 5) - Math.random() * 2; // Start between 1-16
                }
                
                this.vehicles.push({
                    x: startX,
                    y: laneInfo.y, // Positioned ON grid row
                    type: vehicleType,
                    speed: speed,
                    direction: direction,
                    width: 1,
                    height: 1
                });
            }
        });
        
        console.log(`Created ${this.vehicles.length} vehicles in 4 lanes: ROW 7(left), ROW 8(right), ROW 9(left), ROW 10(right)`);
    }

    createPlatforms() {
        const waterLanes = [2, 3, 4, 5];
        
        waterLanes.forEach((lane, index) => {
            const direction = (index % 2 === 0) ? 1 : -1;
            const speed = (0.02 + (this.level - 1) * 0.004) * direction; // Increased from 0.01 to 0.02
            
            let currentX = direction > 0 ? 0 : this.GRID_WIDTH;
            const platformsThisLane = [];
            
            while ((direction > 0 && currentX < this.GRID_WIDTH) || (direction < 0 && currentX > 0)) {
                // Randomly choose platform type and grouping
                const rand = Math.random();
                
                if (rand < 0.4) {
                    // Single log - always 2 spaces wide (40% chance)
                    const width = 2;
                    if (direction > 0) {
                        platformsThisLane.push({
                            x: currentX,
                            y: lane,
                            type: 'log',
                            speed: speed,
                            direction: direction,
                            width: width,
                            height: 1
                        });
                        currentX += width + 2 + Math.random() * 2; // Gap after
                    } else {
                        currentX -= width;
                        platformsThisLane.push({
                            x: currentX,
                            y: lane,
                            type: 'log',
                            speed: speed,
                            direction: direction,
                            width: width,
                            height: 1
                        });
                        currentX -= 2 + Math.random() * 2; // Gap before
                    }
                } else if (rand < 0.6) {
                    // Double log - 4 spaces wide for side-to-side jumping (20% chance)
                    const width = 4;
                    if (direction > 0) {
                        platformsThisLane.push({
                            x: currentX,
                            y: lane,
                            type: 'log',
                            speed: speed,
                            direction: direction,
                            width: width,
                            height: 1
                        });
                        currentX += width + 2 + Math.random() * 2; // Gap after
                    } else {
                        currentX -= width;
                        platformsThisLane.push({
                            x: currentX,
                            y: lane,
                            type: 'log',
                            speed: speed,
                            direction: direction,
                            width: width,
                            height: 1
                        });
                        currentX -= 2 + Math.random() * 2; // Gap before
                    }
                } else if (rand < 0.9) {
                    // Group of 2 lily pads (30% chance, increased by 10%)
                    const groupSize = 2;
                    if (direction > 0) {
                        platformsThisLane.push({
                            x: currentX,
                            y: lane,
                            type: 'lilypad_group',
                            speed: speed,
                            direction: direction,
                            width: groupSize,
                            height: 1,
                            groupSize: groupSize
                        });
                        currentX += groupSize + 2 + Math.random() * 2; // Gap after group
                    } else {
                        currentX -= groupSize;
                        platformsThisLane.push({
                            x: currentX,
                            y: lane,
                            type: 'lilypad_group',
                            speed: speed,
                            direction: direction,
                            width: groupSize,
                            height: 1,
                            groupSize: groupSize
                        });
                        currentX -= 2 + Math.random() * 2; // Gap before group
                    }
                } else {
                    // Group of 3 lily pads (10% chance, reduced to balance)
                    const groupSize = 3;
                    if (direction > 0) {
                        platformsThisLane.push({
                            x: currentX,
                            y: lane,
                            type: 'lilypad_group',
                            speed: speed,
                            direction: direction,
                            width: groupSize,
                            height: 1,
                            groupSize: groupSize
                        });
                        currentX += groupSize + 2 + Math.random() * 2; // Gap after group
                    } else {
                        currentX -= groupSize;
                        platformsThisLane.push({
                            x: currentX,
                            y: lane,
                            type: 'lilypad_group',
                            speed: speed,
                            direction: direction,
                            width: groupSize,
                            height: 1,
                            groupSize: groupSize
                        });
                        currentX -= 2 + Math.random() * 2; // Gap before group
                    }
                }
            }
            
            // Add all platforms from this lane
            this.platforms.push(...platformsThisLane);
        });
        
        console.log(`Created ${this.platforms.length} platforms with lily pad groups`);
        
        // Spawn NPC turtles on lily pads
        this.spawnNPCTurtles();
    }

    spawnNPCTurtles() {
        this.npcTurtles = []; // Clear existing NPC turtles
        
        // Find all lily pad groups
        const lilyPadGroups = this.platforms.filter(platform => platform.type === 'lilypad_group');
        
        lilyPadGroups.forEach(platform => {
            if (platform.groupSize === 2) {
                // For 2-lily groups: 40% chance to place 1 turtle randomly
                if (Math.random() < 0.4) {
                    const randomPadIndex = Math.floor(Math.random() * 2); // 0 or 1
                    this.npcTurtles.push({
                        x: platform.x + randomPadIndex,
                        y: platform.y,
                        platform: platform,
                        lilyPadIndex: randomPadIndex,
                        direction: 'down'
                    });
                }
            } else if (platform.groupSize === 3) {
                const rand = Math.random();
                if (rand < 0.15) {
                    // 15% chance: Place 2 turtles on sides (index 0 and 2), leaving middle empty
                    this.npcTurtles.push({
                        x: platform.x + 0,
                        y: platform.y,
                        platform: platform,
                        lilyPadIndex: 0,
                        direction: 'down'
                    });
                    this.npcTurtles.push({
                        x: platform.x + 2,
                        y: platform.y,
                        platform: platform,
                        lilyPadIndex: 2,
                        direction: 'down'
                    });
                } else if (rand < 0.45) {
                    // 30% chance: Place 1 turtle randomly
                    const randomPadIndex = Math.floor(Math.random() * 3); // 0, 1, or 2
                    this.npcTurtles.push({
                        x: platform.x + randomPadIndex,
                        y: platform.y,
                        platform: platform,
                        lilyPadIndex: randomPadIndex,
                        direction: 'down'
                    });
                }
                // 55% chance: No turtle at all
            }
        });
        
        console.log(`Spawned ${this.npcTurtles.length} NPC turtles on lily pads`);
    }

    update(currentTime) {
        if (!this.gameRunning) return;
        
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.updateVehicles();
        this.updatePlatforms();
        this.updatePlayerOnPlatform();
        this.checkCollisions();
    }

    updateVehicles(deltaSeconds = 1/60) {
        this.vehicles.forEach(vehicle => {
            // Scale movement by time elapsed to maintain consistent speed regardless of frame rate
            vehicle.x += vehicle.speed * deltaSeconds * 60;
            
            // Wrap vehicles around screen
            if (vehicle.direction > 0 && vehicle.x > this.GRID_WIDTH + 2) {
                vehicle.x = -2;
            } else if (vehicle.direction < 0 && vehicle.x < -2) {
                vehicle.x = this.GRID_WIDTH + 2;
            }
        });
    }

    updatePlatforms(deltaSeconds = 1/60) {
        this.platforms.forEach(platform => {
            // Scale movement by time elapsed to maintain consistent speed regardless of frame rate
            platform.x += platform.speed * deltaSeconds * 60;
            
            // Wrap platforms around screen
            if (platform.direction > 0 && platform.x > this.GRID_WIDTH + 3) {
                platform.x = -3;
            } else if (platform.direction < 0 && platform.x < -3) {
                platform.x = this.GRID_WIDTH + 3;
            }
        });
        
        // Update NPC turtle positions to move with their platforms
        this.updateNPCTurtles();
    }

    updateNPCTurtles() {
        this.npcTurtles.forEach(npcTurtle => {
            // Update NPC turtle position based on their platform's current position
            const platform = npcTurtle.platform;
            if (platform.type === 'lilypad_group') {
                // For lily pad groups, maintain relative position within the group
                npcTurtle.x = platform.x + npcTurtle.lilyPadIndex;
                npcTurtle.y = platform.y;
            }
        });
    }

    updatePlayerOnPlatform() {
        // Only apply platform mechanics in water lanes (2-5)
        if (this.isWaterLane(this.player.y) && this.player.ridingPlatform) {
            // Move player with platform using exact floating-point synchronization
            const platform = this.player.ridingPlatform;
            
            if (platform.type === 'lilypad_group') {
                // For lily pad groups, maintain relative position within the group
                const newPlayerX = platform.x + this.player.lilyPadIndex;
                this.player.x = newPlayerX;
            } else {
                // For logs and other platforms, move with the platform center
                const platformCenter = platform.x + (platform.width / 2);
                this.player.x = platformCenter - 0.5; // Center player on platform
            }
            
            // Check for off-screen death
            if (this.player.x < 0 || this.player.x >= this.GRID_WIDTH) {
                // Player carried off screen
                this.playSound('splash');
                this.playerDie();
                return;
            }
        }
    }

    checkCollisions() {
        // Check vehicle collisions in road lanes (7-10)
        if (this.player.y >= 7 && this.player.y <= 10) {
            this.vehicles.forEach(vehicle => {
                // Check if player is in the same grid row as vehicle
                if (vehicle.y === this.player.y) {
                    // Account for different vehicle sizes - adjust collision bounds
                    let vehicleSize = 1.1; // Default 10% larger for cars
                    if (vehicle.type === 'bus' || vehicle.type === 'truck') {
                        vehicleSize = 1.76; // 60% bigger than base
                    }
                    const offset = (vehicleSize - 1) / 2;
                    
                    const vehicleLeft = vehicle.x - offset;
                    const vehicleRight = vehicle.x + vehicle.width + offset;
                    
                    // Player collision bounds (exact 1x1 grid)
                    const playerLeft = this.player.x;
                    const playerRight = this.player.x + 1;
                    
                    // Check for overlap using precise bounds
                    if (playerRight > vehicleLeft && playerLeft < vehicleRight) {
                        // Player hit by vehicle
                        this.playSound('horn1');
                        this.playerDie();
                        return;
                    }
                }
            });
        }
        
        // Check water drowning in water lanes (2-5)
        // With the new system, if player is in water lane, they must be on a platform
        if (this.isWaterLane(this.player.y)) {
            if (!this.player.ridingPlatform) {
                // Player drowned
                this.playSound('splash');
                this.playerDie();
                return;
            }
        }
        
        // Check home slot detection (row 0)
        if (this.player.y === 0) {
            const homeIndex = Math.floor(this.player.x / (this.GRID_WIDTH / 5));
            if (homeIndex >= 0 && homeIndex < 5 && !this.homes[homeIndex]) {
                // Player reached home
                this.playSound('nest');
                this.homes[homeIndex] = true;
                this.score += 50 + (this.timer * 10);
                
                // Reset player position
                this.player.x = 7;
                this.player.y = 11;
                this.player.direction = 'up';
                this.player.ridingPlatform = null;
                this.player.lilyPadIndex = 0;
                
                // Check if all homes are filled
                if (this.homes.every(home => home)) {
                    this.levelComplete();
                }
                
                this.updateUI();
            }
        }
        
        // Check boundary limits - only for Y axis, X axis handled by platform/death logic
        if (this.player.y < 0) this.player.y = 0;
        if (this.player.y >= this.GRID_HEIGHT) this.player.y = this.GRID_HEIGHT - 1;
        
        // X-axis boundaries are handled contextually:
        // - In water: falling off screen causes death
        // - On land: prevent movement beyond boundaries  
        if (this.player.y < 2 || this.player.y > 5) {
            // On land - enforce boundaries
            if (this.player.x < 0) this.player.x = 0;
            if (this.player.x >= this.GRID_WIDTH) this.player.x = this.GRID_WIDTH - 1;
        }
    }

    playerDie() {
        // Player died
        
        // Add death flash effect
        this.deathFlash = true;
        if (this.deathFlashTimeout) {
            clearTimeout(this.deathFlashTimeout);
        }
        this.deathFlashTimeout = setTimeout(() => {
            this.deathFlash = false;
        }, 500);
        
        this.lives--;
        
        // Reset player position
        this.player.x = 7;
        this.player.y = 11;
        this.player.direction = 'up';
        this.player.ridingPlatform = null;
        this.player.lilyPadIndex = 0;
        
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            // Don't reset timer when player dies - keep current time
            this.updateUI();
        }
    }

    levelComplete() {
        console.log('Level complete!');
        this.playSound('levelfinish');
        this.level++;
        this.score += 1000;
        this.homes = [false, false, false, false, false];
        
        // Reset timer to 90 seconds for new level
        this.timer = 90;
        
        // Award bonus life for completing level
        this.lives++;
        
        this.initializeLevel();
        this.updateUI();
        
        // Show level complete message briefly
        this.showMessage(`Level ${this.level}! +1 Life!`, 2000);
    }

    showMessage(text, duration = 3000) {
        this.message = text;
        
        if (this.messageTimeout) {
            clearTimeout(this.messageTimeout);
        }
        
        this.messageTimeout = setTimeout(() => {
            this.message = '';
        }, duration);
    }

    render() {
        // Always render - sprites load in background
        
        // Save current transform and clear canvas
        this.ctx.save();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
        
        // Fill with grass color first to eliminate gray canvas background
        this.ctx.fillStyle = '#059669';
        this.ctx.fillRect(0, 0, this.GAME_WIDTH, this.GAME_HEIGHT);
        
        if (!this.gameStarted) {
            this.renderStartScreen();
        } else {
            this.renderBackground();
            this.renderPlatforms();
            this.renderVehicles();
            this.renderPlayer();
            this.renderHomes();
            if (this.enableDeFiTheme) {
                this.renderDeFiLabels();
            }
            this.renderMessage();
        }
    }

    renderStartScreen() {
        this.ctx.fillStyle = '#059669';
        this.ctx.fillRect(0, 0, this.GAME_WIDTH, this.GAME_HEIGHT);
        
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.font = '36px Inter';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Press Start to Play!', this.GAME_WIDTH / 2, this.GAME_HEIGHT / 2);
    }

    renderBackground() {
        // Render water first to ensure it's not overridden
        this.renderWaterArea();
        
        // Render background using sprites
        for (let y = 0; y < this.GRID_HEIGHT; y++) {
            for (let x = 0; x < this.GRID_WIDTH; x++) {
                let sprite;
                
                if (y === 0 || y === 1 || y === 6 || y === 11) {
                    // Grass areas
                    sprite = this.sprites.grass;
                } else if (y >= 7 && y <= 10) {
                    // Road areas
                    sprite = this.sprites.road2;
                } else if (y >= 2 && y <= 5) {
                    // Water areas - skip individual tile rendering, water texture already rendered
                    continue;
                }
                
                if (sprite) {
                    this.ctx.drawImage(sprite, x * this.TILE_SIZE, y * this.TILE_SIZE, this.TILE_SIZE, this.TILE_SIZE);
                } else {
                    // Fallback colors if sprites aren't loaded
                    if (y >= 7 && y <= 10) {
                        this.ctx.fillStyle = '#2d3748'; // Dark asphalt color
                        this.ctx.fillRect(x * this.TILE_SIZE, y * this.TILE_SIZE, this.TILE_SIZE, this.TILE_SIZE);
                    } else if (y >= 2 && y <= 5) {
                        // Water areas - already handled by renderWaterArea
                        continue;
                    } else {
                        this.ctx.fillStyle = '#059669';
                        this.ctx.fillRect(x * this.TILE_SIZE, y * this.TILE_SIZE, this.TILE_SIZE, this.TILE_SIZE);
                    }
                }
            }
        }
        
        // Render road as asphalt color
        this.renderRoadArea();
    }

    renderWaterArea() {
        const waterStartY = 2;
        const waterEndY = 5;
        const waterAreaHeight = (waterEndY - waterStartY + 1) * this.TILE_SIZE;
        const waterAreaWidth = this.GAME_WIDTH;
        
        this.ctx.save();
        
        if (this.sprites.water1) {
            // Extend water texture WAY beyond boundaries to ensure complete coverage
            // Start well before canvas and extend well past canvas edges
            this.ctx.drawImage(this.sprites.water1, 
                -50, 
                waterStartY * this.TILE_SIZE - 50, 
                this.GAME_WIDTH + 100,
                waterAreaHeight + 100
            );
        } else {
            // Fallback to solid color if texture not loaded
            this.ctx.fillStyle = '#0ea5e9';
            this.ctx.fillRect(0, waterStartY * this.TILE_SIZE, waterAreaWidth, waterAreaHeight);
        }
        
        this.ctx.restore();
    }

    renderRoadArea() {
        const roadStartY = 7;
        const roadEndY = 10;
        const roadAreaHeight = (roadEndY - roadStartY + 1) * this.TILE_SIZE;
        const roadAreaWidth = this.GAME_WIDTH;
        
        this.ctx.save();
        
        // Fill with gray asphalt background
        this.ctx.fillStyle = '#4a5568'; // Medium-dark asphalt gray
        this.ctx.fillRect(0, roadStartY * this.TILE_SIZE, roadAreaWidth, roadAreaHeight);
        
        // Draw lane dividers that align with grid system
        // Each grid row (7,8,9,10) is a lane, so dividers go between rows
        this.ctx.strokeStyle = '#fbbf24'; // Yellow color
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([20, 20]); // Longer dashes with bigger gaps
        
        // Draw dividers between grid rows: after row 7, 8, and 9
        for (let row = 7; row < 10; row++) {
            const y = (row + 1) * this.TILE_SIZE; // Between current row and next
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.GAME_WIDTH, y);
            this.ctx.stroke();
        }
        
        // Add 5px white lines at top and bottom of road
        this.ctx.strokeStyle = '#ffffff'; // White color
        this.ctx.lineWidth = 5;
        this.ctx.setLineDash([]); // Solid lines
        
        // Top edge of road (top of row 7)
        const topY = roadStartY * this.TILE_SIZE;
        this.ctx.beginPath();
        this.ctx.moveTo(0, topY);
        this.ctx.lineTo(this.GAME_WIDTH, topY);
        this.ctx.stroke();
        
        // Bottom edge of road (bottom of row 10)
        const bottomY = (roadEndY + 1) * this.TILE_SIZE;
        this.ctx.beginPath();
        this.ctx.moveTo(0, bottomY);
        this.ctx.lineTo(this.GAME_WIDTH, bottomY);
        this.ctx.stroke();
        
        this.ctx.restore();
    }

    renderPlatforms() {
        this.platforms.forEach(platform => {
            if (platform.type === 'lilypad_group') {
                // Render individual lily pads in the group
                const lilypadSprite = this.sprites.lilypad;
                if (lilypadSprite) {
                    for (let i = 0; i < platform.groupSize; i++) {
                        const x = (platform.x + i) * this.TILE_SIZE;
                        const y = platform.y * this.TILE_SIZE;
                        
                        this.ctx.save();
                        this.ctx.translate(x + this.TILE_SIZE / 2, y + this.TILE_SIZE / 2);
                        
                        // Mirror sprite if moving left
                        if (platform.direction < 0) {
                            this.ctx.scale(-1, 1);
                        }
                        
                        this.ctx.drawImage(lilypadSprite, -this.TILE_SIZE / 2, -this.TILE_SIZE / 2, this.TILE_SIZE, this.TILE_SIZE);
                        this.ctx.restore();
                    }
                } else {
                    // Fallback for lily pad groups
                    const x = platform.x * this.TILE_SIZE;
                    const y = platform.y * this.TILE_SIZE + 10;
                    const width = platform.width * this.TILE_SIZE;
                    
                    this.ctx.fillStyle = '#166534';
                    this.ctx.fillRect(x, y, width, this.TILE_SIZE - 20);
                }
            } else {
                // Regular platform rendering (logs, single lily pads)
                const sprite = this.sprites[platform.type];
                if (sprite) {
                    const x = platform.x * this.TILE_SIZE;
                    const y = platform.y * this.TILE_SIZE;
                    const width = platform.width * this.TILE_SIZE;
                    
                    this.ctx.save();
                    this.ctx.translate(x + width / 2, y + this.TILE_SIZE / 2);
                    
                    // Mirror sprite if moving left
                    if (platform.direction < 0) {
                        this.ctx.scale(-1, 1);
                    }
                    
                    // Make logs taller than normal tile size
                    const height = platform.type === 'log' ? this.TILE_SIZE * 1.5 : this.TILE_SIZE;
                    this.ctx.drawImage(sprite, -width / 2, -height / 2, width, height);
                    this.ctx.restore();
                } else {
                    // Fallback if sprite isn't loaded
                    const x = platform.x * this.TILE_SIZE;
                    const y = platform.y * this.TILE_SIZE + 10;
                    const width = platform.width * this.TILE_SIZE;
                    
                    switch(platform.type) {
                        case 'log':
                            this.ctx.fillStyle = '#92400e';
                            break;
                        case 'lilypad':
                            this.ctx.fillStyle = '#166534';
                            break;
                    }
                    
                    this.ctx.fillRect(x, y, width, this.TILE_SIZE - 20);
                    
                    // Platform type indicator
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.font = '12px Inter';
                    this.ctx.fillText(platform.type[0].toUpperCase(), x + 5, y + 20);
                }
            }
        });
        
        // Render NPC turtles on top of lily pads
        this.renderNPCTurtles();
    }

    renderNPCTurtles() {
        const turtleSprite = this.sprites.turtle;
        if (!turtleSprite) return;

        this.npcTurtles.forEach(npcTurtle => {
            const x = npcTurtle.x * this.TILE_SIZE;
            const y = npcTurtle.y * this.TILE_SIZE;
            
            this.ctx.save();
            this.ctx.translate(x + this.TILE_SIZE / 2, y + this.TILE_SIZE / 2);
            
            // Rotate based on direction (NPC turtles face up by default)
            switch(npcTurtle.direction) {
                case 'down':
                    this.ctx.rotate(Math.PI);
                    break;
                case 'left':
                    this.ctx.rotate(-Math.PI / 2);
                    break;
                case 'right':
                    this.ctx.rotate(Math.PI / 2);
                    break;
                // 'up' case - no rotation needed (default)
            }
            
            // Draw the NPC turtle with a dark green color filter
            this.ctx.filter = 'hue-rotate(60deg) saturate(1.5) brightness(0.6)'; // Dark green tint
            this.ctx.drawImage(turtleSprite, -this.TILE_SIZE / 2, -this.TILE_SIZE / 2, this.TILE_SIZE, this.TILE_SIZE);
            this.ctx.filter = 'none'; // Reset filter
            
            this.ctx.restore();
        });
    }

    renderVehicles() {
        this.vehicles.forEach(vehicle => {
            let sprite;
            
            // Use direction-specific sprites for truck, bus, and car
            if (vehicle.type === 'truck') {
                sprite = vehicle.direction > 0 ? this.sprites.truckright : this.sprites.truckleft;
            } else if (vehicle.type === 'bus') {
                sprite = vehicle.direction > 0 ? this.sprites.busright : this.sprites.busleft;
            } else if (vehicle.type === 'car') {
                sprite = vehicle.direction > 0 ? this.sprites.carright : this.sprites.carleft;
            } else {
                sprite = this.sprites[vehicle.type];
            }
            
            if (sprite) {
                const x = vehicle.x * this.TILE_SIZE;
                const y = vehicle.y * this.TILE_SIZE;
                
                this.ctx.save();
                this.ctx.translate(x + this.TILE_SIZE / 2, y + this.TILE_SIZE / 2);
                
                // Mirror sprite for vehicles without directional sprites when moving left
                if (vehicle.type !== 'truck' && vehicle.type !== 'bus' && vehicle.type !== 'car' && vehicle.direction < 0) {
                    this.ctx.scale(-1, 1);
                }
                
                // Different sizes for different vehicle types
                let sizeMultiplier = 1.0; // Default base size
                if (vehicle.type === 'car') {
                    sizeMultiplier = 1.423; // 10% smaller than current (1.581 * 0.90 = 1.423)
                } else if (vehicle.type === 'bus') {
                    sizeMultiplier = 2.226; // 10% bigger than current (2.024 * 1.10 = 2.226)
                } else if (vehicle.type === 'truck') {
                    sizeMultiplier = 1.76; // 60% bigger than base (1.1 * 1.6 = 1.76)
                }
                
                const vehicleSize = this.TILE_SIZE * sizeMultiplier;
                this.ctx.drawImage(sprite, -vehicleSize / 2, -vehicleSize / 2, vehicleSize, vehicleSize);
                this.ctx.restore();
            } else {
                // Fallback if sprite isn't loaded
                const x = vehicle.x * this.TILE_SIZE + 5;
                const y = vehicle.y * this.TILE_SIZE + 10;
                
                switch(vehicle.type) {
                    case 'car':
                        this.ctx.fillStyle = '#dc2626';
                        break;
                    case 'bus':
                        this.ctx.fillStyle = '#ea580c';
                        break;
                    case 'truck':
                        this.ctx.fillStyle = '#1d4ed8';
                        break;
                }
                
                this.ctx.fillRect(x, y, this.TILE_SIZE - 10, this.TILE_SIZE - 20);
                
                // Direction indicator
                this.ctx.fillStyle = '#ffffff';
                if (vehicle.direction > 0) {
                    this.ctx.fillRect(x + this.TILE_SIZE - 20, y + 5, 5, 10);
                } else {
                    this.ctx.fillRect(x, y + 5, 5, 10);
                }
            }
        });
    }

    renderPlayer() {
        const sprite = this.sprites.turtle;
        if (sprite) {
            const x = this.player.x * this.TILE_SIZE;
            const y = this.player.y * this.TILE_SIZE;
            
            this.ctx.save();
            this.ctx.translate(x + this.TILE_SIZE / 2, y + this.TILE_SIZE / 2);
            
            // Rotate turtle based on direction
            switch(this.player.direction) {
                case 'up':
                    this.ctx.rotate(0);
                    break;
                case 'down':
                    this.ctx.rotate(Math.PI);
                    break;
                case 'left':
                    this.ctx.rotate(-Math.PI / 2);
                    break;
                case 'right':
                    this.ctx.rotate(Math.PI / 2);
                    break;
            }
            
            this.ctx.drawImage(sprite, -this.TILE_SIZE / 2, -this.TILE_SIZE / 2, this.TILE_SIZE, this.TILE_SIZE);
            this.ctx.restore();
        } else {
            // Fallback if sprite isn't loaded
            const x = this.player.x * this.TILE_SIZE + 10;
            const y = this.player.y * this.TILE_SIZE + 10;
            
            this.ctx.fillStyle = '#22c55e';
            this.ctx.fillRect(x, y, this.TILE_SIZE - 20, this.TILE_SIZE - 20);
            
            // Draw direction indicator
            this.ctx.fillStyle = '#15803d';
            switch(this.player.direction) {
                case 'up':
                    this.ctx.fillRect(x + 10, y, 10, 5);
                    break;
                case 'down':
                    this.ctx.fillRect(x + 10, y + 25, 10, 5);
                    break;
                case 'left':
                    this.ctx.fillRect(x, y + 10, 5, 10);
                    break;
                case 'right':
                    this.ctx.fillRect(x + 25, y + 10, 5, 10);
                    break;
            }
        }
    }

    renderHomes() {
        const homeWidth = this.GRID_WIDTH / 5;
        
        for (let i = 0; i < 5; i++) {
            const x = i * homeWidth * this.TILE_SIZE;
            const y = 0;
            const width = homeWidth * this.TILE_SIZE;
            
            if (this.sprites.nest) {
                // Always draw nest sprite for both empty and filled homes
                const nestSize = Math.min(width - 6, this.TILE_SIZE - 6);
                const nestX = x + (width - nestSize) / 2;
                const nestY = y + (this.TILE_SIZE - nestSize) / 2;
                
                this.ctx.save();
                
                if (this.homes[i]) {
                    // Filled home - normal nest appearance
                    this.ctx.globalAlpha = 1.0;
                } else {
                    // Empty home - make nest more visible but still ghosted
                    this.ctx.globalAlpha = 0.7;
                    this.ctx.filter = 'grayscale(80%) brightness(0.8)';
                }
                
                this.ctx.drawImage(this.sprites.nest, nestX, nestY, nestSize, nestSize);
                this.ctx.restore();
            } else {
                // Fallback if nest sprite isn't loaded
                this.ctx.fillStyle = this.homes[i] ? '#166534' : '#065f46';
                this.ctx.fillRect(x, y, width, this.TILE_SIZE);
                
                this.ctx.strokeStyle = '#fbbf24';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(x, y, width, this.TILE_SIZE);
                
                if (!this.homes[i]) {
                    this.ctx.fillStyle = '#fbbf24';
                    this.ctx.font = '16px Inter';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText('HOME', x + width / 2, y + this.TILE_SIZE / 2 + 6);
                }
            }
        }
    }

    renderMessage() {
        // Death flash effect
        if (this.deathFlash) {
            this.ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.GAME_WIDTH, this.GAME_HEIGHT);
        }
        
        if (this.message) {
            // Draw semi-transparent overlay
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.GAME_WIDTH, this.GAME_HEIGHT);
            
            // Draw message
            this.ctx.fillStyle = '#fbbf24';
            this.ctx.font = 'bold 48px Inter';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.message, this.GAME_WIDTH / 2, this.GAME_HEIGHT / 2);
            
            // Add glow effect
            this.ctx.shadowColor = '#fbbf24';
            this.ctx.shadowBlur = 10;
            this.ctx.fillText(this.message, this.GAME_WIDTH / 2, this.GAME_HEIGHT / 2);
            this.ctx.shadowBlur = 0;
        }
    }

    gameLoop(currentTime) {
        if (!this.gameRunning) return;
        
        const now = performance.now();
        const deltaTime = Math.min(now - this.lastTime, 50); // Cap delta to prevent large jumps
        this.lastTime = now;
        
        // Fixed timestep update - ensures consistent game speed regardless of frame rate
        this.updateFixed(deltaTime);
        this.render();
        
        // Continue the loop
        this.animationFrameId = requestAnimationFrame((time) => this.gameLoop(time));
    }

    updateFixed(deltaTime) {
        // Update game logic with time-based scaling to maintain consistent speed
        // Convert deltaTime from milliseconds to seconds for frame-rate independent movement
        const deltaSeconds = deltaTime / 1000;
        
        this.updateVehicles(deltaSeconds);
        this.updatePlatforms(deltaSeconds);
        this.updatePlayerOnPlatform();
        this.checkCollisions();
        
        if (this.enableDeFiTheme) {
            this.updateScrollingText(deltaSeconds);
        }
    }

    gameOver() {
        this.gameRunning = false;
        
        // Clean up animation frame
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        // Stop background sounds when game ends (but keep background music playing)
        this.stopBackgroundSounds();
        
        // Stop anti-throttling timers
        this.stopActivityTimer();
        this.stopContinuousActivityTimer();
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        document.getElementById('finalScore').textContent = `Final Score: ${this.score}`;
        document.getElementById('finalLevel').textContent = `Level Reached: ${this.level}`;
        document.getElementById('gameOverScreen').style.display = 'block';
        
        console.log('Game over!');
    }

    // DeFi Theme System Methods
    updateScrollingText(deltaSeconds) {
        // Update scrolling text animation for road lanes
        this.scrollingTextOffset += deltaSeconds * 60; // Base scroll speed
        if (this.scrollingTextOffset > 300) { // Reset when text has scrolled off screen
            this.scrollingTextOffset = 0;
        }
    }

    renderDeFiLabels() {
        this.ctx.save();
        
        // Render road lane scrolling text
        this.renderRoadLaneLabels();
        
        // Render static grass area labels
        this.renderGrassAreaLabels();
        
        // Render water area labels
        this.renderWaterAreaLabels();
        
        this.ctx.restore();
    }

    renderRoadLaneLabels() {
        // Static lane labels at the edges - much cleaner
        const roadLanes = [
            { row: 7, text: "ETH", color: "#627EEA" },
            { row: 8, text: "POLYGON", color: "#8247E5" },
            { row: 9, text: "ARBITRUM", color: "#28A0F0" },
            { row: 10, text: "OPTIMISM", color: "#FF0420" }
        ];

        this.ctx.font = 'bold 12px Inter';
        this.ctx.textAlign = 'left';
        
        roadLanes.forEach(lane => {
            const y = lane.row * this.TILE_SIZE + (this.TILE_SIZE / 2) + 4;
            const x = 10; // Left edge positioning
            
            // Semi-transparent background
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            const textWidth = this.ctx.measureText(lane.text).width;
            this.ctx.fillRect(x - 4, y - 10, textWidth + 8, 16);
            
            // Text
            this.ctx.fillStyle = lane.color;
            this.ctx.fillText(lane.text, x, y);
        });
    }

    renderGrassAreaLabels() {
        const grassLabels = [
            { row: 0, text: "DEFI ZONE", color: "#00D4AA" },
            { row: 11, text: "LAUNCH PAD", color: "#16A34A" }
        ];

        this.ctx.font = 'bold 13px Inter';
        this.ctx.textAlign = 'center';
        
        grassLabels.forEach(label => {
            const x = this.GAME_WIDTH / 2;
            const y = label.row * this.TILE_SIZE + (this.TILE_SIZE / 2);
            
            // Subtle background
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            const textWidth = this.ctx.measureText(label.text).width;
            this.ctx.fillRect(x - textWidth/2 - 8, y - 8, textWidth + 16, 16);
            
            // Text with subtle shadow
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillText(label.text, x + 1, y + 1);
            
            this.ctx.fillStyle = label.color;
            this.ctx.fillText(label.text, x, y);
        });
    }

    renderWaterAreaLabels() {
        // Single "LIQUIDITY POOLS" label - much cleaner
        this.ctx.font = 'bold 14px Inter';
        this.ctx.textAlign = 'center';
        
        const poolsX = this.GAME_WIDTH / 2;
        const poolsY = 3.5 * this.TILE_SIZE; // Middle of water area
        
        // Subtle background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        const poolsWidth = this.ctx.measureText("LIQUIDITY POOLS").width;
        this.ctx.fillRect(poolsX - poolsWidth/2 - 10, poolsY - 8, poolsWidth + 20, 16);
        
        // Text with subtle shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillText("LIQUIDITY POOLS", poolsX + 1, poolsY + 1);
        
        this.ctx.fillStyle = "#06B6D4";
        this.ctx.fillText("LIQUIDITY POOLS", poolsX, poolsY);
        
        // No individual platform labels - too cluttered
    }

}

let game;

window.addEventListener('load', () => {
    console.log('Window load event fired');
    try {
        game = new TurtleGame();
        console.log('TurtleGame constructor called');
    } catch (error) {
        console.error('Error creating TurtleGame:', error);
        // Show error to user
        document.body.innerHTML += '<div style="position: fixed; top: 10px; left: 10px; background: red; color: white; padding: 10px; z-index: 9999;">Game Init Error: ' + error.message + '</div>';
    }
});

// Also set up button handlers immediately when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Set up button handlers even before game is fully initialized
    setupGlobalButtonHandlers();
});

function setupGlobalButtonHandlers() {
    const startGameBtn = document.getElementById('startGameBtn');
    const playAgainBtn = document.getElementById('playAgainBtn');

    // Prevent rapid double-taps
    let buttonClickInProgress = false;

    // Function to handle start game with proper iOS compatibility
    const handleStartGame = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Prevent rapid double-taps
        if (buttonClickInProgress) return;
        buttonClickInProgress = true;
        
        if (game && game.spritesLoaded) {
            // Try to start background music on button interaction
            game.tryStartBackgroundMusic();
            game.startGame();
        } else {
            console.log('Game not ready yet');
        }
        
        // Reset button click flag after short delay
        setTimeout(() => {
            buttonClickInProgress = false;
        }, 300);
    };

    // Add multiple event types for maximum iOS compatibility
    if (startGameBtn) {
        // Standard click event
        startGameBtn.addEventListener('click', handleStartGame, { passive: false });
        
        // Touch events for iOS
        startGameBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            // Add visual feedback
            startGameBtn.style.transform = 'scale(0.98)';
            startGameBtn.style.opacity = '0.8';
        }, { passive: false });
        
        startGameBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Remove visual feedback
            startGameBtn.style.transform = '';
            startGameBtn.style.opacity = '';
            
            // Handle the start game action
            handleStartGame(e);
        }, { passive: false });
        
        startGameBtn.addEventListener('touchcancel', (e) => {
            // Remove visual feedback if touch is cancelled
            startGameBtn.style.transform = '';
            startGameBtn.style.opacity = '';
        }, { passive: false });
    }

    if (playAgainBtn) {
        // Standard click event
        playAgainBtn.addEventListener('click', handleStartGame, { passive: false });
        
        // Touch events for iOS
        playAgainBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            // Add visual feedback
            playAgainBtn.style.transform = 'scale(0.98)';
            playAgainBtn.style.opacity = '0.8';
        }, { passive: false });
        
        playAgainBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Remove visual feedback
            playAgainBtn.style.transform = '';
            playAgainBtn.style.opacity = '';
            
            // Handle the start game action
            handleStartGame(e);
        }, { passive: false });
        
        playAgainBtn.addEventListener('touchcancel', (e) => {
            // Remove visual feedback if touch is cancelled
            playAgainBtn.style.transform = '';
            playAgainBtn.style.opacity = '';
        }, { passive: false });
    }
}