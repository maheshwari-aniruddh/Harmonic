// Jam Session: use page host so it works on same machine (localhost) or from another (host IP)
const JAM_HOST = (typeof window !== 'undefined' && window.location && window.location.hostname) ? window.location.hostname : 'localhost';
const JAM_SESSION_WS_URL = 'ws://' + JAM_HOST + ':8502';
const JAM_SESSION_HTTP_URL = 'http://' + JAM_HOST + ':8502';

// Predefined Songs for Practice Mode
const pianoSongs = {
    'twinkle': [
        { note: 'C', octave: 4, timing: 0 },
        { note: 'C', octave: 4, timing: 500 },
        { note: 'G', octave: 4, timing: 1000 },
        { note: 'G', octave: 4, timing: 1500 },
        { note: 'A', octave: 4, timing: 2000 },
        { note: 'A', octave: 4, timing: 2500 },
        { note: 'G', octave: 4, timing: 3000 },
        { note: 'F', octave: 4, timing: 3500 },
        { note: 'F', octave: 4, timing: 4000 },
        { note: 'E', octave: 4, timing: 4500 },
        { note: 'E', octave: 4, timing: 5000 },
        { note: 'D', octave: 4, timing: 5500 },
        { note: 'D', octave: 4, timing: 6000 },
        { note: 'C', octave: 4, timing: 6500 }
    ],
    'happy': [
        { note: 'C', octave: 4, timing: 0 },
        { note: 'C', octave: 4, timing: 200 },
        { note: 'D', octave: 4, timing: 600 },
        { note: 'C', octave: 4, timing: 1000 },
        { note: 'F', octave: 4, timing: 1400 },
        { note: 'E', octave: 4, timing: 2000 },
        { note: 'C', octave: 4, timing: 2600 },
        { note: 'C', octave: 4, timing: 3000 },
        { note: 'D', octave: 4, timing: 3400 },
        { note: 'C', octave: 4, timing: 3800 },
        { note: 'G', octave: 4, timing: 4200 },
        { note: 'F', octave: 4, timing: 4800 }
    ],
    'mary': [
        { note: 'E', octave: 4, timing: 0 },
        { note: 'D', octave: 4, timing: 300 },
        { note: 'C', octave: 4, timing: 600 },
        { note: 'D', octave: 4, timing: 900 },
        { note: 'E', octave: 4, timing: 1200 },
        { note: 'E', octave: 4, timing: 1500 },
        { note: 'E', octave: 4, timing: 1800 },
        { note: 'D', octave: 4, timing: 2100 },
        { note: 'D', octave: 4, timing: 2400 },
        { note: 'D', octave: 4, timing: 2700 },
        { note: 'E', octave: 4, timing: 3000 },
        { note: 'G', octave: 4, timing: 3300 },
        { note: 'G', octave: 4, timing: 3600 }
    ],
    'fur-elise': [
        { note: 'E', octave: 5, timing: 0 },
        { note: 'D#', octave: 5, timing: 200 },
        { note: 'E', octave: 5, timing: 400 },
        { note: 'D#', octave: 5, timing: 600 },
        { note: 'E', octave: 5, timing: 800 },
        { note: 'B', octave: 4, timing: 1000 },
        { note: 'D', octave: 5, timing: 1200 },
        { note: 'C', octave: 5, timing: 1400 },
        { note: 'A', octave: 4, timing: 1600 }
    ],
    'scale': [
        { note: 'C', octave: 4, timing: 0 },
        { note: 'D', octave: 4, timing: 300 },
        { note: 'E', octave: 4, timing: 600 },
        { note: 'F', octave: 4, timing: 900 },
        { note: 'G', octave: 4, timing: 1200 },
        { note: 'A', octave: 4, timing: 1500 },
        { note: 'B', octave: 4, timing: 1800 },
        { note: 'C', octave: 5, timing: 2100 }
    ],
    'shape-of-you': [
        // A C D C A A C C
        { note: 'A', octave: 4, timing: 0 },
        { note: 'C', octave: 4, timing: 400 },
        { note: 'D', octave: 4, timing: 800 },
        { note: 'C', octave: 4, timing: 1200 },
        { note: 'A', octave: 4, timing: 1600 },
        { note: 'A', octave: 4, timing: 2000 },
        { note: 'C', octave: 4, timing: 2400 },
        { note: 'C', octave: 4, timing: 2800 },
        // A C D D C A A C G
        { note: 'A', octave: 4, timing: 3200 },
        { note: 'C', octave: 4, timing: 3600 },
        { note: 'D', octave: 4, timing: 4000 },
        { note: 'D', octave: 4, timing: 4400 },
        { note: 'C', octave: 4, timing: 4800 },
        { note: 'A', octave: 4, timing: 5200 },
        { note: 'A', octave: 4, timing: 5600 },
        { note: 'C', octave: 4, timing: 6000 },
        { note: 'G', octave: 4, timing: 6400 },
        // A C D D C A A C G
        { note: 'A', octave: 4, timing: 6800 },
        { note: 'C', octave: 4, timing: 7200 },
        { note: 'D', octave: 4, timing: 7600 },
        { note: 'D', octave: 4, timing: 8000 },
        { note: 'C', octave: 4, timing: 8400 },
        { note: 'A', octave: 4, timing: 8800 },
        { note: 'A', octave: 4, timing: 9200 },
        { note: 'C', octave: 4, timing: 9600 },
        { note: 'G', octave: 4, timing: 10000 },
        // E D C A C A G
        { note: 'E', octave: 4, timing: 10400 },
        { note: 'D', octave: 4, timing: 10800 },
        { note: 'C', octave: 4, timing: 11200 },
        { note: 'A', octave: 4, timing: 11600 },
        { note: 'C', octave: 4, timing: 12000 },
        { note: 'A', octave: 4, timing: 12400 },
        { note: 'G', octave: 4, timing: 12800 }
    ]
};

