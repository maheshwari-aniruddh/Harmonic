"""
Small Flask API for music_files: list songs, get song JSON, upload MP3 (transcribe to notes).
Run on port 8766 so Streamlit and frontend can call it.
"""
import os
import json
import re
from pathlib import Path
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)
MUSIC_DIR = Path(__file__).resolve().parent / "music_files"
MUSIC_DIR.mkdir(exist_ok=True)
UPLOAD_DIR = Path(__file__).resolve().parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
ALLOWED_MP3 = {"mp3"}
ALLOWED_MIDI = {"mid", "midi"}


def allowed_file(filename, ext_set=None):
    ext_set = ext_set or ALLOWED_MP3
    return "." in filename and filename.rsplit(".", 1)[-1].lower() in ext_set


def slug_from_filename(filename):
    """Safe filename without extension for use as song id."""
    name = Path(filename).stem
    slug = re.sub(r"[^\w\-]", "_", name).strip("_") or "imported"
    return slug[:80]


@app.route("/api/songs", methods=["GET"])
def list_songs():
    """List available song ids (from .txt and .json in music_files)."""
    ids = set()
    if MUSIC_DIR.is_dir():
        for f in MUSIC_DIR.iterdir():
            if f.suffix.lower() in (".txt", ".json") and f.stem:
                ids.add(f.stem)
    return jsonify({"songs": sorted(ids)})


@app.route("/api/songs/<song_id>", methods=["GET"])
def get_song(song_id):
    """Get song content. Prefer .json (unified format); fallback .txt as simple note list."""
    song_id = secure_filename(song_id)
    if not song_id:
        return jsonify({"error": "Invalid song id"}), 400
    # Prefer JSON
    json_path = MUSIC_DIR / f"{song_id}.json"
    if json_path.is_file():
        try:
            with open(json_path, "r") as f:
                data = json.load(f)
            return jsonify(data)
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    txt_path = MUSIC_DIR / f"{song_id}.txt"
    if txt_path.is_file():
        try:
            with open(txt_path, "r") as f:
                lines = [n.strip() for n in f.read().split() if n.strip()]
            # Convert to unified format: t in ms as simple sequence
            notes = [{"t": i * 500.0 / 1000.0, "note": n.upper(), "dur": 0.5, "velocity": 80} for i, n in enumerate(lines)]
            return jsonify({"notes": notes, "bpm": 120})
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "Not found"}), 404


@app.route("/api/upload-mp3", methods=["POST"])
def upload_mp3():
    """Accept MP3 file, transcribe to notes, save as music_files/<slug>.json."""
    if "file" not in request.files:
        return jsonify({"error": "No file"}), 400
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No filename"}), 400
    if not allowed_file(file.filename, ALLOWED_MP3):
        return jsonify({"error": "Only MP3 allowed"}), 400

    slug = slug_from_filename(file.filename)
    temp_path = UPLOAD_DIR / f"{slug}.mp3"
    try:
        file.save(str(temp_path))
    except Exception as e:
        return jsonify({"error": f"Save failed: {e}"}), 500

    try:
        from audio_transcribe import transcribe_mp3_to_notes
        notes = transcribe_mp3_to_notes(temp_path)
    except Exception as e:
        temp_path.unlink(missing_ok=True)
        return jsonify({"error": f"Transcription failed: {e}"}), 500
    finally:
        temp_path.unlink(missing_ok=True)

    if not notes:
        return jsonify({"error": "No notes detected in audio"}), 400

    out_path = MUSIC_DIR / f"{slug}.json"
    duration_sec = notes[-1]["t"] + notes[-1]["dur"] if notes else 0
    data = {"notes": notes, "bpm": 120}
    try:
        with open(out_path, "w") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        return jsonify({"error": f"Write failed: {e}"}), 500

    return jsonify({
        "filename": f"{slug}.json",
        "song_id": slug,
        "notes": notes,
        "duration_sec": round(duration_sec, 2),
        "note_count": len(notes),
    })


@app.route("/api/upload-midi", methods=["POST"])
def upload_midi():
    """Accept MIDI file, parse to notes, save as music_files/<slug>.json."""
    if "file" not in request.files:
        return jsonify({"error": "No file"}), 400
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No filename"}), 400
    if not allowed_file(file.filename, ALLOWED_MIDI):
        return jsonify({"error": "Only .mid / .midi allowed"}), 400

    slug = slug_from_filename(file.filename)
    temp_path = UPLOAD_DIR / f"{slug}.mid"
    try:
        file.save(str(temp_path))
    except Exception as e:
        return jsonify({"error": f"Save failed: {e}"}), 500

    try:
        from midi_parser import parse_midi_to_unified_json
        data = parse_midi_to_unified_json(temp_path, min_interval_sec=0.08)
        notes = data.get("notes", [])
    except Exception as e:
        temp_path.unlink(missing_ok=True)
        return jsonify({"error": f"MIDI parse failed: {e}"}), 500
    finally:
        temp_path.unlink(missing_ok=True)

    if not notes:
        return jsonify({"error": "No notes in MIDI (or only percussion)"}), 400

    out_path = MUSIC_DIR / f"{slug}.json"
    duration_sec = notes[-1]["t"] + notes[-1].get("dur", 0.25) if notes else 0
    try:
        with open(out_path, "w") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        return jsonify({"error": f"Write failed: {e}"}), 500

    return jsonify({
        "filename": f"{slug}.json",
        "song_id": slug,
        "notes": notes,
        "duration_sec": round(duration_sec, 2),
        "note_count": len(notes),
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8766, debug=False)
