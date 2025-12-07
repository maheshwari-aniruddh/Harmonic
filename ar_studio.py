import cv2
import mediapipe as mp
import numpy as np
import simpleaudio as sa
import wave
import streamlit as st
import time
import math
import os
from datetime import datetime

# --- MUSIC RECORDER (For Composer Mode) ---
class MusicRecorder:
    """Records note events and exports to WAV file"""
    def __init__(self):
        self.is_recording = False
        self.recording_start_time = None
        self.recorded_notes = []  # [(note_name, timestamp_ms)]
        self.sample_rate = 44100
        self.output_dir = "recordings"
        
    def start_recording(self):
        """Start a new recording session"""
        self.is_recording = True
        self.recording_start_time = time.time()
        self.recorded_notes = []
        print("[RECORDER] 🎙️ Recording started!")
        
    def stop_recording(self):
        """Stop recording and return the recorded notes"""
        self.is_recording = False
        duration = time.time() - self.recording_start_time if self.recording_start_time else 0
        print(f"[RECORDER] ⏹️ Recording stopped. Duration: {duration:.1f}s, Notes: {len(self.recorded_notes)}")
        return self.recorded_notes
    
    def record_note(self, note_name, octave_modifier=""):
        """Record a note event with timestamp"""
        if self.is_recording and self.recording_start_time:
            timestamp_ms = int((time.time() - self.recording_start_time) * 1000)
            full_note = f"{note_name}{octave_modifier}"
            self.recorded_notes.append((full_note, timestamp_ms))
            print(f"[RECORDER] 📝 Recorded: {full_note} at {timestamp_ms}ms")
    
    def export_wav(self, audio_engine, filename=None):
        """Mix recorded notes into an MP3 file"""
        if not self.recorded_notes:
            print("[RECORDER] ⚠️ No notes to export!")
            return None
            
        # Create output directory if needed
        os.makedirs(self.output_dir, exist_ok=True)
        
        # Generate filename if not provided (use .mp3 extension)
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{self.output_dir}/recording_{timestamp}.mp3"
        
        # Calculate duration (add 2 seconds padding for last note to ring out)
        max_timestamp = max(ts for _, ts in self.recorded_notes)
        duration_samples = int((max_timestamp / 1000 + 2) * self.sample_rate)
        
        # Create output buffer (stereo)
        output = np.zeros((duration_samples, 2), dtype=np.float32)
        
        # Mix each note at its timestamp
        for note_name, timestamp_ms in self.recorded_notes:
            sample_data = self._get_note_samples(audio_engine, note_name)
            if sample_data is not None:
                start_sample = int(timestamp_ms / 1000 * self.sample_rate)
                end_sample = min(start_sample + len(sample_data), duration_samples)
                samples_to_copy = end_sample - start_sample
                if samples_to_copy > 0:
                    output[start_sample:end_sample] += sample_data[:samples_to_copy]
        
        # Normalize to prevent clipping
        max_val = np.max(np.abs(output))
        if max_val > 0:
            output = output / max_val * 0.9
        
        # Convert to int16
        output_int16 = (output * 32767).astype(np.int16)
        
        # Export as MP3 using pydub
        try:
            from pydub import AudioSegment
            
            # Create AudioSegment from raw audio data
            audio_segment = AudioSegment(
                output_int16.tobytes(),
                frame_rate=self.sample_rate,
                sample_width=2,  # 16-bit
                channels=2  # stereo
            )
            
            # Export as MP3
            audio_segment.export(filename, format="mp3", bitrate="192k")
            print(f"[RECORDER] ✅ Exported MP3 to: {filename}")
            return filename
        except Exception as e:
            print(f"[RECORDER] ❌ MP3 export failed: {e}")
            # Fallback to WAV if MP3 fails
            wav_filename = filename.replace('.mp3', '.wav')
            try:
                with wave.open(wav_filename, 'wb') as wf:
                    wf.setnchannels(2)
                    wf.setsampwidth(2)
                    wf.setframerate(self.sample_rate)
                    wf.writeframes(output_int16.tobytes())
                print(f"[RECORDER] ✅ Exported WAV (fallback) to: {wav_filename}")
                return wav_filename
            except:
                return None
    
    def export_txt(self, mode="piano"):
        """Export recorded notes as TXT file (note sequence)"""
        if not self.recorded_notes:
            print("[RECORDER] ⚠️ No notes to export as TXT!")
            return None
        
        # Create output directory
        os.makedirs(self.output_dir, exist_ok=True)
        
        # Generate filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{self.output_dir}/my_recording_{timestamp}.txt"
        
        # Extract just the note letters (C, D, E, F, G, A, B for piano, or drum names)
        notes = []
        for note_name, _ in self.recorded_notes:
            # Clean up note name
            base = note_name.replace('_high', '').replace('_low', '').replace('s', '')
            if mode == "piano":
                # Convert c1, d1, etc. to C, D, etc.
                note_letter = base[0].upper() if base else ''
                if note_letter in 'CDEFGAB':
                    notes.append(note_letter)
            else:
                # Drums - keep as is (SNARE, HAT, KICK, TOM)
                notes.append(note_name.upper())
        
        # Write to file with spaces
        try:
            with open(filename, 'w') as f:
                f.write(' '.join(notes))
            print(f"[RECORDER] ✅ Exported TXT to: {filename}")
            return filename
        except Exception as e:
            print(f"[RECORDER] ❌ TXT export failed: {e}")
            return None
    
    @staticmethod
    def list_recordings():
        """List all saved TXT recordings"""
        recordings = []
        recordings_dir = "recordings"
        if os.path.exists(recordings_dir):
            for f in os.listdir(recordings_dir):
                if f.endswith('.txt') and f.startswith('my_recording_'):
                    filepath = os.path.join(recordings_dir, f)
                    mtime = os.path.getmtime(filepath)
                    recordings.append({
                        'filename': f,
                        'filepath': filepath,
                        'timestamp': datetime.fromtimestamp(mtime).strftime('%Y-%m-%d %H:%M')
                    })
        # Sort by timestamp descending
        recordings.sort(key=lambda x: x['timestamp'], reverse=True)
        return recordings
    
    @staticmethod
    def load_recording(filepath):
        """Load a recording TXT file and return the notes"""
        try:
            with open(filepath, 'r') as f:
                content = f.read()
                notes = [n.upper() for n in content.split() if n.strip()]
                return notes
        except:
            return []
    
    def _get_note_samples(self, audio_engine, note_name):
        """Get sample data for a note from audio engine"""
        # Try to load the original WAV file for this note
        sound_paths = {
            # Piano notes
            'c1': 'sounds/c1.wav', 'd1': 'sounds/d1.wav', 'e1': 'sounds/e1.wav',
            'f1': 'sounds/f1.wav', 'g1': 'sounds/g1.wav', 'a1': 'sounds/a1.wav', 'b1': 'sounds/b1.wav',
            'c1s': 'sounds/c1s.wav', 'd1s': 'sounds/d1s.wav', 'f1s': 'sounds/f1s.wav',
            'g1s': 'sounds/g1s.wav', 'a1s': 'sounds/a1s.wav',
            # Drums
            'SNARE': 'drum_sounds/snare-03.wav', 'HAT': 'drum_sounds/hihat-open.wav',
            'KICK': 'drum_sounds/kick-01.wav', 'TOM': 'drum_sounds/tom-01.wav',
        }
        
        # Handle octave variants
        base_note = note_name.replace('_high', '').replace('_low', '')
        path = sound_paths.get(base_note)
        
        if path and os.path.exists(path):
            try:
                with wave.open(path, 'rb') as wf:
                    frames = wf.readframes(wf.getnframes())
                    samples = np.frombuffer(frames, dtype=np.int16).astype(np.float32) / 32767
                    
                    # Handle mono to stereo
                    if wf.getnchannels() == 1:
                        samples = np.column_stack([samples, samples])
                    else:
                        samples = samples.reshape(-1, 2)
                    
                    # Apply octave modification
                    if '_high' in note_name:
                        samples = samples[::2]  # Double speed
                    elif '_low' in note_name:
                        samples = np.repeat(samples, 2, axis=0)  # Half speed
                    
                    return samples
            except Exception as e:
                print(f"[RECORDER] Failed to load {path}: {e}")
        return None