// Particle System for Background
class ParticleSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.setupCanvas();
        this.createParticles();
        this.animate();
    }

    setupCanvas() {
        const resizeCanvas = () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
    }

    createParticles() {
        const particleCount = Math.floor((this.canvas.width * this.canvas.height) / 20000);
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2.5 + 1.5,
                opacity: Math.random() * 0.4 + 0.3
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;

            if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;

            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            const gradient = this.ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, particle.size
            );
            gradient.addColorStop(0, `rgba(102, 126, 234, ${particle.opacity * 0.8})`);
            gradient.addColorStop(1, `rgba(102, 126, 234, ${particle.opacity * 0.2})`);
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
        });

        // Draw connections
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 150) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.strokeStyle = `rgba(102, 126, 234, ${(1 - distance / 150) * 0.3})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.stroke();
                }
            }
        }

        requestAnimationFrame(() => this.animate());
    }
}

// Initialize particle system
const particleSystem = new ParticleSystem('particles-canvas');

// Cursor Trail System
class CursorTrail {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.trail = [];
        this.maxTrailLength = 20;
        this.setupCanvas();
        this.animate();

        document.addEventListener('mousemove', (e) => this.addPoint(e));
    }

    setupCanvas() {
        const resizeCanvas = () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
    }

    addPoint(e) {
        this.trail.push({
            x: e.clientX,
            y: e.clientY,
            time: Date.now()
        });

        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const now = Date.now();
        this.trail = this.trail.filter(point => now - point.time < 500);

        for (let i = 0; i < this.trail.length; i++) {
            const point = this.trail[i];
            const age = now - point.time;
            const opacity = 1 - (age / 500);
            const size = 6 + (25 * (1 - opacity));

            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, size, 0, Math.PI * 2);

            const gradient = this.ctx.createRadialGradient(
                point.x, point.y, 0,
                point.x, point.y, size
            );
            gradient.addColorStop(0, `rgba(102, 126, 234, ${opacity * 1})`);
            gradient.addColorStop(0.5, `rgba(118, 75, 162, ${opacity * 0.6})`);
            gradient.addColorStop(1, `rgba(240, 147, 251, ${opacity * 0.2})`);

            this.ctx.fillStyle = gradient;
            this.ctx.fill();

            if (i > 0) {
                const prevPoint = this.trail[i - 1];
                this.ctx.beginPath();
                this.ctx.moveTo(prevPoint.x, prevPoint.y);
                this.ctx.lineTo(point.x, point.y);
                this.ctx.strokeStyle = `rgba(102, 126, 234, ${opacity * 0.6})`;
                this.ctx.lineWidth = 3;
                this.ctx.lineCap = 'round';
                this.ctx.stroke();
            }
        }

        requestAnimationFrame(() => this.animate());
    }
}

// Initialize cursor trail
const cursorTrail = new CursorTrail('cursor-trail');

// --- Jam Session (WebSocket multiplayer) ---
let jamSessionManager = null;

class JamSessionManager {
    constructor() {
        this.ws = null;
        this.roomId = null;
        this.playerId = null;
        this.instrument = null;
        this.onRemoteNote = null; // (payload) => {}
    }

    get connected() {
        return this.ws && this.ws.readyState === WebSocket.OPEN;
    }

    connect(roomId, playerId, instrument) {
        this.disconnect();
        roomId = (roomId || '').trim().toUpperCase();
        playerId = (playerId || '').trim() || 'player_' + Math.random().toString(36).slice(2, 8);
        const base = JAM_SESSION_WS_URL.replace(/\/$/, '');
        const wsUrl = `${base}/ws/${encodeURIComponent(roomId)}/${encodeURIComponent(playerId)}`;
        this.ws = new WebSocket(wsUrl);
        this.roomId = roomId;
        this.playerId = playerId;
        this.instrument = instrument || 'piano';

        this.ws.onopen = () => {
            console.log('[Jam] Connected to room', roomId, 'as', playerId);
        };
        this.ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                if (msg.type === 'note' && msg.player_id !== this.playerId && this.onRemoteNote) {
                    this.onRemoteNote(msg);
                }
            } catch (e) {
                console.warn('[Jam] Invalid message', e);
            }
        };
        this.ws.onclose = () => {
            console.log('[Jam] Disconnected');
        };
        this.ws.onerror = (err) => {
            console.warn('[Jam] WebSocket error', err);
        };
    }

    sendNote(note, velocity = 0.8) {
        if (!this.connected || !this.roomId || !this.playerId) return;
        const payload = {
            type: 'note',
            room_id: this.roomId,
            player_id: this.playerId,
            instrument: this.instrument,
            note: note,
            velocity: velocity,
            ts: Date.now() / 1000
        };
        this.ws.send(JSON.stringify(payload));
    }

    disconnect() {
        if (this.ws) {
            try { this.ws.close(); } catch (e) { }
            this.ws = null;
        }
        this.roomId = null;
        this.playerId = null;
    }
}

// Play a short tone for remote jam notes (no sample files)
function playRemoteNoteSound(note, instrument, velocity) {
    try {
        const ctx = window.jamAudioContext || (window.jamAudioContext = new (window.AudioContext || window.webkitAudioContext)());
        const gain = (velocity || 0.8) * 0.15;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.connect(g);
        g.connect(ctx.destination);
        if (instrument === 'piano') {
            const freqMap = { C: 262, D: 294, E: 330, F: 349, G: 392, A: 440, B: 494 };
            const letter = (note || 'C').toString().replace(/\d/g, '').charAt(0).toUpperCase();
            const oct = parseInt((note || '4').toString().replace(/\D/g, ''), 10) || 4;
            let f = freqMap[letter] || 262;
            f *= Math.pow(2, oct - 4);
            osc.frequency.value = f;
            osc.type = 'sine';
        } else {
            osc.frequency.value = 150 + Math.random() * 100;
            osc.type = 'square';
        }
        g.gain.setValueAtTime(gain, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
        console.warn('[Jam] Remote sound failed', e);
    }
}

// Page Navigation
let currentInstrument = null;
let currentMode = null;

const pages = {
    landing: document.getElementById('landing-page') || document.getElementById('instruments-page'),
    'instruments-page': document.getElementById('instruments-page'),
    'camera-setup': document.getElementById('camera-setup'),
    'practice-question': document.getElementById('practice-question'),
    'piano-composer': document.getElementById('piano-composer'),
    'piano-practice': document.getElementById('piano-practice'),
    'drums-composer': document.getElementById('drums-composer'),
    'drums-practice': document.getElementById('drums-practice'),
    'jam-setup': document.getElementById('jam-setup'),
    'jam-piano': document.getElementById('jam-piano'),
    'jam-drums': document.getElementById('jam-drums')
};

function showPage(pageId) {
    Object.values(pages).forEach(page => {
        if (page) page.classList.remove('active');
    });
    if (pages[pageId]) {
        pages[pageId].classList.add('active');
    }
}

function goBack() {
    showPage('landing');
    currentInstrument = null;
    currentMode = null;
}

function goToLanding() {
    if (pianoNoteManager) pianoNoteManager.stop();
    if (drumsNoteManager) drumsNoteManager.stop();
    if (pianoVideoStream) {
        pianoVideoStream.getTracks().forEach(track => track.stop());
        pianoVideoStream = null;
    }
    if (drumsVideoStream) {
        drumsVideoStream.getTracks().forEach(track => track.stop());
        drumsVideoStream = null;
    }
    if (heroCameraStream) {
        heroCameraStream.getTracks().forEach(track => track.stop());
        heroCameraStream = null;
    }
    if (setupCameraStream) {
        setupCameraStream.getTracks().forEach(track => track.stop());
        setupCameraStream = null;
    }
    const cameraPreview = document.getElementById('hero-camera-preview');
    if (cameraPreview) cameraPreview.classList.remove('active');
    const logoContainer = document.querySelector('.logo-container');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (logoContainer) logoContainer.classList.remove('hidden');
    if (heroSubtitle) heroSubtitle.classList.remove('hidden');
    showPage('landing');
}

// Instrument Selection - Go to Camera Setup Screen
function setupInstrumentButtons() {
    const buttons = document.querySelectorAll('.instrument-btn');
    console.log('Found instrument buttons:', buttons.length);

    buttons.forEach(btn => {
        console.log('Setting up button:', btn.dataset.instrument, 'href:', btn.getAttribute('href'));

        // If button has href, let it navigate naturally (don't intercept)
        if (btn.getAttribute('href')) {
            console.log('Button has href, allowing natural navigation');
            return; // Skip adding click handler - let <a> tag work normally
        }

        // Only add click handler for buttons WITHOUT href (old behavior)
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Button clicked:', btn.dataset.instrument);
            currentInstrument = btn.dataset.instrument;
            showCameraSetupPage();
        });

        // Ensure button is clickable
        btn.style.pointerEvents = 'auto';
        btn.style.cursor = 'pointer';
        btn.style.position = 'relative';
        btn.style.zIndex = '10';
    });
}

// Setup buttons when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupInstrumentButtons);
} else {
    setupInstrumentButtons();
}

let setupCameraStream = null;

function goBackToLanding() {
    if (setupCameraStream) {
        setupCameraStream.getTracks().forEach(track => track.stop());
        setupCameraStream = null;
    }
    showPage('landing');
    currentInstrument = null;
}

function showCameraSetupPage() {
    console.log('showCameraSetupPage called, instrument:', currentInstrument);

    const instrumentName = currentInstrument === 'piano' ? 'Piano' : 'Drums';
    const titleElement = document.getElementById('camera-instrument-name');
    if (titleElement) {
        titleElement.textContent = `${instrumentName} - Camera Setup`;
    }

    // Show the page first
    showPage('camera-setup');

    // Wait for page to be visible, then initialize camera
    setTimeout(() => {
        const video = document.getElementById('setup-camera-video');
        const statusIndicator = document.getElementById('camera-status-indicator');
        const container = document.querySelector('.camera-embed-container');

        if (!video) {
            console.error('Video element not found!');
            return;
        }

        console.log('Video element found:', video);

        // Make video immediately visible with placeholder
        video.style.cssText = `
            display: block !important;
            opacity: 1 !important;
            visibility: visible !important;
            width: 90% !important;
            max-width: 1200px !important;
            min-height: 500px !important;
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3)) !important;
            border: 4px solid rgba(102, 126, 234, 0.8) !important;
            border-radius: 24px !important;
            position: relative !important;
            z-index: 10 !important;
            margin: 2rem auto !important;
        `;

        // Stop any existing stream first
        if (setupCameraStream) {
            setupCameraStream.getTracks().forEach(track => track.stop());
            setupCameraStream = null;
        }

        // Clear previous video source
        if (video.srcObject) {
            video.srcObject = null;
        }

        if (statusIndicator) {
            statusIndicator.innerHTML = '<div class="status-dot"></div><span>Requesting Camera Access...</span>';
            statusIndicator.style.display = 'flex';
        }

        navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'user'
            }
        })
            .then(stream => {
                console.log('Camera stream obtained:', stream);
                setupCameraStream = stream;

                // Set video source
                video.srcObject = stream;

                // Make sure video plays
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        console.log('Camera video playing successfully');
                        video.style.background = '#000';
                    }).catch(err => {
                        console.error('Video play error:', err);
                    });
                }

                // Video loaded event
                video.onloadedmetadata = () => {
                    console.log('Video metadata loaded, dimensions:', video.videoWidth, 'x', video.videoHeight);
                    video.style.background = '#000';
                    video.play().catch(err => console.error('Play error:', err));
                };

                video.onplaying = () => {
                    console.log('Video is now playing');
                    const placeholder = document.getElementById('video-placeholder');
                    if (placeholder) {
                        placeholder.style.display = 'none';
                    }
                    if (statusIndicator) {
                        statusIndicator.innerHTML = '<div class="status-dot"></div><span>Camera Active</span>';
                        statusIndicator.style.background = 'rgba(0, 255, 0, 0.2)';
                        statusIndicator.style.borderColor = 'rgba(0, 255, 0, 0.4)';
                    }
                    video.style.background = '#000';
                };

                if (statusIndicator) {
                    statusIndicator.innerHTML = '<div class="status-dot"></div><span>Camera Active</span>';
                    statusIndicator.style.background = 'rgba(0, 255, 0, 0.2)';
                    statusIndicator.style.borderColor = 'rgba(0, 255, 0, 0.4)';
                }
            })
            .catch(err => {
                console.error('Error accessing camera:', err);
                if (statusIndicator) {
                    statusIndicator.innerHTML = '<div class="status-dot error"></div><span>Camera Error - Click to allow camera access</span>';
                    statusIndicator.style.background = 'rgba(255, 0, 0, 0.2)';
                    statusIndicator.style.borderColor = 'rgba(255, 0, 0, 0.4)';
                }

                // Show error placeholder
                video.style.background = 'linear-gradient(135deg, rgba(255, 0, 0, 0.2), rgba(255, 107, 107, 0.2))';
                video.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: white; font-size: 1.5rem;">Camera access denied. Please allow camera permissions.</div>';
            });

        // Setup mode buttons after a delay to ensure they exist
        setTimeout(() => {
            const composerBtn = document.getElementById('composer-mode-btn');
            const practiceBtn = document.getElementById('practice-mode-btn');

            if (composerBtn) {
                composerBtn.onclick = () => {
                    if (setupCameraStream) {
                        setupCameraStream.getTracks().forEach(track => track.stop());
                        setupCameraStream = null;
                    }
                    if (currentInstrument === 'piano') {
                        initPianoComposer();
                        showPage('piano-composer');
                    } else {
                        initDrumsComposer();
                        showPage('drums-composer');
                    }
                };
            }

            if (practiceBtn) {
                practiceBtn.onclick = () => {
                    if (currentInstrument === 'piano') {
                        showPage('piano-practice');
                        initPianoPractice();
                    } else {
                        initDrumsPractice();
                        showPage('drums-practice');
                        // Transfer camera stream
                        const practiceVideo = document.getElementById('drums-video');
                        if (setupCameraStream && practiceVideo) {
                            practiceVideo.srcObject = setupCameraStream;
                            setupCameraStream = null;
                        }
                    }
                };
            }
        }, 300);
    }, 200);
}


let heroCameraStream = null;

function showHeroCameraPreview() {
    const cameraPreview = document.getElementById('hero-camera-preview');
    const heroVideo = document.getElementById('hero-camera-video');
    const logoContainer = document.querySelector('.logo-container');
    const heroSubtitle = document.querySelector('.hero-subtitle');

    // Hide hero content
    if (logoContainer) logoContainer.classList.add('hidden');
    if (heroSubtitle) heroSubtitle.classList.add('hidden');

    // Request camera access
    navigator.mediaDevices.getUserMedia({
        video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
        }
    })
        .then(stream => {
            heroCameraStream = stream;
            heroVideo.srcObject = stream;
            cameraPreview.classList.add('active');

            // After 2 seconds, proceed to practice question
            setTimeout(() => {
                if (heroCameraStream) {
                    heroCameraStream.getTracks().forEach(track => track.stop());
                    heroCameraStream = null;
                }
                cameraPreview.classList.remove('active');
                if (logoContainer) logoContainer.classList.remove('hidden');
                if (heroSubtitle) heroSubtitle.classList.remove('hidden');
                showPracticeQuestion();
            }, 2500);
        })
        .catch(err => {
            console.error('Error accessing camera:', err);
            // If camera fails, just proceed to mode selection
            setTimeout(() => {
                if (logoContainer) logoContainer.classList.remove('hidden');
                if (heroSubtitle) heroSubtitle.classList.remove('hidden');
                showPage('mode-selection');
            }, 500);
        });
}

// Practice Question Handlers
function showPracticeQuestion() {
    const questionSubtitle = document.getElementById('question-instrument');
    if (questionSubtitle) {
        questionSubtitle.textContent = currentInstrument === 'piano'
            ? 'Practice Piano with camera feedback'
            : 'Practice Drums with camera feedback';
    }
    showPage('practice-question');
}

document.getElementById('practice-yes-btn').addEventListener('click', () => {
    if (currentInstrument === 'piano') {
        initPianoPractice();
        showPage('piano-practice');
    } else {
        initDrumsPractice();
        showPage('drums-practice');
    }
});

document.getElementById('practice-no-btn').addEventListener('click', () => {
    showPage('landing');
    currentInstrument = null;
});

// Piano Setup
const pianoKeys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const blackKeys = ['C#', 'D#', 'F#', 'G#', 'A#'];

function createPianoKeys(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    for (let octave = 0; octave < 2; octave++) {
        pianoKeys.forEach(key => {
            const keyElement = document.createElement('div');
            keyElement.className = `piano-key ${whiteKeys.includes(key) ? 'white' : 'black'}`;
            keyElement.dataset.note = `${key}${octave + 3}`;

            const label = document.createElement('div');
            label.className = 'key-label';
            label.textContent = key;
            keyElement.appendChild(label);

            container.appendChild(keyElement);
        });
    }
}

// Enhanced Piano Note Manager
class PianoNoteManager {
    constructor(canvasId, keysContainerId, isPractice = false) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.keysContainer = document.getElementById(keysContainerId);
        this.isPractice = isPractice;
        this.notes = [];
        this.playing = false;
        this.animationId = null;
        this.keyPositions = {};
        this.tempo = 800;
        this.score = 0;
        this.totalNotes = 0;
        this.hitNotes = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.selectedSong = null;
        this.songNotes = [];
        this.songStartTime = 0;
        this.hitAnimations = [];
        this.hitIndicator = document.getElementById(isPractice ? 'piano-practice-hit-indicator' : 'piano-hit-indicator');
        this.scoreElement = document.getElementById(isPractice ? 'piano-practice-score' : 'piano-score');
        this.notesCountElement = document.getElementById(isPractice ? null : 'piano-notes-count');
        this.accuracyElement = document.getElementById(isPractice ? 'piano-accuracy' : null);
        this.comboElement = document.getElementById(isPractice ? 'piano-combo' : null);

        this.setupCanvas();
        this.calculateKeyPositions();

        if (!isPractice) {
            this.startGeneratingNotes();
        }
    }

    setupCanvas() {
        const resizeCanvas = () => {
            this.canvas.width = this.canvas.offsetWidth;
            this.canvas.height = this.canvas.offsetHeight;
            this.calculateKeyPositions();
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
    }

    calculateKeyPositions() {
        setTimeout(() => {
            this.keysContainer.querySelectorAll('.piano-key').forEach((key) => {
                const rect = key.getBoundingClientRect();
                const containerRect = this.keysContainer.getBoundingClientRect();
                this.keyPositions[key.dataset.note] = {
                    x: rect.left - containerRect.left,
                    width: rect.width,
                    isBlack: key.classList.contains('black')
                };
            });
        }, 100);
    }

    setTempo(tempo) {
        this.tempo = tempo;
        if (this.generationInterval) {
            clearInterval(this.generationInterval);
            this.startGeneratingNotes();
        }
    }

    setSong(songId) {
        if (this.isPractice && pianoSongs[songId]) {
            this.selectedSong = songId;
            this.songNotes = pianoSongs[songId].map(note => ({
                ...note,
                noteKey: `${note.note}${note.octave}`
            }));
            this.currentSheetNotes = null;
        }
    }

    /** Set song from unified API format: notes = [{ t, note, dur }, ...]. */
    setSongNotes(notes, songId) {
        if (!this.isPractice || !notes || !notes.length) return;
        this.selectedSong = songId || 'imported';
        this.currentSheetNotes = notes;
        this.songNotes = notes.map(n => {
            const noteStr = (n.note || '').toString().trim();
            let note = 'C', octave = 4, noteKey = 'C4';
            const match = noteStr.match(/^([A-G]#?b?)(\d+)$/i);
            if (match) {
                note = match[1].replace(/b/i, 'b');
                octave = parseInt(match[2], 10);
                noteKey = note + octave;
            } else if (noteStr.length >= 1) {
                note = noteStr[0].toUpperCase() + (noteStr.slice(1) || '');
                noteKey = noteStr.length > 1 ? noteStr : note + '4';
            }
            return {
                note,
                octave,
                timing: (n.t != null ? n.t : 0) * 1000,
                noteKey
            };
        });
    }

    startGeneratingNotes() {
        if (this.generationInterval) clearInterval(this.generationInterval);

        if (this.isPractice && this.selectedSong && this.songNotes.length > 0) {
            // Use song-based generation
            this.songStartTime = Date.now();
            this.songNotes.forEach(songNote => {
                setTimeout(() => {
                    if (this.playing) {
                        this.addSongNote(songNote);
                    }
                }, songNote.timing);
            });
        } else {
            // Use random generation for composer mode
            this.generationInterval = setInterval(() => {
                if (this.playing) {
                    this.addRandomNote();
                }
            }, this.tempo);
        }
    }

    addSongNote(songNote) {
        const noteKey = songNote.noteKey;
        const noteData = this.keyPositions[noteKey];

        if (noteData) {
            // Position relative to canvas - keyPositions are already relative to keys container
            const canvasRect = this.canvas.getBoundingClientRect();
            const keysRect = this.keysContainer.getBoundingClientRect();
            const x = noteData.x + (keysRect.left - canvasRect.left);

            this.notes.push({
                note: noteKey,
                x: x,
                width: noteData.width,
                y: 0, // Start from top of screen
                speed: 2.5,
                isBlack: noteData.isBlack,
                hit: false,
                opacity: 1,
                glowIntensity: 1
            });
            this.totalNotes++;
            if (this.notesCountElement) {
                this.notesCountElement.textContent = this.totalNotes;
            }
        }
    }

    addRandomNote() {
        const allNotes = Object.keys(this.keyPositions);
        if (allNotes.length === 0) return;

        const randomNote = allNotes[Math.floor(Math.random() * allNotes.length)];
        const noteData = this.keyPositions[randomNote];

        if (noteData) {
            // Position relative to canvas - keyPositions are already relative to keys container
            const canvasRect = this.canvas.getBoundingClientRect();
            const keysRect = this.keysContainer.getBoundingClientRect();
            const x = noteData.x + (keysRect.left - canvasRect.left);

            this.notes.push({
                note: randomNote,
                x: x,
                width: noteData.width,
                y: 0, // Start from top of screen
                speed: 2 + Math.random() * 2,
                isBlack: noteData.isBlack,
                hit: false,
                opacity: 1,
                glowIntensity: 1
            });
            this.totalNotes++;
            if (this.notesCountElement) {
                this.notesCountElement.textContent = this.totalNotes;
            }
        }
    }

    updateScore() {
        if (this.scoreElement) {
            this.scoreElement.textContent = this.score;
        }
        if (this.accuracyElement) {
            const accuracy = this.totalNotes > 0 ? Math.round((this.hitNotes / this.totalNotes) * 100) : 0;
            this.accuracyElement.textContent = accuracy + '%';
        }
        if (this.comboElement) {
            this.comboElement.textContent = this.combo;
            if (this.combo > this.maxCombo) {
                this.maxCombo = this.combo;
            }
        }
    }

    triggerHitEffect() {
        if (this.hitIndicator) {
            this.hitIndicator.classList.add('active');
            setTimeout(() => {
                this.hitIndicator.classList.remove('active');
            }, 500);
        }
    }

    play() {
        this.playing = !this.playing;
        if (this.playing) {
            this.animate();
        } else {
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
            }
        }
        return this.playing;
    }

    animate() {
        if (!this.playing) return;

        // Create gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, 'rgba(67, 67, 67, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const pianoTop = this.canvas.height - 220;

        this.notes.forEach((note) => {
            if (!note.hit) {
                note.y += note.speed;

                const hitThreshold = pianoTop - 2;
                if (note.y + 80 >= hitThreshold) {
                    note.hit = true;
                    note.hitTime = Date.now();
                    this.hitNotes++;
                    this.combo++;
                    this.score += 10 + (this.combo * 2);
                    this.triggerKeyPress(note.note);
                    this.createHitAnimation(note);
                    this.triggerHitEffect();
                    this.updateScore();
                }
            } else {
                const timeSinceHit = Date.now() - note.hitTime;
                note.opacity = Math.max(0, 1 - (timeSinceHit / 400));
                note.y += note.speed * 0.3;
                note.glowIntensity = note.opacity;
            }

            // Draw note with glow effect
            this.ctx.save();

            const alpha = note.hit ? note.opacity * 0.6 : 0.95;
            this.ctx.globalAlpha = alpha;

            const noteHeight = 80;
            const gradient = this.ctx.createLinearGradient(note.x, note.y, note.x, note.y + noteHeight);
            gradient.addColorStop(0, 'rgba(102, 126, 234, 0.95)');
            gradient.addColorStop(0.5, 'rgba(118, 75, 162, 0.9)');
            gradient.addColorStop(1, 'rgba(102, 126, 234, 0.85)');

            // Glow effect
            if (!note.hit) {
                this.ctx.shadowBlur = 20 * note.glowIntensity;
                this.ctx.shadowColor = 'rgba(102, 126, 234, 0.8)';
            }

            this.ctx.fillStyle = gradient;
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            this.ctx.lineWidth = 3;

            this.ctx.beginPath();
            this.ctx.roundRect(note.x, note.y, note.width, noteHeight, 18);
            this.ctx.fill();
            this.ctx.stroke();

            this.ctx.shadowBlur = 0;

            // Draw note label
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 1.5rem "Inter", sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(note.note.replace(/\d/g, ''), note.x + note.width / 2, note.y + noteHeight / 2);

            this.ctx.restore();
        });

        // Draw hit particles
        this.hitAnimations = this.hitAnimations.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= 0.02;
            particle.vy += 0.1; // gravity

            if (particle.life > 0) {
                this.ctx.save();
                this.ctx.globalAlpha = particle.life;
                this.ctx.fillStyle = particle.color;
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = particle.color;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
                return true;
            }
            return false;
        });

        // Remove off-screen notes
        this.notes = this.notes.filter(note => note.y < this.canvas.height + 100 && note.opacity > 0);

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    triggerKeyPress(note) {
        const keyElement = this.keysContainer.querySelector(`[data-note="${note}"]`);
        if (keyElement) {
            keyElement.classList.add('pressed');
            setTimeout(() => {
                keyElement.classList.remove('pressed');
            }, 400);
        }

        // Also trigger visual overlay if in practice mode
        if (this.isPractice) {
            const visualKey = document.querySelector(`#piano-visual-keys [data-note="${note}"]`);
            if (visualKey) {
                visualKey.classList.add('pressed-overlay');
                setTimeout(() => {
                    visualKey.classList.remove('pressed-overlay');
                }, 400);
            }
        }
    }

    createHitAnimation(note) {
        const keyElement = this.keysContainer.querySelector(`[data-note="${note.note}"]`);
        if (keyElement) {
            // Create ripple effect
            const ripple = document.createElement('div');
            ripple.className = 'key-hit-ripple';
            keyElement.style.position = 'relative';
            keyElement.appendChild(ripple);

            // Create glow effect
            const glow = document.createElement('div');
            glow.className = 'key-hit-glow';
            keyElement.appendChild(glow);

            // Add pulse class to key
            keyElement.classList.add('key-hit-pulse');

            // Create particles on canvas
            this.createHitParticles(note);

            setTimeout(() => {
                ripple.remove();
                glow.remove();
                keyElement.classList.remove('key-hit-pulse');
            }, 600);
        }
    }

    createHitParticles(note) {
        const particleCount = 8;
        const centerX = note.x + note.width / 2;
        const pianoTop = this.canvas.height - 220;
        const centerY = pianoTop;

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 3 + Math.random() * 2;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            this.hitAnimations.push({
                x: centerX,
                y: centerY,
                vx: vx,
                vy: vy,
                life: 1.0,
                size: 4 + Math.random() * 4,
                color: note.isBlack ? 'rgba(102, 126, 234, 1)' : 'rgba(118, 75, 162, 1)'
            });
        }
    }

    stop() {
        this.playing = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.generationInterval) {
            clearInterval(this.generationInterval);
        }
        this.notes = [];
        this.combo = 0;
        this.hitAnimations = [];
        this.songStartTime = 0;
    }
}

