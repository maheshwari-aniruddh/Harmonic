/**
 * Shared finger-drums engine: browser-based MediaPipe Hands + Web Audio.
 * Index fingers only, velocity gating, hold-to-repeat.
 * Call FingerDrumsEngine.init(...) with element IDs.
 */
var FingerDrumsEngine = (function () {
    var PADS = [
        { id: 'kick',  label: 'Kick',   x: 0.18, y: 0.76, radius: 0.19, color: '#2563eb', file: 'drum_sounds/kick-01.wav' },
        { id: 'hihat', label: 'Hi-Hat', x: 0.82, y: 0.76, radius: 0.18, color: '#059669', file: 'drum_sounds/hihat-open.wav' },
        { id: 'tom1',  label: 'Tom',    x: 0.18, y: 0.22, radius: 0.18, color: '#f59e0b', file: 'drum_sounds/tom-01.wav' },
        { id: 'snare', label: 'Snare',  x: 0.82, y: 0.22, radius: 0.18, color: '#7c3aed', file: 'drum_sounds/snare-03.wav' },
    ];

    var INDEX_TIP = 8;
    var SPEED_THRESHOLD = 35;
    var REPEAT_DELAY_MS = 800;
    var REPEAT_INTERVAL_MS = 400;

    var audioCtx = null;
    var buffers = {};
    var padState = {};
    var prevFingerPos = {};

    PADS.forEach(function (p) {
        padState[p.id] = { inside: false, enteredAt: 0, lastRepeat: 0 };
    });

    async function loadSounds() {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) throw new Error('Web Audio not supported');
        audioCtx = new AC();
        var seen = {};
        var jobs = [];
        PADS.forEach(function (pad) {
            if (seen[pad.file]) return;
            seen[pad.file] = true;
            jobs.push(
                fetch(pad.file)
                    .then(function (r) { if (!r.ok) throw new Error(pad.file + ' HTTP ' + r.status); return r.arrayBuffer(); })
                    .then(function (a) { return audioCtx.decodeAudioData(a); })
                    .then(function (b) { buffers[pad.file] = b; })
            );
        });
        await Promise.all(jobs);
    }

    function playSound(pad) {
        if (!audioCtx || !buffers[pad.file]) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        var s = audioCtx.createBufferSource();
        s.buffer = buffers[pad.file];
        if (pad.rate) s.playbackRate.value = pad.rate;
        s.connect(audioCtx.destination);
        s.start();
    }

    function buildLegend(containerId) {
        var el = document.getElementById(containerId);
        if (!el) return;
        el.innerHTML = '';
        PADS.forEach(function (p) {
            el.innerHTML += '<div class="legend-chip"><div class="dot" style="background:' + p.color + '"></div><span>' + p.label + '</span></div>';
        });
    }

    function startTracking(video, canvasId, infoId) {
        var canvas = document.getElementById(canvasId);
        var info = document.getElementById(infoId);
        var wrap = canvas.parentElement;

        function resize() {
            var w = wrap.clientWidth || 960;
            canvas.width = w;
            canvas.height = Math.round(w * 3 / 4);
        }
        resize();
        new ResizeObserver(resize).observe(wrap);

        var hands = new Hands({ locateFile: function (f) { return 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/' + f; } });
        hands.setOptions({ maxNumHands: 2, modelComplexity: 1, selfieMode: true, minDetectionConfidence: 0.7, minTrackingConfidence: 0.6 });

        hands.onResults(function (results) {
            var ctx = canvas.getContext('2d');
            if (!ctx) return;
            var W = canvas.width, H = canvas.height, minDim = Math.min(W, H);
            var now = Date.now();

            ctx.clearRect(0, 0, W, H);

            // Index fingertips + velocity
            var allHands = results.multiHandLandmarks || [];
            var handLabels = results.multiHandedness || [];
            var tips = [];
            for (var h = 0; h < allHands.length; h++) {
                var label = (handLabels[h] && handLabels[h][0]) ? handLabels[h][0].label : ('h' + h);
                var lm = allHands[h][INDEX_TIP];
                var px = lm.x * W, py = lm.y * H, speed = 0;
                if (prevFingerPos[label]) {
                    var dx = px - prevFingerPos[label].x, dy = py - prevFingerPos[label].y;
                    speed = Math.sqrt(dx * dx + dy * dy);
                }
                prevFingerPos[label] = { x: px, y: py };
                tips.push({ x: px, y: py, speed: speed });
            }

            // Draw pads
            PADS.forEach(function (pad) {
                var px = pad.x * W, py = pad.y * H, r = pad.radius * minDim;
                var ps = padState[pad.id], hit = ps.inside;

                if (hit) {
                    ctx.beginPath(); ctx.arc(px, py, r + 14, 0, Math.PI * 2);
                    ctx.strokeStyle = pad.color + '40'; ctx.lineWidth = 4; ctx.stroke();
                }
                ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2);
                ctx.fillStyle = hit ? (pad.color + 'cc') : (pad.color + '44'); ctx.fill();
                ctx.lineWidth = hit ? 5 : 2.5;
                ctx.strokeStyle = hit ? '#ffffff' : (pad.color + 'aa'); ctx.stroke();

                ctx.fillStyle = '#ffffff';
                ctx.font = '700 ' + Math.max(15, r * 0.3) + 'px Inter, system-ui, sans-serif';
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText(pad.label, px, py);

                if (hit && ps.enteredAt > 0) {
                    var hold = now - ps.enteredAt;
                    if (hold > 200) {
                        var prog = Math.min(1, (hold - 200) / (REPEAT_DELAY_MS - 200));
                        ctx.beginPath(); ctx.arc(px, py, r + 6, -Math.PI / 2, -Math.PI / 2 + prog * Math.PI * 2);
                        ctx.strokeStyle = '#ffffff88'; ctx.lineWidth = 3; ctx.stroke();
                    }
                }
            });

            // Finger dots
            tips.forEach(function (pt) {
                var fast = pt.speed > SPEED_THRESHOLD;
                ctx.beginPath(); ctx.arc(pt.x, pt.y, 12, 0, Math.PI * 2);
                ctx.fillStyle = fast ? '#f9731666' : '#f97316'; ctx.fill();
                ctx.lineWidth = 3; ctx.strokeStyle = fast ? '#ffffff44' : '#ffffff'; ctx.stroke();
            });

            // Hit detection
            PADS.forEach(function (pad) {
                var px = pad.x * W, py = pad.y * H, r = pad.radius * minDim;
                var ps = padState[pad.id];
                var inside = false;
                for (var i = 0; i < tips.length; i++) {
                    var t = tips[i], dx = t.x - px, dy = t.y - py;
                    if (Math.sqrt(dx * dx + dy * dy) <= r && t.speed < SPEED_THRESHOLD) { inside = true; break; }
                }
                if (inside) {
                    if (!ps.inside) { playSound(pad); ps.inside = true; ps.enteredAt = now; ps.lastRepeat = now; }
                    else {
                        var hold = now - ps.enteredAt;
                        if (hold >= REPEAT_DELAY_MS && now - ps.lastRepeat >= REPEAT_INTERVAL_MS) { playSound(pad); ps.lastRepeat = now; }
                    }
                } else { ps.inside = false; ps.enteredAt = 0; ps.lastRepeat = 0; }
            });

            if (info) {
                if (tips.length > 0) { info.style.display = ''; info.textContent = tips.length + ' index finger' + (tips.length > 1 ? 's' : '') + ' tracked'; }
                else { info.style.display = 'none'; prevFingerPos = {}; }
            }
        });

        var camera = new Camera(video, {
            onFrame: async function () { await hands.send({ image: video }); },
            width: 960, height: 720
        });
        camera.start();
    }

    return {
        PADS: PADS,
        init: function (videoId, canvasId, btnId, overlayId, infoId, legendId, statusId, dotId, labelId) {
            buildLegend(legendId);
            var btn = document.getElementById(btnId);
            if (!btn) return;
            btn.addEventListener('click', async function () {
                btn.disabled = true;
                btn.innerHTML = '<div style="width:20px;height:20px;border:3px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;display:inline-block"></div> Loading...';

                try { await loadSounds(); } catch (e) {
                    btn.disabled = false; btn.textContent = 'Retry — ' + e.message; return;
                }

                var video = document.getElementById(videoId);
                try {
                    var stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 960 }, height: { ideal: 720 } } });
                    video.srcObject = stream;
                    await video.play();
                } catch (e) {
                    btn.disabled = false; btn.textContent = 'Camera denied — Retry'; return;
                }

                var ov = document.getElementById(overlayId);
                if (ov) ov.style.display = 'none';
                if (statusId) { var s = document.getElementById(statusId); if (s) s.textContent = 'Playing'; }
                if (dotId) { var d = document.getElementById(dotId); if (d) { d.style.background = '#ff6b6b'; d.style.animation = 'pulse 2s infinite'; } }
                if (labelId) { var l = document.getElementById(labelId); if (l) l.textContent = 'Camera Active'; }

                startTracking(video, canvasId, infoId);
            });
        }
    };
})();