# --- AUDIO ENGINE (Using simpleaudio - no pygame) ---
class AudioEngine:
    def __init__(self):
        self.sounds = {}  # {name: WaveObject}
        self.audio_data = {}  # {name: (audio_array, sample_rate, num_channels, bytes_per_sample)}
        self._load_sounds()
        
    def _load_wav(self, path):
        """Load a WAV file and return audio data + WaveObject"""
        try:
            with wave.open(path, 'rb') as wf:
                num_channels = wf.getnchannels()
                bytes_per_sample = wf.getsampwidth()
                sample_rate = wf.getframerate()
                num_frames = wf.getnframes()
                audio_bytes = wf.readframes(num_frames)
                
                # Convert to numpy array for manipulation
                if bytes_per_sample == 2:
                    dtype = np.int16
                elif bytes_per_sample == 1:
                    dtype = np.uint8
                else:
                    dtype = np.int32
                    
                audio_array = np.frombuffer(audio_bytes, dtype=dtype)
                
                # Create WaveObject for playback
                wave_obj = sa.WaveObject(audio_bytes, num_channels, bytes_per_sample, sample_rate)
                
                return wave_obj, audio_array, sample_rate, num_channels, bytes_per_sample
        except Exception as e:
            print(f"Failed to load {path}: {e}")
            return None, None, None, None, None
    
    def _create_variants(self, base_name, audio_array, sample_rate, num_channels, bytes_per_sample):
        """Create high and low octave variants by resampling"""
        try:
            if audio_array is None:
                return
                
            # Reshape for stereo if needed
            if num_channels == 2:
                audio_array = audio_array.reshape(-1, 2)
            
            # High Octave (2x speed = skip every other sample)
            if num_channels == 2:
                arr_high = audio_array[::2, :].flatten()
            else:
                arr_high = audio_array[::2]
            
            # Low Octave (0.5x speed = repeat samples)
            if num_channels == 2:
                arr_low = np.repeat(audio_array, 2, axis=0).flatten()
            else:
                arr_low = np.repeat(audio_array, 2)
            
            # Convert back to bytes and create WaveObjects
            arr_high_bytes = arr_high.astype(np.int16).tobytes()
            arr_low_bytes = arr_low.astype(np.int16).tobytes()
            
            self.sounds[f"{base_name}_high"] = sa.WaveObject(arr_high_bytes, num_channels, bytes_per_sample, sample_rate)
            self.sounds[f"{base_name}_low"] = sa.WaveObject(arr_low_bytes, num_channels, bytes_per_sample, sample_rate)
            
        except Exception as e:
            print(f"Failed to generate variants for {base_name}: {e}")

    def _load_sounds(self):
        # Finger to note mapping
        self.finger_map = {
            'Left_Pinky':  'c1', 'Left_Ring':   'd1', 'Left_Middle': 'e1', 'Left_Index':  'f1', 'Left_Thumb':  'g1',
            'Right_Thumb': 'a1', 'Right_Index': 'b1', 'Right_Middle': 'c1', 'Right_Ring':   'd1', 'Right_Pinky':  'e1'
        }
        
        # Load all piano notes + sharps
        base_notes = ['c1', 'd1', 'e1', 'f1', 'g1', 'a1', 'b1']
        for note in base_notes:
            # Natural
            path = f"sounds/{note}.wav"
            if os.path.exists(path):
                wave_obj, audio_arr, sr, nc, bps = self._load_wav(path)
                if wave_obj:
                    self.sounds[note] = wave_obj
                    self._create_variants(note, audio_arr, sr, nc, bps)
            else:
                print(f"Missing {path}")
            
            # Sharp
            path_s = f"sounds/{note}s.wav"
            if os.path.exists(path_s):
                wave_obj, audio_arr, sr, nc, bps = self._load_wav(path_s)
                if wave_obj:
                    self.sounds[f"{note}s"] = wave_obj
                    self._create_variants(f"{note}s", audio_arr, sr, nc, bps)

        # DRUMS
        drum_files = {
            'SNARE': 'drum_sounds/snare-03.wav',
            'HAT': 'drum_sounds/hihat-open.wav',
            'KICK': 'drum_sounds/kick-01.wav',
            'TOM': 'drum_sounds/tom-01.wav'
        }
        for name, path in drum_files.items():
            if os.path.exists(path):
                wave_obj, _, _, _, _ = self._load_wav(path)
                if wave_obj:
                    self.sounds[name] = wave_obj
                    print(f"✓ Loaded drum: {name} from {path}")
                else:
                    print(f"✗ Failed to load drum: {name}")
            else:
                print(f"✗ Drum file not found: {path}")
                if 'c1' in self.sounds:
                    self.sounds[name] = self.sounds['c1']

    def play(self, note_name, octave_modifier=""):
        """Play a sound (non-blocking)"""
        # DRUMS: Always play at original speed, no octave modifiers
        if note_name in ['SNARE', 'HAT', 'KICK', 'TOM']:
            if note_name in self.sounds:
                print(f"[AUDIO] 🥁 DRUM HIT: {note_name}")
                self.sounds[note_name].play()
            else:
                print(f"[AUDIO] ❌ Drum NOT FOUND: {note_name}")
            return
        
        # PIANO: Can use octave modifiers
        target = f"{note_name}{octave_modifier}"
        if target in self.sounds:
            print(f"[AUDIO] 🎹 Playing: {target}")
            self.sounds[target].play()
        elif note_name in self.sounds:
            print(f"[AUDIO] 🎹 Playing (fallback): {note_name}")
            self.sounds[note_name].play()
        else:
            print(f"[AUDIO] ❌ Sound NOT FOUND: {note_name}")