// Add roundRect polyfill
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height, radius) {
        this.beginPath();
        this.moveTo(x + radius, y);
        this.lineTo(x + width - radius, y);
        this.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.lineTo(x + width, y + height - radius);
        this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.lineTo(x + radius, y + height);
        this.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.lineTo(x, y + radius);
        this.quadraticCurveTo(x, y, x + radius, y);
        this.closePath();
    };
}

let pianoNoteManager = null;
let pianoVideoStream = null;

function initPianoComposer() {
    createPianoKeys('piano-keys');
    pianoNoteManager = new PianoNoteManager('piano-canvas', 'piano-keys', false);

    const playBtn = document.getElementById('piano-play-btn');
    const tempoSlider = document.getElementById('piano-tempo');
    const tempoValue = document.getElementById('piano-tempo-value');

    playBtn.addEventListener('click', () => {
        if (pianoNoteManager) {
            const isPlaying = pianoNoteManager.play();
            playBtn.classList.toggle('playing', isPlaying);
            playBtn.querySelector('.play-icon').textContent = isPlaying ? '⏸' : '▶';
            playBtn.querySelector('.play-text').textContent = isPlaying ? 'Pause' : 'Play';
        }
    });

    tempoSlider.addEventListener('input', (e) => {
        const tempo = parseInt(e.target.value);
        tempoValue.textContent = tempo + 'ms';
        if (pianoNoteManager) {
            pianoNoteManager.setTempo(tempo);
        }
    });
}

