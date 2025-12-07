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

// Page Navigation
let currentInstrument = null;
let currentMode = null;

const pages = {
    landing: document.getElementById('landing-page'),
    'camera-setup': document.getElementById('camera-setup'),
    'practice-question': document.getElementById('practice-question'),
    'piano-composer': document.getElementById('piano-composer'),
    'piano-practice': document.getElementById('piano-practice'),
    'drums-composer': document.getElementById('drums-composer'),
    'drums-practice': document.getElementById('drums-practice')
};

function showPage(pageId) {
    Object.values(pages).forEach(page => page.classList.remove('active'));
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

// Keep old function for compatibility but redirect
function showHeroCameraPreview() {
    // Redirect to camera setup instead
    showCameraSetupPage();
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
        }
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
                if (songId && pianoNoteManager) {
                    pianoNoteManager.setSong(songId);
                    // Reset and prepare for new song
                    if (pianoNoteManager.playing) {
                        pianoNoteManager.stop();
                        pianoNoteManager.play();
                    }
                }
            });
        }
    }, 100);
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
