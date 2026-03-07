"""
Parse MIDI files to unified note sequence (time_sec, note_name, velocity).
Skips percussion (channel 9 / is_drum). Optional min-interval thinning for dense MIDI.
"""
from pathlib import Path
from typing import Optional


def midi_note_to_name(midi_note: int) -> str:
    """Map MIDI note number 0-127 to note name e.g. C4, G#5."""
    names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
    return names[midi_note % 12] + str(midi_note // 12)


def parse_midi_to_sequence(
    path: Path,
    min_interval_sec: Optional[float] = 0.08,
    skip_percussion: bool = True,
) -> list[tuple[float, str, int]]:
    """
    Parse MIDI file to list of (time_sec, note_name, velocity).
    Filters out channel 10 (percussion) if skip_percussion.
    Optionally enforces min_interval_sec between note onsets (thinning).
    """
    try:
        import pretty_midi
    except ImportError:
        raise ImportError("pretty_midi is required: pip install pretty_midi")

    midi = pretty_midi.PrettyMIDI(str(path))
    events = []

    for instrument in midi.instruments:
        if skip_percussion and instrument.is_drum:
            continue
        for note in instrument.notes:
            t = float(note.start)
            name = midi_note_to_name(note.pitch)
            v = getattr(note, "velocity", 0.8)
            vel = int(max(0, min(127, v * 127 if v <= 1 else v)))
            events.append((t, name, vel))

    events.sort(key=lambda x: (x[0], x[1]))

    if min_interval_sec and min_interval_sec > 0:
        thinned = []
        last_t = -min_interval_sec - 1
        for t, name, vel in events:
            if t - last_t >= min_interval_sec:
                thinned.append((t, name, vel))
                last_t = t
        events = thinned

    return events


def parse_midi_to_unified_json(
    path: Path,
    min_interval_sec: Optional[float] = 0.08,
    bpm: int = 120,
) -> dict:
    """
    Parse MIDI to unified format: { "notes": [ {"t", "note", "dur", "velocity"} ], "bpm" }.
    """
    seq = parse_midi_to_sequence(path, min_interval_sec=min_interval_sec)
    notes = []
    for t, note_name, vel in seq:
        notes.append({
            "t": round(t, 4),
            "note": note_name,
            "dur": 0.25,
            "velocity": vel,
        })
    return {"notes": notes, "bpm": bpm}