function createPianoVisualOverlay(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    for (let octave = 0; octave < 2; octave++) {
        pianoKeys.forEach(key => {
            const keyElement = document.createElement('div');
            keyElement.className = `piano-overlay-key ${whiteKeys.includes(key) ? 'white-overlay' : 'black-overlay'}`;
            keyElement.dataset.note = `${key}${octave + 3}`;
            container.appendChild(keyElement);
        });
    }
}

function initPianoPractice() {
    // Wait a bit for page to be visible
    setTimeout(() => {
        const keysContainer = document.getElementById('piano-practice-keys');
        if (!keysContainer) {
            console.error('Piano keys container not found!');
            return;
        }

        console.log('Creating piano keys...');
        createPianoKeys('piano-practice-keys');
        console.log('Piano keys created');

        pianoNoteManager = new PianoNoteManager('piano-practice-canvas', 'piano-practice-keys', true);

        const video = document.getElementById('piano-video');
        const cameraStatus = document.getElementById('piano-camera-status');

        // Use existing stream from camera setup page if available
        if (setupCameraStream && video) {
            console.log('Using existing camera stream');
            video.srcObject = setupCameraStream;
            video.play().then(() => {
                console.log('Camera video playing in practice mode');
            }).catch(err => {
                console.error('Error playing video:', err);
            });
            if (cameraStatus) cameraStatus.style.display = 'flex';
            pianoVideoStream = setupCameraStream;
            // Don't null setupCameraStream yet, keep it for the video
        } else if (video) {
            console.log('Requesting new camera stream');
            navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                }
            })
                .then(stream => {
                    pianoVideoStream = stream;
                    video.srcObject = stream;
                    video.play().then(() => {
                        console.log('New camera stream playing');
                    });
                    if (cameraStatus) cameraStatus.style.display = 'flex';
                })
                .catch(err => {
                    console.error('Error accessing camera:', err);
                    if (cameraStatus) cameraStatus.style.display = 'none';
                });
        }

        // Ensure video is visible
        if (video) {
            video.style.cssText = `
                display: block !important;
                width: 100% !important;
                height: 100% !important;
                object-fit: cover !important;
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                z-index: 1 !important;
            `;
        }

        if (pianoNoteManager) {
            pianoNoteManager.startGeneratingNotes();
        }

        // Setup play button and tempo controls
        const playBtn = document.getElementById('piano-practice-play-btn');
        const tempoSlider = document.getElementById('piano-practice-tempo');
        const tempoValue = document.getElementById('piano-practice-tempo-value');

        if (playBtn) {
            playBtn.addEventListener('click', () => {
                if (pianoNoteManager) {
                    const isPlaying = pianoNoteManager.play();
                    playBtn.classList.toggle('playing', isPlaying);
                    playBtn.querySelector('.play-icon').textContent = isPlaying ? '⏸' : '▶';
                    playBtn.querySelector('.play-text').textContent = isPlaying ? 'Pause' : 'Play';
                }
            });
        }

        if (tempoSlider && tempoValue) {
            tempoSlider.addEventListener('input', (e) => {
                const tempo = parseInt(e.target.value);
                tempoValue.textContent = tempo + 'ms';
                if (pianoNoteManager) {
                    pianoNoteManager.setTempo(tempo);
                }
            });
        }

        // Setup song selection
        const songSelect = document.getElementById('piano-practice-song-select');
        if (songSelect) {
            songSelect.addEventListener('change', (e) => {
                const songId = e.target.value;
                if (!songId) return;
                if (pianoSongs[songId] && pianoNoteManager) {
                    pianoNoteManager.setSong(songId);
                    updateSheetMusicFromManager(pianoNoteManager);
                    if (pianoNoteManager.playing) {
                        pianoNoteManager.stop();
                        pianoNoteManager.play();
                    }
                    return;
                }
                if (typeof SheetRenderer !== 'undefined' && SheetRenderer.fetchSong && pianoNoteManager) {
                    SheetRenderer.fetchSong(songId, (data) => {
                        if (data && data.notes && pianoNoteManager) {
                            pianoNoteManager.setSongNotes(data.notes, songId);
                            updateSheetMusicFromManager(pianoNoteManager);
                            if (pianoNoteManager.playing) {
                                pianoNoteManager.stop();
                                pianoNoteManager.play();
                            }
                        }
                    });
                }
            });
        }

        // Populate API songs in dropdown
        if (typeof SheetRenderer !== 'undefined' && SheetRenderer.fetchSongList) {
            SheetRenderer.fetchSongList((apiSongs) => {
                if (!apiSongs.length || !songSelect) return;
                apiSongs.forEach(s => {
                    if (songSelect.querySelector('option[value="' + s.id + '"]')) return;
                    const opt = document.createElement('option');
                    opt.value = s.id;
                    opt.textContent = s.label + ' (imported)';
                    songSelect.appendChild(opt);
                });
            });
        }

        // Multiplayer room
        const roomInput = document.getElementById('multiplayer-room-input');
        const joinBtn = document.getElementById('multiplayer-join-btn');
        const createBtn = document.getElementById('multiplayer-create-btn');
        const spectatorBtn = document.getElementById('multiplayer-spectator-btn');
        const multiplayerStatus = document.getElementById('multiplayer-status');
        if (joinBtn && roomInput) {
            joinBtn.addEventListener('click', () => {
                AirJamMultiplayer.joinRoom(roomInput.value, (ok) => {
                    if (multiplayerStatus) multiplayerStatus.textContent = ok ? 'Joined ' + AirJamMultiplayer.roomId : 'Join failed';
                });
            });
        }
        if (createBtn) {
            createBtn.addEventListener('click', () => {
                AirJamMultiplayer.createRoom((ok) => {
                    if (multiplayerStatus) multiplayerStatus.textContent = ok ? 'Room ' + AirJamMultiplayer.roomId : 'Create failed';
                    if (roomInput && AirJamMultiplayer.roomId) roomInput.value = AirJamMultiplayer.roomId;
                });
            });
        }
        if (spectatorBtn) {
            spectatorBtn.addEventListener('click', () => {
                if (AirJamMultiplayer.copySpectatorLink() && multiplayerStatus) {
                    multiplayerStatus.textContent = 'Link copied!';
                    setTimeout(() => { multiplayerStatus.textContent = ''; }, 2000);
                } else if (multiplayerStatus) multiplayerStatus.textContent = 'Join a room first';
            });
        }

        // MP3 upload
        const mp3Input = document.getElementById('mp3-upload-input');
        const mp3Btn = document.getElementById('upload-mp3-btn');
        const mp3Status = document.getElementById('upload-mp3-status');
        if (mp3Btn && mp3Input) {
            mp3Btn.addEventListener('click', () => mp3Input.click());
            mp3Input.addEventListener('change', function () {
                const file = this.files && this.files[0];
                if (!file || !file.name.toLowerCase().endsWith('.mp3')) {
                    if (mp3Status) mp3Status.textContent = 'Choose an MP3 file.';
                    return;
                }
                if (mp3Status) mp3Status.textContent = 'Uploading...';
                const fd = new FormData();
                fd.append('file', file);
                const api = (typeof SheetRenderer !== 'undefined' && SheetRenderer.MUSIC_API) ? SheetRenderer.MUSIC_API : 'http://localhost:8766';
                fetch(api + '/api/upload-mp3', { method: 'POST', body: fd })
                    .then(r => r.json())
                    .then(data => {
                        if (data.error) {
                            if (mp3Status) mp3Status.textContent = 'Error: ' + data.error;
                            return;
                        }
                        if (mp3Status) mp3Status.textContent = 'Imported: ' + (data.note_count || 0) + ' notes';
                        if (songSelect && data.song_id) {
                            let opt = songSelect.querySelector('option[value="' + data.song_id + '"]');
                            if (!opt) {
                                opt = document.createElement('option');
                                opt.value = data.song_id;
                                opt.textContent = (data.song_id || 'imported') + ' (MP3)';
                                songSelect.appendChild(opt);
                            }
                            songSelect.value = data.song_id;
                            if (pianoNoteManager && data.notes) {
                                pianoNoteManager.setSongNotes(data.notes, data.song_id);
                                updateSheetMusicFromManager(pianoNoteManager);
                            }
                        }
                    })
                    .catch(() => { if (mp3Status) mp3Status.textContent = 'Upload failed'; });
            });
        }

        // MIDI upload — with track analysis & piano extraction
        const midiInput = document.getElementById('midi-upload-input');
        const midiBtn = document.getElementById('upload-midi-btn');
        const midiStatus = document.getElementById('upload-midi-status');
        const musicApi = (typeof SheetRenderer !== 'undefined' && SheetRenderer.MUSIC_API) ? SheetRenderer.MUSIC_API : 'http://localhost:8766';
        const _tpOverlay = document.getElementById('midiTrackPickerOverlay');
        const _tpList = document.getElementById('midiTrackList');
        const _tpCancel = document.getElementById('midiTrackPickerCancel');

        function _midiLoadNotes(data) {
            if (midiStatus) midiStatus.textContent = 'Loaded: ' + (data.note_count || 0) + ' notes';
            if (songSelect && data.song_id) {
                let opt = songSelect.querySelector('option[value="' + data.song_id + '"]');
                if (!opt) {
                    opt = document.createElement('option');
                    opt.value = data.song_id;
                    opt.textContent = (data.song_id || 'imported').replace(/_/g, ' ') + ' (imported)';
                    songSelect.appendChild(opt);
                }
                songSelect.value = data.song_id;
                if (pianoNoteManager && data.notes) {
                    pianoNoteManager.setSongNotes(data.notes, data.song_id);
                    updateSheetMusicFromManager(pianoNoteManager);
                }
            }
        }

        function _extractTrack(midiId, opts) {
            if (_tpOverlay) _tpOverlay.style.display = 'none';
            if (midiStatus) midiStatus.textContent = 'Extracting...';
            fetch(musicApi + '/api/extract-track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(Object.assign({ midi_id: midiId }, opts)),
            })
                .then(function (r) { return r.json(); })
                .then(function (data) {
                    if (!data.success) { if (midiStatus) midiStatus.textContent = 'Error: ' + (data.error || ''); return; }
                    _midiLoadNotes(data);
                })
                .catch(function () { if (midiStatus) midiStatus.textContent = 'Extract failed'; });
        }

        function _showTrackPicker(midiId, tracks) {
            if (!_tpOverlay || !_tpList) return;
            _tpList.innerHTML = '';

            var hasPiano = tracks.some(function (t) { return t.family === 'piano' && !t.is_drum; });

            // "Piano Only" button — prominent if available
            if (hasPiano) {
                var pianoCount = tracks.filter(function (t) { return t.family === 'piano' && !t.is_drum; })
                    .reduce(function (s, t) { return s + t.note_count; }, 0);
                var pb = document.createElement('button');
                pb.style.cssText = 'width:100%;text-align:left;padding:12px 16px;background:rgba(0,255,136,0.15);border:1px solid rgba(0,255,136,0.4);border-radius:10px;color:#fff;cursor:pointer;font-size:0.9rem;font-family:Inter,sans-serif;';
                pb.innerHTML = '<strong style="color:#00ff88;">Piano Only</strong><br><span style="color:#888;font-size:0.8rem;">Extracts only piano tracks (' + pianoCount + ' notes)</span>';
                pb.onclick = function () { _extractTrack(midiId, { family: 'piano' }); };
                _tpList.appendChild(pb);
            }

            // "All Tracks" option
            var allCount = tracks.reduce(function (s, t) { return s + (t.is_drum ? 0 : t.note_count); }, 0);
            var ab = document.createElement('button');
            ab.style.cssText = 'width:100%;text-align:left;padding:12px 16px;background:rgba(0,255,136,0.08);border:1px solid rgba(0,255,136,0.2);border-radius:10px;color:#fff;cursor:pointer;font-size:0.9rem;font-family:Inter,sans-serif;';
            ab.innerHTML = '<strong style="color:#00ff88;">All Tracks</strong><br><span style="color:#888;font-size:0.8rem;">All non-drum instruments combined (' + allCount + ' notes)</span>';
            ab.onclick = function () { _extractTrack(midiId, {}); };
            _tpList.appendChild(ab);

            // Individual tracks
            tracks.forEach(function (t) {
                if (t.is_drum) return;
                var btn = document.createElement('button');
                btn.style.cssText = 'width:100%;text-align:left;padding:12px 16px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:10px;color:#fff;cursor:pointer;font-size:0.9rem;font-family:Inter,sans-serif;';
                var badge = t.family === 'piano' ? ' <span style="color:#00ff88;">[Piano]</span>' : '';
                btn.innerHTML = '<strong>' + (t.name || t.program_name) + badge + '</strong><br><span style="color:#888;font-size:0.8rem;">' + t.program_name + ' — ' + t.note_count + ' notes</span>';
                btn.onclick = function () { _extractTrack(midiId, { track_index: t.index }); };
                _tpList.appendChild(btn);
            });

            _tpOverlay.style.display = 'flex';
        }

        if (_tpCancel) {
            _tpCancel.addEventListener('click', function () {
                if (_tpOverlay) _tpOverlay.style.display = 'none';
                if (midiStatus) midiStatus.textContent = '';
            });
        }

        if (midiBtn && midiInput) {
            midiBtn.addEventListener('click', () => midiInput.click());
            midiInput.addEventListener('change', function () {
                const file = this.files && this.files[0];
                if (!file || !/\.(mid|midi)$/i.test(file.name)) {
                    if (midiStatus) midiStatus.textContent = 'Choose a .mid or .midi file.';
                    return;
                }
                if (midiStatus) midiStatus.textContent = 'Analyzing tracks...';
                const fd = new FormData();
                fd.append('file', file);
                fetch(musicApi + '/api/upload-midi-analyze', { method: 'POST', body: fd })
                    .then(r => r.json())
                    .then(data => {
                        if (!data.success) {
                            if (midiStatus) midiStatus.textContent = 'Error: ' + (data.error || 'parse failed');
                            return;
                        }
                        var nonDrum = data.tracks.filter(function (t) { return !t.is_drum; });
                        var pianoTracks = nonDrum.filter(function (t) { return t.family === 'piano'; });

                        // If only piano tracks exist, auto-extract them
                        if (pianoTracks.length > 0 && pianoTracks.length === nonDrum.length) {
                            _extractTrack(data.midi_id, { family: 'piano' });
                        } else if (nonDrum.length === 1) {
                            _extractTrack(data.midi_id, { track_index: nonDrum[0].index });
                        } else {
                            _showTrackPicker(data.midi_id, data.tracks);
                        }
                    })
                    .catch(() => { if (midiStatus) midiStatus.textContent = 'Upload failed'; });
                this.value = '';
            });
        }

        // Sheet music toggle
        const sheetToggle = document.getElementById('sheet-toggle-btn');
        const sheetContainer = document.getElementById('sheet-music-container');
        if (sheetToggle && sheetContainer) {
            sheetToggle.addEventListener('click', () => {
                const show = sheetContainer.style.display !== 'none';
                sheetContainer.style.display = show ? 'none' : 'block';
                sheetToggle.textContent = show ? 'Show staff' : 'Hide staff';
                if (!show && pianoNoteManager) updateSheetMusicFromManager(pianoNoteManager);
            });
        }
    }, 100);
}