# --- PHYSICS ENGINE ---
class HandPhysics:
    def __init__(self):
        self.prev_landmarks = {} # {hand_id: landmarks}
        self.last_strike_time = {} # {token: time}
        self.finger_can_hit = {}   # {token: True/False}
        self.cooldown = 0.15
        
        # DRUM-SPECIFIC: 4 booleans - one for each drum pad
        # True = finger is inside, False = finger is outside
        self.snare_inside = False
        self.hat_inside = False
        self.tom_inside = False
        self.kick_inside = False
        
        # Track previous Y positions for velocity smoothing (multiple frames)
        self.y_history = {}  # {token: [y1, y2, y3...]}
        self.history_size = 3
        
    def calculate_velocity(self, current_y, prev_y, dt):
        if dt <= 0: return 0
        return (current_y - prev_y) / dt
    
    def get_smoothed_velocity(self, token, current_y, dt):
        """Calculate velocity using averaged position history for stability"""
        if token not in self.y_history:
            self.y_history[token] = []
        
        history = self.y_history[token]
        history.append(current_y)
        
        # Keep only recent history
        if len(history) > self.history_size:
            history.pop(0)
        
        # Need at least 2 points for velocity
        if len(history) < 2:
            return 0
        
        # Velocity = change from oldest to newest
        oldest_y = history[0]
        newest_y = history[-1]
        frames = len(history) - 1
        
        # Normalized velocity (per frame, scaled by dt)
        return (newest_y - oldest_y) / (frames * max(dt, 0.016))

    def is_curled(self, landmarks, tip_idx, pip_idx):
        # Task API Object access: landmarks[i].x
        wrist = landmarks[0]
        tip = landmarks[tip_idx]
        pip = landmarks[pip_idx]
        
        d_wrist_tip = math.sqrt((wrist.x - tip.x)**2 + (wrist.y - tip.y)**2)
        d_wrist_pip = math.sqrt((wrist.x - pip.x)**2 + (wrist.y - pip.y)**2)
        
        return d_wrist_tip < d_wrist_pip
    
    def check_finger_in_pad(self, tip_x, tip_y, pad):
        """Check if a single finger is inside a pad zone. Returns True/False."""
        corner = pad.get('corner', '')
        rx = 0.45
        ry = 0.45
        
        # Determine corner position (normalized 0-1)
        if corner == 'top-left':
            corner_x, corner_y = 0, 0
        elif corner == 'top-right':
            corner_x, corner_y = 1, 0
        elif corner == 'bottom-left':
            corner_x, corner_y = 0, 1
        elif corner == 'bottom-right':
            corner_x, corner_y = 1, 1
        else:
            return False
        
        # Normalized distance from corner (ellipse formula)
        dx = (tip_x - corner_x) / rx
        dy = (tip_y - corner_y) / ry
        ellipse_dist = math.sqrt(dx*dx + dy*dy)
        
        return ellipse_dist < 1.0
    
    def update_drum_zones(self, all_finger_positions, pads):
        """
        Check ALL fingers against ALL pads, update booleans once per pad.
        Returns list of pads that were just entered (False -> True).
        """
        entered_pads = []
        
        for pad in pads:
            drum_name = pad['name']
            
            # Check if ANY finger is inside this pad
            any_finger_inside = False
            for tip_x, tip_y in all_finger_positions:
                if self.check_finger_in_pad(tip_x, tip_y, pad):
                    any_finger_inside = True
                    break
            
            # Get current boolean state
            if drum_name == 'SNARE':
                was_inside = self.snare_inside
                self.snare_inside = any_finger_inside
            elif drum_name == 'HAT':
                was_inside = self.hat_inside
                self.hat_inside = any_finger_inside
            elif drum_name == 'TOM':
                was_inside = self.tom_inside
                self.tom_inside = any_finger_inside
            elif drum_name == 'KICK':
                was_inside = self.kick_inside
                self.kick_inside = any_finger_inside
            else:
                continue
            
            # Check for entry (False -> True transition)
            if any_finger_inside and not was_inside:
                entered_pads.append(pad)
        
        return entered_pads

# --- GAME ENGINE (Waterfall) ---
class FallingNote:
    def __init__(self, finger_name, x_pos):
        self.finger_name = finger_name # e.g. "Left_Middle"
        self.x = x_pos
        self.y = 0
        self.speed = 0.015 # Vertical speed (normalized per frameish)
        self.active = True
        self.color = (np.random.randint(50, 255), np.random.randint(50, 255), np.random.randint(50, 255))

class GameEngine:
    def __init__(self):
        self.notes = []
        self.score = 0
        self.last_spawn = 0
        
        # Approximate Horizontal Positions for 10 fingers (0.0 to 1.0)
        # L_Pinky to R_Pinky
        self.lanes = {
            'Left_Pinky': 0.1, 'Left_Ring': 0.18, 'Left_Middle': 0.26, 'Left_Index': 0.34, 'Left_Thumb': 0.42,
            'Right_Thumb': 0.58, 'Right_Index': 0.66, 'Right_Middle': 0.74, 'Right_Ring': 0.82, 'Right_Pinky': 0.90
        }
        self.lane_keys = list(self.lanes.keys())

    def update(self):
        # Spawn
        if time.time() - self.last_spawn > 0.8: # new note every 0.8s
            target = np.random.choice(self.lane_keys)
            self.notes.append(FallingNote(target, self.lanes[target]))
            self.last_spawn = time.time()
            
        # Move
        for note in self.notes:
            note.y += note.speed
            
        # Cleanup
        self.notes = [n for n in self.notes if n.y < 1.1 and n.active]

    def check_hit(self, finger_token):
        # Token format: "{Hand}_{Finger}" e.g. "Left_Index"
        # Check if any note in this lane is in target zone (0.8 - 0.95)
        hit_anything = False
        for note in self.notes:
            if note.active and note.finger_name == finger_token:
                if 0.8 < note.y < 0.98:
                    note.active = False # Consumed
                    self.score += 10
                    hit_anything = True
                    return True
        return False

    def draw(self, image):
        h, w, c = image.shape
        
        # Draw Target Line
        y_target = int(0.9 * h)
        cv2.line(image, (0, y_target), (w, y_target), (100, 100, 100), 2)
        
        # Draw Notes
        for note in self.notes:
            if note.active:
                x = int(note.x * w)
                y = int(note.y * h)
                # Draw Rect
                cv2.rectangle(image, (x - 20, y - 40), (x + 20, y), note.color, -1)
                
        # Draw Score
        cv2.putText(image, f"SCORE: {self.score}", (50, 100), cv2.FONT_HERSHEY_SIMPLEX, 1.5, (255, 255, 255), 3)

# --- STREAMLIT APP ---

# CSS Styling - Dark Neon Theme
st.set_page_config(layout="wide", page_title="AR Instrument Studio", page_icon="🎹")

st.markdown("""
<style>
    /* Dark theme background */
    .stApp {
        background: linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 100%);
    }
    
    /* Sidebar styling */
    [data-testid="stSidebar"] {
        background: linear-gradient(180deg, #16213e 0%, #0f0f23 100%);
        border-right: 2px solid #00ff88;
    }
    
    /* Neon title */
    .stMarkdown h1 {
        color: #00ff88 !important;
        text-shadow: 0 0 10px #00ff88, 0 0 20px #00ff88;
    }
    
    /* Radio buttons */
    .stRadio > label {
        color: #ffffff !important;
        font-weight: bold;
    }
    
    /* Status text */
    .status-piano { color: #00ff88; font-size: 1.2em; }
    .status-drums { color: #ff6b6b; font-size: 1.2em; }
</style>
""", unsafe_allow_html=True)

# Check if embedded via URL query param
query_params = st.query_params
url_mode = query_params.get("mode", None)
# If mode is specified in URL, we're in embed mode (accessed via iframe)
embed_mode = url_mode is not None or query_params.get("embed", "false") == "true"

# Player mode - for guided song playback
player_mode = url_mode == "piano_player"
drums_player_mode = url_mode == "drums_player"
current_song = []
current_note_index = 0
expected_note = None
expected_drum = None

# Note to finger mapping (note letter -> (handedness, finger_name))
NOTE_TO_FINGER = {
    'C': ('Left', 'Pinky'),
    'D': ('Left', 'Ring'),
    'E': ('Left', 'Middle'),
    'F': ('Left', 'Index'),
    'G': ('Left', 'Thumb'),
    'A': ('Right', 'Thumb'),
    'B': ('Right', 'Index'),
}

