"""
MP3 to piano note list (audio transcription).
Outputs unified format: list of { "t": float, "note": str, "dur": float, "velocity": int }.
Uses librosa for onset + pitch (lightweight; no TensorFlow). For better quality, install basic_pitch.
"""
import re
from pathlib import Path
from typing import List, Dict, Any


def midi_pitch_to_name(midi_num: int) -> str:
    """Map MIDI note number (0-127) to note name (e.g. C4, F#3)."""
    if not 0 <= midi_num <= 127:
        return "C4"
    names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
    octave = midi_num // 12
    name = names[midi_num % 12]
    return f"{name}{octave}"


def transcribe_mp3_to_notes(mp3_path: Path, max_duration_sec: float = 600.0) -> List[Dict[str, Any]]:
    """
    Transcribe MP3 to a list of note events.
    Returns [ {"t": float, "note": str, "dur": float, "velocity": int}, ... ].
    Uses librosa onset + pitch (pyin) for a lightweight path. Install: pip install librosa soundfile.
    """
    try:
        import numpy as np
        import librosa
        import soundfile as sf
    except ImportError as e:
        raise RuntimeError(
            "Install librosa and soundfile: pip install librosa soundfile. "
            "For MP3 support you may need ffmpeg."
        ) from e

    mp3_path = Path(mp3_path)
    if not mp3_path.is_file():
        raise FileNotFoundError(f"File not found: {mp3_path}")

    # Load audio (librosa can read mp3 if ffmpeg is available; else use pydub to convert)
    try:
        y, sr = librosa.load(str(mp3_path), sr=22050, mono=True, duration=max_duration_sec)
    except Exception as e:
        # Fallback: convert mp3 to wav in memory via pydub if needed
        try:
            from pydub import AudioSegment
            seg = AudioSegment.from_mp3(str(mp3_path))[:int(max_duration_sec * 1000)]
            samples = np.array(seg.get_array_of_samples(), dtype=np.float32) / 32768.0
            if seg.channels == 2:
                samples = (samples[::2] + samples[1::2]) / 2
            sr = seg.frame_rate
            y = samples
        except Exception as e2:
            raise RuntimeError(f"Could not load audio: {e} / {e2}") from e2

    # Onset detection
    onset_frames = librosa.onset.onset_detect(y=y, sr=sr, delta=0.07, wait=10, units="frames")
    onset_times = librosa.frames_to_time(onset_frames, sr=sr)

    # Pitch per segment (between consecutive onsets)
    notes = []
    hop = 512
    for i, start_t in enumerate(onset_times):
        start_sample = int(start_t * sr)
        if i + 1 < len(onset_times):
            end_t = onset_times[i + 1]
        else:
            end_t = min(start_t + 0.5, len(y) / sr)
        end_sample = min(int(end_t * sr), len(y))
        if end_sample <= start_sample + hop:
            continue
        segment = y[start_sample:end_sample]

        # Pitch tracking (pyin is more accurate but slower; use piptrack for speed)
        try:
            f0, voiced_flag, _ = librosa.pyin(
                segment, fmin=librosa.note_to_hz("C2"), fmax=librosa.note_to_hz("C7"),
                sr=sr, frame_length=2048, hop_length=hop
            )
            pitch = np.nanmedian(f0[voiced_flag]) if np.any(voiced_flag) else np.nan
        except Exception:
            pitch = np.nan

        if not np.isnan(pitch) and pitch > 0:
            midi = int(round(librosa.hz_to_midi(pitch)))
            midi = max(0, min(127, midi))
            note_name = midi_pitch_to_name(midi)
            dur = end_t - start_t
            dur = max(0.05, min(2.0, dur))
            notes.append({
                "t": float(start_t),
                "note": note_name,
                "dur": round(dur, 3),
                "velocity": 80,
            })

    return notes