function updateSheetMusicFromManager(manager) {
    if (typeof SheetRenderer === 'undefined' || !SheetRenderer.renderSheetMusic) return;
    const container = document.getElementById('sheet-music-inner');
    if (!container) return;
    let notes = manager.currentSheetNotes;
    if (!notes && manager.songNotes && manager.songNotes.length) {
        notes = manager.songNotes.map(n => ({
            t: (n.timing || 0) / 1000,
            note: n.noteKey || (n.note + '' + n.octave),
            dur: 0.5
        }));
    }
    SheetRenderer.renderSheetMusic('sheet-music-inner', notes || [], { bpm: 120 });
}

// Enhanced Drums Note Manager
class DrumsNoteManager {
    constructor(canvasId, partitionId, isPractice = false) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.partition = document.getElementById(partitionId);
        this.isPractice = isPractice;
        this.notes = [];
        this.playing = false;
        this.animationId = null;
        this.drumWidths = {};
        this.tempo = 1000;
        this.score = 0;
        this.totalBeats = 0;
        this.hitBeats = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.hitIndicator = document.getElementById(isPractice ? 'drums-hit-indicator' : null);
        this.scoreElement = document.getElementById(isPractice ? 'drums-practice-score' : 'drums-score');
        this.beatsElement = document.getElementById(isPractice ? null : 'drums-beats');
        this.accuracyElement = document.getElementById(isPractice ? 'drums-accuracy' : null);
        this.comboElement = document.getElementById(isPractice ? 'drums-combo' : null);