# Drum pattern character to zone mapping
DRUM_CHAR_TO_ZONE = {
    'K': 'KICK',
    'S': 'SNARE',
    'T': 'TOM',
    'H': 'HAT',
}

# Load song if in piano player mode
if player_mode:
    song_name = query_params.get("song", "twinkle")
    song_path = f"music_files/{song_name}.txt"
    try:
        with open(song_path, 'r') as f:
            song_text = f.read()
            current_song = [n.upper() for n in song_text.split() if n.strip()]
            print(f"[PLAYER] Loaded song '{song_name}': {len(current_song)} notes")
    except:
        print(f"[PLAYER] Failed to load song: {song_path}")
        current_song = ['C', 'D', 'E', 'F', 'G', 'A', 'B']  # Default scale
    
    if 'player_note_index' not in st.session_state:
        st.session_state.player_note_index = 0
    
    # Initialize countdown timer
    if 'countdown_start' not in st.session_state:
        st.session_state.countdown_start = time.time()
    
    # Calculate countdown (3 second countdown)
    elapsed = time.time() - st.session_state.countdown_start
    countdown_remaining = 3 - int(elapsed)
    countdown_active = countdown_remaining > 0
    
    current_note_index = st.session_state.player_note_index
    expected_note = current_song[current_note_index] if current_note_index < len(current_song) else None
    
    # Song is active only after countdown and when there are notes left
    song_active = (not countdown_active) and (current_note_index < len(current_song))

# Load drum pattern if in drums player mode
elif drums_player_mode:
    song_name = query_params.get("song", "drums_basic_rock")
    song_path = f"music_files/{song_name}.txt"
    try:
        with open(song_path, 'r') as f:
            song_text = f.read()
            # Parse drum patterns: K=KICK, S=SNARE, T=TOM, skip rests (-)
            drum_chars = [c.upper() for c in song_text.split() if c.strip() and c.upper() in DRUM_CHAR_TO_ZONE]
            current_song = [DRUM_CHAR_TO_ZONE[c] for c in drum_chars]
            print(f"[DRUMS PLAYER] Loaded pattern '{song_name}': {len(current_song)} hits")
    except:
        print(f"[DRUMS PLAYER] Failed to load pattern: {song_path}")
        current_song = ['KICK', 'SNARE', 'KICK', 'SNARE']  # Default pattern
    
    if 'player_note_index' not in st.session_state:
        st.session_state.player_note_index = 0
    
    # Initialize countdown timer
    if 'countdown_start' not in st.session_state:
        st.session_state.countdown_start = time.time()
    
    # Calculate countdown
    elapsed = time.time() - st.session_state.countdown_start
    countdown_remaining = 3 - int(elapsed)
    countdown_active = countdown_remaining > 0
    
    current_note_index = st.session_state.player_note_index
    expected_drum = current_song[current_note_index] if current_note_index < len(current_song) else None
    
    song_active = (not countdown_active) and (current_note_index < len(current_song))
else:
    song_active = True  # Normal mode always plays sounds
    countdown_active = False
    countdown_remaining = 0

# If mode specified in URL, override radio selection
if url_mode == "piano" or url_mode == "piano_player":
    mode = "Piano (10-Finger)"
    # Get threshold from URL or default to 0.5
    url_threshold = query_params.get("threshold", None)
    if url_threshold is not None:
        try:
            velocity_threshold = float(url_threshold)
            print(f"[EMBED] Piano mode from URL, threshold: {velocity_threshold} (from URL)")
        except:
            velocity_threshold = 0.5
            print(f"[EMBED] Piano mode from URL, threshold: 0.5 (default, invalid URL param)")
    else:
        velocity_threshold = 0.5
        print(f"[EMBED] Piano mode from URL, threshold: 0.5 (default)")
elif url_mode == "drums" or url_mode == "drums_player":
    mode = "Air Drums (4-Zone)"
    # Get threshold from URL or default to 0.15
    url_threshold = query_params.get("threshold", None)
    if url_threshold is not None:
        try:
            velocity_threshold = float(url_threshold)
            print(f"[EMBED] Drums mode from URL, threshold: {velocity_threshold} (from URL)")
        except:
            velocity_threshold = 0.15
            print(f"[EMBED] Drums mode from URL, threshold: 0.15 (default, invalid URL param)")
    else:
        velocity_threshold = 0.15
        print(f"[EMBED] Drums mode from URL, threshold: 0.15 (default)")
else:
    # Normal mode - show sidebar controls
    mode = st.sidebar.radio("🎵 Instrument Mode", ["Piano (10-Finger)", "Air Drums (4-Zone)"])
    if mode == "Piano (10-Finger)":
        velocity_threshold = 0.5
        st.sidebar.markdown('<p class="status-piano">Piano Mode: Sensitivity 0.5</p>', unsafe_allow_html=True)
    else:
        velocity_threshold = 0.15
        st.sidebar.markdown('<p class="status-drums">Drums Mode: Sensitivity 0.15</p>', unsafe_allow_html=True)

print(f"[CONFIG] Mode: {mode}, Threshold: {velocity_threshold}, Embed: {embed_mode}")

# Embed mode: Hide sidebar and center content
if embed_mode:
    st.markdown("""
    <style>
        /* Hide sidebar completely in embed mode */
        [data-testid="stSidebar"] { display: none !important; }
        [data-testid="stSidebarCollapsedControl"] { display: none !important; }
        
        /* Remove padding and center content */
        .stMainBlockContainer { padding: 1rem !important; }
        .block-container { padding: 1rem !important; max-width: 1100px !important; margin: 0 auto !important; }
        header { display: none !important; }
        
        /* Hide checkbox in embed mode */
        .stCheckbox { display: none !important; }
        
        /* Hide deprecation warnings */
        .stAlert { display: none !important; }
        
        /* Center the image */
        .stImage { display: flex !important; justify-content: center !important; }
        .stImage > img { max-width: 1000px !important; width: 100% !important; height: auto !important; border-radius: 12px; }
    </style>
    
    <!-- Note broadcast script for piano player mode -->
    <script>
        // Listen for note events from Streamlit and forward to parent
        window.notePlayed = function(note) {
            if (window.parent !== window) {
                window.parent.postMessage({type: 'notePlayed', note: note}, '*');
            }
        };
    </script>
    """, unsafe_allow_html=True)

# Camera Scan (only show when not embedded)
if not embed_mode:
    if 'available_cameras' not in st.session_state:
        st.session_state.available_cameras = [0, 1]
    
    if st.sidebar.button("Scan Cameras"):
        found = []
        status = st.sidebar.empty()
        status.write("Scanning 10 indices...")
        for i in range(10):
            cap = cv2.VideoCapture(i)
            if cap.isOpened():
                found.append(i)
                cap.release()
        st.session_state.available_cameras = found
        status.write(f"Found: {found}")
    
    cam_idx = st.sidebar.selectbox("Select Camera Index", st.session_state.available_cameras, index=0)
    st.sidebar.caption("0 is usually Default/FaceTime. 1 is often External.")
    
    if st.sidebar.button("🔄 Reload Audio"):
        if 'audio' in st.session_state:
            del st.session_state.audio
        st.rerun()
    
    run = st.checkbox("Start Studio", value=True)