        this.setupCanvas();
        this.calculateDrumPositions();

        if (!isPractice) {
            this.startGeneratingNotes();
        }
    }

    setupCanvas() {
        const resizeCanvas = () => {
            this.canvas.width = this.canvas.offsetWidth;
            this.canvas.height = this.canvas.offsetHeight;
            this.calculateDrumPositions();
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
    }

    calculateDrumPositions() {
        setTimeout(() => {
            const container = document.querySelector('.drums-canvas-container, .camera-container');
            if (!container) return;

            const containerRect = container.getBoundingClientRect();
            document.querySelectorAll('.drum-pad').forEach((drum) => {
                const rect = drum.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2 - containerRect.left;
                this.drumWidths[drum.dataset.drum] = {
                    x: centerX - 80,
                    width: 160,
                    name: drum.dataset.drum
                };
            });
        }, 200);
    }

    setTempo(tempo) {
        this.tempo = tempo;
        if (this.generationInterval) {
            clearInterval(this.generationInterval);
            this.startGeneratingNotes();
        }
    }

    startGeneratingNotes() {
        if (this.generationInterval) clearInterval(this.generationInterval);

        this.generationInterval = setInterval(() => {
            if (this.playing) {
                this.addRandomNote();
                this.updatePartition();
            }
        }, this.tempo);
    }

    addRandomNote() {
        const drums = ['bass1', 'bass2', 'snare', 'cymbal'];
        const randomDrum = drums[Math.floor(Math.random() * drums.length)];
        const drumData = this.drumWidths[randomDrum];

        if (drumData) {
            // Calculate x position relative to canvas
            const canvasRect = this.canvas.getBoundingClientRect();
            const container = document.querySelector('.drums-canvas-container, .camera-container');
            if (container) {
                const containerRect = container.getBoundingClientRect();
                const relativeX = drumData.x + (containerRect.left - canvasRect.left);

                this.notes.push({
                    drum: randomDrum,
                    x: relativeX,
                    width: drumData.width,
                    y: 0, // Start from top of screen
                    speed: 2 + Math.random() * 2,
                    hit: false,
                    opacity: 1,
                    glowIntensity: 1
                });
                this.totalBeats++;
                if (this.beatsElement) {
                    this.beatsElement.textContent = this.totalBeats;
                }
            }
        }
    }

    updatePartition() {
        const recentNotes = this.notes.slice(-15).reverse();
        let partitionHTML = '';

        if (recentNotes.length === 0) {
            partitionHTML = '<div class="partition-empty"><div class="empty-icon">🎵</div><p>Notes will appear here</p></div>';
        } else {
            recentNotes.forEach(note => {
                const status = note.hit ? '✓' : '○';
                const className = note.hit ? 'hit' : 'active';
                partitionHTML += `<div class="partition-note ${className}">${note.drum.charAt(0).toUpperCase() + note.drum.slice(1)} ${status}</div>`;
            });
        }
        this.partition.innerHTML = partitionHTML;
    }

    updateScore() {
        if (this.scoreElement) {
            this.scoreElement.textContent = this.score;
        }
        if (this.accuracyElement) {
            const accuracy = this.totalBeats > 0 ? Math.round((this.hitBeats / this.totalBeats) * 100) : 0;
            this.accuracyElement.textContent = accuracy + '%';
        }
        if (this.comboElement) {
            this.comboElement.textContent = this.combo;
            if (this.combo > this.maxCombo) {
                this.maxCombo = this.combo;
            }
        }
    }

    triggerHitEffect() {
        if (this.hitIndicator) {
            this.hitIndicator.classList.add('active');
            setTimeout(() => {
                this.hitIndicator.classList.remove('active');
            }, 500);
        }
    }

    play() {
        this.playing = !this.playing;
        if (this.playing) {
            this.animate();
        } else {
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
            }
        }
        return this.playing;
    }

    animate() {
        if (!this.playing) return;

        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, 'rgba(30, 60, 114, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const drumsTop = this.canvas.height - 220;

        this.notes.forEach((note) => {
            if (!note.hit) {
                note.y += note.speed;

                const hitThreshold = drumsTop - 2;
                if (note.y + 80 >= hitThreshold) {
                    note.hit = true;
                    note.hitTime = Date.now();
                    this.hitBeats++;
                    this.combo++;
                    this.score += 15 + (this.combo * 3);
                    this.triggerDrumPress(note.drum);
                    this.createHitAnimation(note);
                    this.triggerHitEffect();
                    this.updatePartition();
                    this.updateScore();
                }
            } else {
                const timeSinceHit = Date.now() - note.hitTime;
                note.opacity = Math.max(0, 1 - (timeSinceHit / 400));
                note.y += note.speed * 0.3;
                note.glowIntensity = note.opacity;
            }

            this.ctx.save();
            const alpha = note.hit ? note.opacity * 0.6 : 0.95;
            this.ctx.globalAlpha = alpha;

            const noteHeight = 80;
            let gradient;
            if (note.drum === 'bass1') {
                gradient = this.ctx.createLinearGradient(note.x, note.y, note.x, note.y + noteHeight);
                gradient.addColorStop(0, 'rgba(255, 107, 107, 0.95)');
                gradient.addColorStop(1, 'rgba(201, 42, 42, 0.9)');
            } else if (note.drum === 'bass2') {
                gradient = this.ctx.createLinearGradient(note.x, note.y, note.x, note.y + noteHeight);
                gradient.addColorStop(0, 'rgba(139, 69, 19, 0.95)');
                gradient.addColorStop(1, 'rgba(101, 50, 14, 0.9)');
            } else if (note.drum === 'snare') {
                gradient = this.ctx.createLinearGradient(note.x, note.y, note.x, note.y + noteHeight);
                gradient.addColorStop(0, 'rgba(78, 205, 196, 0.95)');
                gradient.addColorStop(1, 'rgba(8, 127, 91, 0.9)');
            } else { // cymbal
                gradient = this.ctx.createLinearGradient(note.x, note.y, note.x, note.y + noteHeight);
                gradient.addColorStop(0, 'rgba(255, 230, 109, 0.95)');
                gradient.addColorStop(1, 'rgba(245, 159, 0, 0.9)');
            }

            if (!note.hit) {
                this.ctx.shadowBlur = 20 * note.glowIntensity;
                this.ctx.shadowColor = note.drum === 'bass1' ? 'rgba(255, 107, 107, 0.8)' :
                    note.drum === 'bass2' ? 'rgba(139, 69, 19, 0.8)' :
                        note.drum === 'snare' ? 'rgba(78, 205, 196, 0.8)' :
                            'rgba(255, 230, 109, 0.8)';
            }

            this.ctx.fillStyle = gradient;
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            this.ctx.lineWidth = 3;

            this.ctx.beginPath();
            this.ctx.roundRect(note.x, note.y, note.width, noteHeight, 18);
            this.ctx.fill();
            this.ctx.stroke();

            this.ctx.shadowBlur = 0;

            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 1.5rem "Inter", sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(note.drum.charAt(0).toUpperCase() + note.drum.slice(1), note.x + note.width / 2, note.y + noteHeight / 2);

            this.ctx.restore();
        });

        // Draw hit particles
        this.hitAnimations = this.hitAnimations.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= 0.02;
            particle.vy += 0.1; // gravity

            if (particle.life > 0) {
                this.ctx.save();
                this.ctx.globalAlpha = particle.life;
                this.ctx.fillStyle = particle.color;
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = particle.color;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
                return true;
            }
            return false;
        });

        this.notes = this.notes.filter(note => note.y < this.canvas.height + 100 && note.opacity > 0);

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    triggerDrumPress(drum) {
        const drumElement = document.querySelector(`[data-drum="${drum}"]`);
        if (drumElement) {
            drumElement.classList.add('active');
            setTimeout(() => {
                drumElement.classList.remove('active');
            }, 200);
        }

        // Also trigger visual overlay if in practice mode
        if (this.isPractice) {
            const visualDrum = document.querySelector(`.${drum}-drum-visual`);
            if (visualDrum) {
                visualDrum.classList.add('active-visual');
                setTimeout(() => {
                    visualDrum.classList.remove('active-visual');
                }, 200);
            }
        }
    }

    createHitAnimation(note) {
        const drumElement = document.querySelector(`[data-drum="${note.drum}"]`);
        if (drumElement) {
            const effect = document.createElement('div');
            effect.className = 'hit-effect';
            effect.style.borderRadius = '50%';
            drumElement.style.position = 'relative';
            drumElement.appendChild(effect);

            setTimeout(() => {
                effect.remove();
            }, 500);
        }
    }

    stop() {
        this.playing = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.generationInterval) {
            clearInterval(this.generationInterval);
        }
        this.notes = [];
        this.combo = 0;
    }
}

let drumsNoteManager = null;
let drumsVideoStream = null;

function initDrumsComposer() {
    drumsNoteManager = new DrumsNoteManager('drums-canvas', 'drums-partition', false);

    document.querySelectorAll('#drum-pads-composer .drum-pad').forEach(pad => {
        pad.addEventListener('click', () => {
            const drum = pad.dataset.drum;
            pad.classList.add('active');
            setTimeout(() => pad.classList.remove('active'), 200);
        });
    });

    const playBtn = document.getElementById('drums-play-btn');
    const tempoSlider = document.getElementById('drums-tempo');
    const tempoValue = document.getElementById('drums-tempo-value');

    playBtn.addEventListener('click', () => {
        if (drumsNoteManager) {
            const isPlaying = drumsNoteManager.play();
            playBtn.classList.toggle('playing', isPlaying);
            playBtn.querySelector('.play-icon').textContent = isPlaying ? '⏸' : '▶';
            playBtn.querySelector('.play-text').textContent = isPlaying ? 'Pause' : 'Play';
        }
    });

    tempoSlider.addEventListener('input', (e) => {
        const tempo = parseInt(e.target.value);
        tempoValue.textContent = tempo + 'ms';
        if (drumsNoteManager) {
            drumsNoteManager.setTempo(tempo);
        }
    });
}

function initDrumsPractice() {
    drumsNoteManager = new DrumsNoteManager('drums-practice-canvas', 'drums-partition-practice', true);

    const video = document.getElementById('drums-video');
    const cameraStatus = document.getElementById('drums-camera-status');

    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            drumsVideoStream = stream;
            video.srcObject = stream;
            cameraStatus.style.display = 'flex';
        })
        .catch(err => {
            console.error('Error accessing camera:', err);
            cameraStatus.style.display = 'none';
        });

    drumsNoteManager.startGeneratingNotes();

    // Sync visual overlay with drum presses
    document.querySelectorAll('.drum-visual').forEach(visual => {
        const drumType = visual.dataset.drum;
        const actualDrum = document.querySelector(`[data-drum="${drumType}"]`);
        if (actualDrum) {
            actualDrum.addEventListener('click', () => {
                visual.classList.add('active-visual');
                setTimeout(() => {
                    visual.classList.remove('active-visual');
                }, 200);
            });
        }
    });

    document.querySelectorAll('#drum-pads-practice .drum-pad').forEach(pad => {
        pad.addEventListener('click', () => {
            const drum = pad.dataset.drum;
            pad.classList.add('active');
            setTimeout(() => pad.classList.remove('active'), 200);
        });
    });

    const playBtn = document.getElementById('drums-practice-play-btn');
    const tempoSlider = document.getElementById('drums-practice-tempo');
    const tempoValue = document.getElementById('drums-practice-tempo-value');

    playBtn.addEventListener('click', () => {
        if (drumsNoteManager) {
            const isPlaying = drumsNoteManager.play();
            playBtn.classList.toggle('playing', isPlaying);
            playBtn.querySelector('.play-icon').textContent = isPlaying ? '⏸' : '▶';
            playBtn.querySelector('.play-text').textContent = isPlaying ? 'Pause' : 'Play';
        }
    });

    tempoSlider.addEventListener('input', (e) => {
        const tempo = parseInt(e.target.value);
        tempoValue.textContent = tempo + 'ms';
        if (drumsNoteManager) {
            drumsNoteManager.setTempo(tempo);
        }
    });
}