else:
    # Embedded mode: Always run, use camera 0
    cam_idx = 0
    run = True

# --- RECORDING CONTROLS (Composer Mode) ---
if embed_mode:
    # Initialize recorder in session state
    if 'recorder' not in st.session_state:
        st.session_state.recorder = MusicRecorder()
    if 'last_recording_file' not in st.session_state:
        st.session_state.last_recording_file = None
    
    recorder = st.session_state.recorder
    
    # Recording UI
    rec_cols = st.columns([1, 1, 1, 3])
    with rec_cols[0]:
        if not recorder.is_recording:
            if st.button("🔴 Record", use_container_width=True):
                recorder.start_recording()
                st.rerun()
        else:
            if st.button("⏹️ Stop", use_container_width=True):
                recorder.stop_recording()
                # Export the recording
                if 'audio' in st.session_state:
                    filepath = recorder.export_wav(st.session_state.audio)
                    st.session_state.last_recording_file = filepath
                st.rerun()
    
    with rec_cols[1]:
        if recorder.is_recording:
            st.markdown("🔴 **Recording...**")
        elif st.session_state.last_recording_file:
            # Provide download button
            try:
                with open(st.session_state.last_recording_file, 'rb') as f:
                    # Detect file type for correct MIME
                    mime = "audio/mpeg" if st.session_state.last_recording_file.endswith('.mp3') else "audio/wav"
                    st.download_button(
                        "⬇️ Download",
                        f,
                        file_name=os.path.basename(st.session_state.last_recording_file),
                        mime=mime,
                        use_container_width=True
                    )
            except:
                pass
    
    with rec_cols[2]:
        if recorder.is_recording:
            note_count = len(recorder.recorded_notes)
            st.markdown(f"📝 **{note_count}** notes")

# Layout - Full width camera for better visibility
frame_placeholder = st.image([])
status_log = st.empty() if embed_mode else st.sidebar.empty()
if not embed_mode:
    st.sidebar.markdown("### Status")