// --- Multiplayer (WebSocket + postMessage) ---
const AirJamMultiplayer = {
    WS_BASE: 'ws://localhost:8765',
    API_BASE: 'http://localhost:8766',
    roomId: null,
    senderId: null,
    ws: null,
    instrument: 'piano',

    createSenderId() {
        return 's' + Math.random().toString(36).slice(2, 10);
    },

    createRoom(cb) {
        fetch(this.API_BASE + '/api/create-room', { method: 'POST' })
            .then(r => r.json())
            .then(data => {
                if (data.room_id) {
                    this.roomId = data.room_id;
                    this.senderId = this.senderId || this.createSenderId();
                    this.connectWs(cb);
                }
            })
            .catch(err => console.error('Create room failed', err));
    },

    joinRoom(roomId, cb) {
        const id = (roomId || '').trim().toUpperCase();
        if (!id || id.length > 20) return;
        this.roomId = id;
        this.senderId = this.senderId || this.createSenderId();
        this.connectWs(cb);
    },

    connectWs(cb) {
        if (this.ws) {
            try { this.ws.close(); } catch (e) { }
            this.ws = null;
        }
        if (!this.roomId) return;
        const url = this.WS_BASE + '/ws/' + encodeURIComponent(this.roomId);
        this.ws = new WebSocket(url);
        this.ws.onopen = () => { if (cb) cb(true); };
        this.ws.onclose = () => { if (cb) cb(false); };
        this.ws.onerror = () => { if (cb) cb(false); };
        this.ws.onmessage = (e) => {
            try {
                const d = JSON.parse(e.data);
                if (d.type === 'NOTE_PLAYED') this.onNoteFromNetwork(d.note, d.velocity, d.instrument || 'piano');
            } catch (err) { }
        };
    },

    sendNote(note, velocity, instrument) {
        const inst = instrument || this.instrument;
        const payload = {
            type: 'NOTE_PLAYED',
            room_id: this.roomId,
            sender_id: this.senderId,
            instrument: inst,
            note: note,
            velocity: velocity != null ? velocity : 0.8,
            timestamp_ms: Date.now()
        };
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(payload));
            return;
        }
        fetch(this.API_BASE + '/api/note', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).catch(err => console.error('POST /api/note failed', err));
    },

    onNoteFromNetwork(note, velocity, instrument) {
        const n = (note || '').toString().trim();
        if (!n) return;
        const noteKey = n.length >= 2 && /\d/.test(n) ? n : n + '4';
        if (pianoNoteManager && typeof pianoNoteManager.triggerKeyPress === 'function') {
            pianoNoteManager.triggerKeyPress(noteKey);
        }
    },

    copySpectatorLink() {
        if (!this.roomId) return false;
        const base = window.location.href.split('?')[0].replace(/\/[^/]*$/, '');
        const url = base + '/spectator.html?room=' + this.roomId;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(() => { }).catch(() => { });
            return true;
        }
        return false;
    }
};

window.addEventListener('message', function (e) {
    const d = e.data;
    if (!d || (d.type !== 'notePlayed' && d.type !== 'NOTE_PLAYED')) return;
    const note = (d.note || '').toString().trim();
    const velocity = typeof d.velocity === 'number' ? d.velocity : 0.8;
    if (!note) return;

    // Existing AirJamMultiplayer (keep it)
    if (typeof AirJamMultiplayer !== 'undefined') {
        AirJamMultiplayer.onNoteFromNetwork(note.toUpperCase() + '4', velocity, 'piano');
        if (AirJamMultiplayer.roomId) {
            AirJamMultiplayer.sendNote(note.toUpperCase() + '4', velocity, 'piano');
        }
    }

    // Forward to Jam WebSocket if in a jam room
    if (typeof jamSessionManager !== 'undefined' && jamSessionManager && jamSessionManager.connected) {
        jamSessionManager.sendNote(note, velocity);
    }

    // Local visual feedback
    const keyContainer = document.getElementById('piano-practice-keys') || document.getElementById('piano-keys') || document.getElementById('jam-piano-keys');
    if (keyContainer) {
        const noteKey = note.length >= 2 ? note : (note.charAt(0).toUpperCase() + '4');
        const keyEl = keyContainer.querySelector(`[data-note="${noteKey}"]`) || keyContainer.querySelector(`[data-note="${note.charAt(0).toUpperCase()}4"]`);
        if (keyEl) {
            keyEl.classList.add('pressed');
            setTimeout(() => keyEl.classList.remove('pressed'), 400);
        }
    }
    const drumMap = { kick: 'bass1', snare: 'snare', hat: 'cymbal', tom: 'bass2' };
    const drumKey = drumMap[note.toLowerCase()] || note.toLowerCase();
    const drumEl = document.querySelector(`[data-drum="${drumKey}"]`);
    if (drumEl) {
        drumEl.classList.add('active');
        setTimeout(() => drumEl.classList.remove('active'), 200);
    }
});

// --- Jam Session: Host/Client flow (separate from piano/drums practice) ---
let jamRoomId = null;

function flashJamKey(note) {
    const key = (note && note.length >= 2) ? note : (String(note).charAt(0).toUpperCase() + '4');
    const el = document.querySelector('#jam-piano-keys [data-note="' + key + '"]') || document.querySelector('#jam-piano-keys [data-note="' + key.charAt(0) + '4"]');
    if (el) {
        el.classList.add('pressed');
        setTimeout(() => el.classList.remove('pressed'), 400);
    }
}

function flashJamDrum(drumName) {
    const d = (drumName || '').toString().toUpperCase();
    const drumMap = { KICK: 'bass1', HAT: 'cymbal', TOM: 'bass2', SNARE: 'snare' };
    const drum = drumMap[d] || drumName;
    const el = document.querySelector('#jam-drum-pads [data-drum="' + drum + '"]');
    if (el) {
        el.classList.add('active');
        setTimeout(() => el.classList.remove('active'), 200);
    }
}

function initJamSetup() {
    const hostBtn = document.getElementById('jam-host-btn');
    const joinBtn = document.getElementById('jam-join-btn');
    const joinInput = document.getElementById('jam-client-code-input');
    const connectedDiv = document.getElementById('jam-connected');
    const codeEl = document.getElementById('jam-host-code');
    const labelEl = document.getElementById('jam-connected-label');
    const pickPianoBtn = document.getElementById('jam-pick-piano-btn');
    const pickDrumsBtn = document.getElementById('jam-pick-drums-btn');

    if (typeof jamSessionManager === 'undefined' || !jamSessionManager) {
        jamSessionManager = new JamSessionManager();
    }

    function showConnected(roomId, isHost) {
        jamRoomId = roomId;
        if (connectedDiv) connectedDiv.classList.remove('hidden');
        if (codeEl) codeEl.textContent = roomId || '';
        if (labelEl) labelEl.textContent = isHost ? 'Share this code with your partner:' : 'Connected to room:';
    }

    if (hostBtn) {
        hostBtn.addEventListener('click', () => {
            fetch(JAM_SESSION_HTTP_URL + '/create_room', { method: 'POST' })
                .then(r => r.json())
                .then(data => {
                    const roomId = (data.room_id || '').trim().toUpperCase();
                    if (!roomId) return;
                    showConnected(roomId, true);
                })
                .catch(e => {
                    console.error('[Jam] Host failed', e);
                    alert('Could not create room. Is the session server running on port 8502?');
                });
        });
    }
    if (joinBtn && joinInput) {
        joinBtn.addEventListener('click', () => {
            const roomId = (joinInput.value || '').trim().toUpperCase();
            if (!roomId) {
                alert('Please enter the 6-letter room code from your host.');
                return;
            }
            showConnected(roomId, false);
        });
    }
    if (pickPianoBtn) {
        pickPianoBtn.addEventListener('click', () => {
            if (!jamRoomId) return;
            const playerId = 'piano_' + Math.random().toString(36).slice(2, 8);
            jamSessionManager.connect(jamRoomId, playerId, 'piano');
            jamSessionManager.onRemoteNote = (p) => {
                playRemoteNoteSound(p.note, p.instrument, p.velocity);
                if (p.instrument === 'piano') flashJamKey(p.note);
                if (p.instrument === 'drums') flashJamDrum(p.note);
            };
            showPage('jam-piano');
            initJamPiano();
        });
    }
    if (pickDrumsBtn) {
        pickDrumsBtn.addEventListener('click', () => {
            if (!jamRoomId) return;
            const playerId = 'drums_' + Math.random().toString(36).slice(2, 8);
            jamSessionManager.connect(jamRoomId, playerId, 'drums');
            jamSessionManager.onRemoteNote = (p) => {
                playRemoteNoteSound(p.note, p.instrument, p.velocity);
                if (p.instrument === 'piano') flashJamKey(p.note);
                if (p.instrument === 'drums') flashJamDrum(p.note);
            };
            showPage('jam-drums');
            initJamDrums();
        });
    }
}

function initJamPiano() {
    if (typeof createPianoKeys === 'function') {
        createPianoKeys('jam-piano-keys');
    }
    const badge = document.getElementById('jam-piano-room-badge');
    if (badge && typeof jamSessionManager !== 'undefined' && jamSessionManager) {
        badge.textContent = 'Room: ' + (jamSessionManager.roomId || '');
    }
    document.querySelectorAll('#jam-piano-keys .piano-key').forEach(key => {
        key.addEventListener('click', () => {
            const note = key.dataset.note;
            if (typeof jamSessionManager !== 'undefined' && jamSessionManager && jamSessionManager.connected && note) {
                jamSessionManager.sendNote(note, 0.8);
            }
        });
    });
}

function initJamDrums() {
    const badge = document.getElementById('jam-drums-room-badge');
    if (badge && typeof jamSessionManager !== 'undefined' && jamSessionManager) {
        badge.textContent = 'Room: ' + (jamSessionManager.roomId || '');
    }
    document.querySelectorAll('#jam-drum-pads .drum-pad').forEach(pad => {
        pad.addEventListener('click', () => {
            const drum = pad.dataset.drum;
            if (typeof jamSessionManager !== 'undefined' && jamSessionManager && jamSessionManager.connected) {
                jamSessionManager.sendNote(drum, 0.8);
            }
        });
    });
}

function exitJamSession() {
    if (typeof jamSessionManager !== 'undefined' && jamSessionManager) jamSessionManager.disconnect();
    jamRoomId = null;
    const connectedDiv = document.getElementById('jam-connected');
    if (connectedDiv) connectedDiv.classList.add('hidden');
    showPage('instruments-page');
}

// Initialize on page load
(function () {
    function init() {
        console.log('Initializing application...');
        console.log('Pages object:', pages);

        // Show landing page
        showPage('landing');

        // Setup instrument buttons
        setupInstrumentButtons();

        console.log('Initialization complete');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // DOM already loaded
        setTimeout(init, 100);
    }
})();