if run:
    # Init - Force reload audio if not all drums are loaded
    if 'audio' not in st.session_state:
        st.session_state.audio = AudioEngine()
        print(f"AudioEngine created with sounds: {list(st.session_state.audio.sounds.keys())}")
    
    # Check if drums are loaded, if not, reload
    audio = st.session_state.audio
    if 'SNARE' not in audio.sounds or 'KICK' not in audio.sounds:
        print("Drums missing! Reloading AudioEngine...")
        st.session_state.audio = AudioEngine()
        audio = st.session_state.audio
        print(f"Reloaded sounds: {list(audio.sounds.keys())}")
    
    if 'physics' not in st.session_state:
        st.session_state.physics = HandPhysics()
        
    physics = st.session_state.physics
    
    # MediaPipe Task API (MPS/GPU Supported)
    import mediapipe as mp
    from mediapipe.tasks import python
    from mediapipe.tasks.python import vision
    
    # Create an options object - using CPU (GPU crashes on macOS)
    base_options = python.BaseOptions(model_asset_path='hand_landmarker.task')
    options = vision.HandLandmarkerOptions(
        base_options=base_options,
        running_mode=vision.RunningMode.VIDEO,
        num_hands=2,
        min_hand_detection_confidence=0.6,
        min_hand_presence_confidence=0.6,
        min_tracking_confidence=0.6)
    detector = vision.HandLandmarker.create_from_options(options)
    
    mp_draw = mp.solutions.drawing_utils
    mp_hands_connections = mp.solutions.hands.HAND_CONNECTIONS
    
    cap = cv2.VideoCapture(cam_idx)
    # Balanced resolution for speed vs quality (original: 1280x800)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 960)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 540)
    
    # Load Keyboard Image
    keyboard_img = None
    try:
        # User provided path: /Users/aniruddhmodi/Documents/PycharmProjects/AirPlay/keyboard_one_octave (1).jpg
        # Try relative first if in project root
        kb_path = "keyboard_one_octave (1).jpg"
        if not os.path.exists(kb_path):
             # Try absolute if needed, or just let cv2 fail gracefully
             kb_path = "/Users/aniruddhmodi/Documents/PycharmProjects/AirPlay/keyboard_one_octave (1).jpg"
        
        if os.path.exists(kb_path):
            keyboard_img = cv2.imread(kb_path)
    except Exception as e:
        print(f"Failed to load keyboard: {e}")

    prev_time = time.time()
    last_timestamp_ms = 0 # Track last timestamp to ensure monotonicity
    
    # Init Game Engine
    if 'game' not in st.session_state:
        st.session_state.game = GameEngine()
    game = st.session_state.game
    
    def get_octave_zone(y):
        # 0=High, 1=Mid, 2=Low (equal thirds)
        if y < 0.33: return 0
        if y > 0.66: return 2
        return 1

    while run and cap.isOpened():
        ret, frame = cap.read()
        if not ret: break
        
        # Flip & Convert
        frame = cv2.flip(frame, 1) # Mirror
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Create MP Image
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
        
        # Detect
        # MediaPipe requires strict monotonically increasing timestamps.
        current_time_ms = int(time.time() * 1000)
        if current_time_ms <= last_timestamp_ms:
            current_time_ms = last_timestamp_ms + 1
        last_timestamp_ms = current_time_ms
        
        results = detector.detect_for_video(mp_image, current_time_ms)
        
        h, w, c = frame.shape
        current_time = time.time()
        dt = current_time - prev_time
        prev_time = current_time
        
        # Update countdown timer dynamically (for player mode)
        if player_mode:
            elapsed = current_time - st.session_state.countdown_start
            countdown_remaining = max(0, 3 - int(elapsed))
            countdown_active = countdown_remaining > 0
            song_active = (not countdown_active) and (st.session_state.player_note_index < len(current_song))
        
        annotated_image = frame.copy()
        
        # Define pads for drums - corner quarter circles (dark purple)
        # BGR format: dark purple = (128, 0, 128)
        DARK_PURPLE = (128, 0, 128)
        pads = [
            {'name': 'SNARE', 'corner': 'top-left',     'radius': 0.55, 'color': DARK_PURPLE},
            {'name': 'HAT',   'corner': 'top-right',    'radius': 0.55, 'color': DARK_PURPLE},
            {'name': 'TOM',   'corner': 'bottom-left',  'radius': 0.55, 'color': DARK_PURPLE},
            {'name': 'KICK',  'corner': 'bottom-right', 'radius': 0.55, 'color': DARK_PURPLE}
        ]
        
        # --- GAME VISUALS ---
        if mode == "Piano (10-Finger)":
             # DISABLED: Falling notes removed per user request
             # game.update()
             # game.draw(annotated_image)
             
             # Draw Octave Zones (Dotted Lines)
             # Top (High) | Mid (Normal) | Bottom (Low)
             line_1 = int(h * 0.33)
             line_2 = int(h * 0.66)
             
             # Draw Dotted Lines manually (Bright White/Neon)
             dot_spacing = 20
             for x in range(0, w, dot_spacing):
                 if x + 10 < w:
                     cv2.line(annotated_image, (x, line_1), (x + 10, line_1), (200, 200, 200), 2)
                     cv2.line(annotated_image, (x, line_2), (x + 10, line_2), (200, 200, 200), 2)
             
             cv2.putText(annotated_image, "HIGH OCTAVE", (10, line_1 - 10), cv2.FONT_HERSHEY_PLAIN, 1, (255, 255, 255), 1)
             cv2.putText(annotated_image, "MID OCTAVE",  (10, line_2 - 10), cv2.FONT_HERSHEY_PLAIN, 1, (255, 255, 255), 1)
             cv2.putText(annotated_image, "LOW OCTAVE",  (10, h - 160),      cv2.FONT_HERSHEY_PLAIN, 1, (255, 255, 255), 1)
             
             # ========== PLAYER MODE: Progress Display ==========
             if player_mode:
                 note_idx = st.session_state.get('player_note_index', 0)
                 total_notes = len(current_song)
                 
                 # Show countdown if active
                 if countdown_active and countdown_remaining > 0:
                     # Large countdown number
                     cv2.rectangle(annotated_image, (w//2 - 100, h//2 - 100), (w//2 + 100, h//2 + 100), (0, 0, 0), -1)
                     cv2.rectangle(annotated_image, (w//2 - 100, h//2 - 100), (w//2 + 100, h//2 + 100), (0, 255, 0), 4)
                     cv2.putText(annotated_image, str(countdown_remaining), (w//2 - 30, h//2 + 30), 
                                cv2.FONT_HERSHEY_SIMPLEX, 4, (0, 255, 0), 8)
                     cv2.putText(annotated_image, "GET READY!", (w//2 - 100, h//2 - 120), 
                                cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
                 elif note_idx < total_notes:
                     # Draw dark background box for text
                     cv2.rectangle(annotated_image, (w//2 - 120, 10), (w//2 + 120, 100), (0, 0, 0), -1)
                     cv2.rectangle(annotated_image, (w//2 - 120, 10), (w//2 + 120, 100), (0, 255, 0), 2)
                     
                     # Show current note prominently
                     next_note = current_song[note_idx]
                     cv2.putText(annotated_image, f"Play: {next_note}", (w//2 - 70, 55), 
                                cv2.FONT_HERSHEY_SIMPLEX, 1.3, (0, 255, 0), 3)
                     # Progress bar
                     progress = note_idx / total_notes
                     bar_width = 200
                     cv2.rectangle(annotated_image, (w//2 - 100, 70), (w//2 - 100 + bar_width, 85), (50, 50, 50), -1)
                     cv2.rectangle(annotated_image, (w//2 - 100, 70), (w//2 - 100 + int(bar_width * progress), 85), (0, 255, 0), -1)
                     cv2.putText(annotated_image, f"{note_idx + 1}/{total_notes}", (w//2 - 25, 95), 
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
                 else:
                     # Song complete! Show celebration
                     cv2.rectangle(annotated_image, (w//2 - 180, 20), (w//2 + 180, 90), (0, 100, 0), -1)
                     cv2.rectangle(annotated_image, (w//2 - 180, 20), (w//2 + 180, 90), (0, 255, 0), 3)
                     cv2.putText(annotated_image, "SONG COMPLETE!", (w//2 - 155, 70), 
                                cv2.FONT_HERSHEY_SIMPLEX, 1.3, (0, 255, 0), 3)

        # --- MODE B: DRUMS (Draw Zones) ---
        if mode == "Air Drums (4-Zone)":
            # Draw corner quarter OVALS with labels (dark purple)
            # Use different radii for x and y so they don't overlap
            rx = int(w * 0.45)  # Horizontal radius (45% of width)
            ry = int(h * 0.45)  # Vertical radius (45% of height)
            
            # Draw outer frame
            cv2.rectangle(annotated_image, (5, 5), (w-5, h-5), DARK_PURPLE, 3)
            
            # SNARE - top-left corner (quarter oval curving down-right)
            cv2.ellipse(annotated_image, (0, 0), (rx, ry), 0, 0, 90, DARK_PURPLE, 3)
            cv2.putText(annotated_image, "snare", (rx//4, ry//2), cv2.FONT_HERSHEY_SIMPLEX, 1, DARK_PURPLE, 2)
            
            # HAT - top-right corner (quarter oval curving down-left)
            cv2.ellipse(annotated_image, (w, 0), (rx, ry), 0, 90, 180, DARK_PURPLE, 3)
            cv2.putText(annotated_image, "hat", (w - rx//3 - 20, ry//2), cv2.FONT_HERSHEY_SIMPLEX, 1, DARK_PURPLE, 2)
            
            # TOM - bottom-left corner (quarter oval curving up-right)
            cv2.ellipse(annotated_image, (0, h), (rx, ry), 0, 270, 360, DARK_PURPLE, 3)
            cv2.putText(annotated_image, "tom", (rx//4, h - ry//2 + 10), cv2.FONT_HERSHEY_SIMPLEX, 1, DARK_PURPLE, 2)
            
            # KICK - bottom-right corner (quarter oval curving up-left)
            cv2.ellipse(annotated_image, (w, h), (rx, ry), 0, 180, 270, DARK_PURPLE, 3)
            cv2.putText(annotated_image, "kick", (w - rx//3 - 20, h - ry//2 + 10), cv2.FONT_HERSHEY_SIMPLEX, 1, DARK_PURPLE, 2)
            
            # ========== DRUMS PLAYER MODE: Highlight expected zone ==========
            if drums_player_mode:
                # Update countdown dynamically
                elapsed = time.time() - st.session_state.countdown_start
                countdown_remaining = max(0, 3 - int(elapsed))
                countdown_active = countdown_remaining > 0
                song_active = (not countdown_active) and (st.session_state.player_note_index < len(current_song))
                
                note_idx = st.session_state.get('player_note_index', 0)
                total_notes = len(current_song)
                expected_drum = current_song[note_idx] if note_idx < total_notes else None
                
                # Highlight the expected drum zone with green glow
                if expected_drum and not countdown_active:
                    GREEN_GLOW = (0, 255, 0)
                    thick = 8
                    if expected_drum == 'SNARE':
                        cv2.ellipse(annotated_image, (0, 0), (rx, ry), 0, 0, 90, GREEN_GLOW, thick)
                        cv2.putText(annotated_image, "HIT!", (rx//4, ry//2 - 30), cv2.FONT_HERSHEY_SIMPLEX, 1.2, GREEN_GLOW, 3)
                    elif expected_drum == 'HAT':
                        cv2.ellipse(annotated_image, (w, 0), (rx, ry), 0, 90, 180, GREEN_GLOW, thick)
                        cv2.putText(annotated_image, "HIT!", (w - rx//3 - 30, ry//2 - 30), cv2.FONT_HERSHEY_SIMPLEX, 1.2, GREEN_GLOW, 3)
                    elif expected_drum == 'TOM':
                        cv2.ellipse(annotated_image, (0, h), (rx, ry), 0, 270, 360, GREEN_GLOW, thick)
                        cv2.putText(annotated_image, "HIT!", (rx//4, h - ry//2 - 20), cv2.FONT_HERSHEY_SIMPLEX, 1.2, GREEN_GLOW, 3)
                    elif expected_drum == 'KICK':
                        cv2.ellipse(annotated_image, (w, h), (rx, ry), 0, 180, 270, GREEN_GLOW, thick)
                        cv2.putText(annotated_image, "HIT!", (w - rx//3 - 30, h - ry//2 - 20), cv2.FONT_HERSHEY_SIMPLEX, 1.2, GREEN_GLOW, 3)
                
                # Show countdown
                if countdown_active and countdown_remaining > 0:
                    cv2.rectangle(annotated_image, (w//2 - 100, h//2 - 100), (w//2 + 100, h//2 + 100), (0, 0, 0), -1)
                    cv2.rectangle(annotated_image, (w//2 - 100, h//2 - 100), (w//2 + 100, h//2 + 100), (0, 255, 0), 4)
                    cv2.putText(annotated_image, str(countdown_remaining), (w//2 - 30, h//2 + 30), 
                               cv2.FONT_HERSHEY_SIMPLEX, 4, (0, 255, 0), 8)
                    cv2.putText(annotated_image, "GET READY!", (w//2 - 100, h//2 - 120), 
                               cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
                elif note_idx < total_notes:
                    # Progress display
                    cv2.rectangle(annotated_image, (w//2 - 120, 10), (w//2 + 120, 100), (0, 0, 0), -1)
                    cv2.rectangle(annotated_image, (w//2 - 120, 10), (w//2 + 120, 100), (0, 255, 0), 2)
                    cv2.putText(annotated_image, f"Hit: {expected_drum}", (w//2 - 80, 55), 
                               cv2.FONT_HERSHEY_SIMPLEX, 1.1, (0, 255, 0), 3)
                    progress = note_idx / total_notes
                    bar_width = 200
                    cv2.rectangle(annotated_image, (w//2 - 100, 70), (w//2 - 100 + bar_width, 85), (50, 50, 50), -1)
                    cv2.rectangle(annotated_image, (w//2 - 100, 70), (w//2 - 100 + int(bar_width * progress), 85), (0, 255, 0), -1)
                    cv2.putText(annotated_image, f"{note_idx + 1}/{total_notes}", (w//2 - 25, 95), 
                               cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
                else:
                    # Pattern complete
                    cv2.rectangle(annotated_image, (w//2 - 180, 20), (w//2 + 180, 90), (0, 100, 0), -1)
                    cv2.rectangle(annotated_image, (w//2 - 180, 20), (w//2 + 180, 90), (0, 255, 0), 3)
                    cv2.putText(annotated_image, "PATTERN COMPLETE!", (w//2 - 175, 70), 
                               cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 255, 0), 3)

        # Initialize drum finger positions (before hand detection)
        all_drum_finger_positions = []
        
        # Initialize piano note candidates (velocity, sound, octave_mod, tip_position)
        # Collect all triggered notes and only play the highest velocity one
        note_candidates = []
        
        # Draw landmarks and Process
        if results.hand_landmarks:
            # --- GESTURE SAFETY CHECK (Pre-Pass) - PIANO MODE ONLY ---
            gesture_suppress = False
            if mode == "Piano (10-Finger)":
                total_down_fingers = 0
                
                for i, hand_landmarks in enumerate(results.hand_landmarks):
                    if results.handedness:
                        handedness_chk = results.handedness[i][0].category_name
                    else: 
                        handedness_chk = "Unknown"
                    hand_id_chk = f"{handedness_chk}_{i}"
                    
                    prev_lm_chk = physics.prev_landmarks.get(hand_id_chk)
                    if prev_lm_chk:
                        for tip_idx in [4, 8, 12, 16, 20]:
                            tip_y = hand_landmarks[tip_idx].y
                            prev_y = prev_lm_chk[tip_idx].y
                            v_y_chk = (tip_y - prev_y) / dt if dt > 0 else 0
                            if v_y_chk > velocity_threshold:
                                total_down_fingers += 1
                
                if total_down_fingers >= 8:
                    gesture_suppress = True
                    # Silently mute - no text display

            # Limit notes per frame to prevent spam
            notes_played_this_frame = 0
            MAX_NOTES_PER_FRAME = 3
            
            for i, hand_landmarks in enumerate(results.hand_landmarks):
                # Handedness check
                if results.handedness:
                    handedness = results.handedness[i][0].category_name # "Left" or "Right"
                else:
                    handedness = "Unknown"
                
                # --- PHYSICS UPDATE ---
                hand_id = f"{handedness}_{i}" 
                
                fingers_to_check = []
                if mode == "Piano (10-Finger)":
                    fingers_to_check = [
                        (4, 'Thumb'), (8, 'Index'), (12, 'Middle'), (16, 'Ring'), (20, 'Pinky')
                    ]
                else: # Drums - Use ALL fingertips like a real drummer!
                    fingers_to_check = [
                        (4, 'Thumb'), (8, 'Index'), (12, 'Middle'), (16, 'Ring'), (20, 'Pinky')
                    ]
                     
                prev_lm = physics.prev_landmarks.get(hand_id)

                for tip_idx, f_name in fingers_to_check:
                    # Accessing landmark object from Task API list
                    tip = hand_landmarks[tip_idx]
                    
                    # ========== PLAYER MODE: Highlight expected finger ==========
                    is_expected_finger = False
                    if player_mode and expected_note and expected_note in NOTE_TO_FINGER:
                        expected_hand, expected_finger = NOTE_TO_FINGER[expected_note]
                        # Check if this finger is the one expected
                        if handedness == expected_hand and f_name == expected_finger:
                            is_expected_finger = True
                            # Draw BIG glowing highlight for expected finger
                            tip_px = (int(tip.x * w), int(tip.y * h))
                            # Multiple outer rings for glow effect
                            cv2.circle(annotated_image, tip_px, 50, (0, 200, 0), 2)
                            cv2.circle(annotated_image, tip_px, 40, (0, 255, 0), 3)
                            cv2.circle(annotated_image, tip_px, 30, (0, 255, 0), 4)
                            # Inner filled circle with white border
                            cv2.circle(annotated_image, tip_px, 20, (0, 255, 0), -1)
                            cv2.circle(annotated_image, tip_px, 20, (255, 255, 255), 2)
                            # Note label with background
                            label = expected_note
                            label_x, label_y = tip_px[0] - 15, tip_px[1] - 60
                            cv2.rectangle(annotated_image, (label_x - 5, label_y - 30), (label_x + 35, label_y + 5), (0, 0, 0), -1)
                            cv2.putText(annotated_image, label, (label_x, label_y), 
                                       cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 255, 0), 3)
                    
                    # Draw Tip (small for piano, larger for drums)
                    if not is_expected_finger:
                        tip_color = (255, 255, 255) if mode == "Piano (10-Finger)" else (0, 255, 255)
                        tip_size = 6 if mode == "Piano (10-Finger)" else 17
                        cv2.circle(annotated_image, (int(tip.x * w), int(tip.y * h)), tip_size, tip_color, -1)

                    # ========== DRUM MODE: Collect finger positions ==========
                    if mode == "Air Drums (4-Zone)":
                        # Collect all finger positions for batch checking
                        all_drum_finger_positions.append((tip.x, tip.y))
                        
                        # Skip piano logic for drums (we'll check drums after all fingers are processed)
                        continue

                    # ========== PIANO MODE: Velocity-Based Detection ==========
                    # EXPLICIT CHECK: Only run piano code if in piano mode
                    if mode != "Piano (10-Finger)":
                        continue
                    # Velocity
                    v_y = 0
                    zone_changed = False
                    
                    if prev_lm:
                        prev_tip = prev_lm[tip_idx]
                        v_y = physics.calculate_velocity(tip.y, prev_tip.y, dt)
                        
                        # ZONE SAFETY CHECK
                        curr_zone = get_octave_zone(tip.y)
                        prev_zone = get_octave_zone(prev_tip.y)
                        if curr_zone != prev_zone:
                            zone_changed = True
                    
                    # Logic: State Machine Debounce
                    unique_token = f"{hand_id}_{f_name}"
                    
                    # default can_hit to True if not present
                    can_hit = physics.finger_can_hit.get(unique_token, True)
                    
                    # RE-ARMING: Strictly require Upward Motion to re-enable
                    if v_y < -0.02:
                        physics.finger_can_hit[unique_token] = True
                        can_hit = True
                        
                    is_hit = (v_y > velocity_threshold) and can_hit
                    
                    # SAFETY Checks (ONLY for Piano Mode)
                    if zone_changed: is_hit = False
                    if gesture_suppress: is_hit = False # Full mute for this frame
                    
                    if is_hit:
                        # DISARM immediately
                        physics.finger_can_hit[unique_token] = False
                        
                        # Trigger Sound
                        sound_to_play = None
                        
                        # NEW LOGIC: Map Hand/Finger to specific C1..E1 mapping
                        # Check game hit (Score)
                        did_score = game.check_hit(f"{handedness}_{f_name}")
                        if did_score:
                            cv2.putText(annotated_image, "+10", (int(tip.x*w), int(tip.y*h)-20), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                        
                        # Audio Map
                        map_key = f"{handedness}_{f_name}"
                        base_file_key = audio.finger_map.get(map_key)
                        
                        if base_file_key:
                            # Curl Check
                            pip_idx = tip_idx - 2
                            if physics.is_curled(hand_landmarks, tip_idx, pip_idx):
                               # Try sharp
                               sharp_key = f"{base_file_key}s"
                               if sharp_key in audio.sounds:
                                   sound_to_play = sharp_key
                               else:
                                   sound_to_play = base_file_key
                            else:
                                sound_to_play = base_file_key
                        
                        # Visual Flash (small for piano)
                        cv2.circle(annotated_image, (int(tip.x*w), int(tip.y*h)), 8, (0, 255, 0), -1)

                        if sound_to_play and song_active:
                            # Determine Octave Modifier
                            octave_mod = ""
                            if tip.y < 0.33:
                                octave_mod = "_high"
                            elif tip.y > 0.66:
                                octave_mod = "_low"
                            
                            # Add to candidates list with velocity (will play best one later)
                            note_candidates.append({
                                'velocity': v_y,
                                'sound': sound_to_play,
                                'octave_mod': octave_mod,
                                'tip_x': tip.x,
                                'tip_y': tip.y
                            })

                # Store current landmarks (List of objects, not Proto)
                physics.prev_landmarks[hand_id] = hand_landmarks

        # ========== PIANO MODE: Play only the BEST note candidate ==========
        if mode == "Piano (10-Finger)" and note_candidates:
            # Sort by velocity (highest first) and take only the best one
            best_note = max(note_candidates, key=lambda x: x['velocity'])
            sound_to_play = best_note['sound']
            octave_mod = best_note['octave_mod']
            
            print(f"Trigger (best of {len(note_candidates)}): {sound_to_play} v={best_note['velocity']:.3f}")
            
            # Check if this is the correct note for player mode
            note_letter = sound_to_play[0].upper()
            is_correct_note = not player_mode or (expected_note and note_letter == expected_note)
            
            # Play the sound
            audio.play(sound_to_play, octave_mod)
            
            # Record the note if recording is active
            if 'recorder' in st.session_state and st.session_state.recorder.is_recording:
                st.session_state.recorder.record_note(sound_to_play, octave_mod)
            
            # Broadcast note to parent window
            st.components.v1.html(f'<script>if(window.parent){{window.parent.postMessage({{type:"notePlayed",note:"{note_letter}"}},"*");}}</script>', height=0)
            
            # PLAYER MODE: Only advance if CORRECT note was played
            if player_mode and expected_note:
                if is_correct_note:
                    # Correct! Advance to next note
                    st.session_state.player_note_index += 1
                    if st.session_state.player_note_index < len(current_song):
                        expected_note = current_song[st.session_state.player_note_index]
                        print(f"[PLAYER] ✓ Correct! Next: {expected_note}")
                    else:
                        expected_note = None
                        song_active = False
                        print(f"[PLAYER] 🎉 Song complete!")
                else:
                    # Wrong note - show visual feedback
                    cv2.putText(annotated_image, "WRONG!", (w//2 - 80, h//2), 
                               cv2.FONT_HERSHEY_SIMPLEX, 2, (0, 0, 255), 4)
                    print(f"[PLAYER] ✗ Wrong! Expected {expected_note}, got {note_letter}")
            
            notes_played_this_frame += 1
            status_log.write(f"PLAYING: {sound_to_play}{octave_mod}")

        # ========== DRUM MODE: Check all pads once per frame ==========
        if mode == "Air Drums (4-Zone)":
            # Always check (even with empty list) to update booleans when fingers leave
            entered_pads = physics.update_drum_zones(all_drum_finger_positions, pads)
            
            for pad in entered_pads:
                # DRUM HIT! 
                drum_name = pad['name']
                print(f"DRUM HIT: {drum_name}")
                
                # Check if in drums_player mode
                if drums_player_mode:
                    # Get current expected drum
                    note_idx = st.session_state.get('player_note_index', 0)
                    expected = current_song[note_idx] if note_idx < len(current_song) else None
                    
                    # Check if song is active (after countdown)
                    elapsed = time.time() - st.session_state.countdown_start
                    is_song_active = elapsed >= 3 and note_idx < len(current_song)
                    
                    if is_song_active:
                        is_correct = (drum_name.upper() == expected)
                        
                        # Always play the sound (feedback)
                        audio.play(drum_name, "")
                        
                        if is_correct:
                            # Correct! Advance to next drum
                            st.session_state.player_note_index += 1
                            print(f"[DRUMS PLAYER] ✓ Correct! Next index: {st.session_state.player_note_index}")
                        else:
                            # Wrong drum - show visual feedback
                            cv2.putText(annotated_image, "WRONG!", (w//2 - 80, h//2), 
                                       cv2.FONT_HERSHEY_SIMPLEX, 2, (0, 0, 255), 4)
                            print(f"[DRUMS PLAYER] ✗ Wrong! Expected {expected}, got {drum_name}")
                else:
                    # Normal mode - just play sound
                    audio.play(drum_name, "")
                    # Record the drum hit if recording is active
                    if 'recorder' in st.session_state and st.session_state.recorder.is_recording:
                        st.session_state.recorder.record_note(drum_name, "")
                
                status_log.write(f"🥁 {drum_name} hit")
                
                # Visual Flash - filled quarter oval at corner
                rx_flash = int(w * 0.45)
                ry_flash = int(h * 0.45)
                corner = pad.get('corner', '')
                if corner == 'top-left':
                    cv2.ellipse(annotated_image, (0, 0), (rx_flash, ry_flash), 0, 0, 90, DARK_PURPLE, -1)
                elif corner == 'top-right':
                    cv2.ellipse(annotated_image, (w, 0), (rx_flash, ry_flash), 0, 90, 180, DARK_PURPLE, -1)
                elif corner == 'bottom-left':
                    cv2.ellipse(annotated_image, (0, h), (rx_flash, ry_flash), 0, 270, 360, DARK_PURPLE, -1)
                elif corner == 'bottom-right':
                    cv2.ellipse(annotated_image, (w, h), (rx_flash, ry_flash), 0, 180, 270, DARK_PURPLE, -1)

        frame_placeholder.image(annotated_image, channels="BGR", width=1000)

    cap.release()
