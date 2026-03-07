"""
Onboarding calibration: noise floor, hand span, tap threshold.
Stores result in user_profile.json for HandPhysics and main app.
"""
import json
import math
from pathlib import Path
from typing import Optional

PROFILE_PATH = Path(__file__).resolve().parent / "user_profile.json"
DEFAULT_PROFILE = {
    "velocity_threshold_piano": 0.5,
    "velocity_threshold_drums": 0.15,
    "hand_span_left": 0.2,
    "hand_span_right": 0.21,
    "key_scale_factor": 1.1,
}


def load_profile() -> Optional[dict]:
    """Load user_profile.json if it exists."""
    if not PROFILE_PATH.is_file():
        return None
    try:
        with open(PROFILE_PATH, "r") as f:
            return json.load(f)
    except Exception:
        return None


def save_profile(profile: dict) -> None:
    """Write user_profile.json."""
    with open(PROFILE_PATH, "w") as f:
        json.dump(profile, f, indent=2)


def write_default_profile() -> None:
    """Write default profile (e.g. when user skips calibration)."""
    save_profile(DEFAULT_PROFILE.copy())


def compute_noise_floor(velocities: list[float], percentile: float = 90) -> float:
    """Compute noise floor from list of velocity magnitudes (e.g. abs velocity). Use percentile."""
    if not velocities:
        return 0.05
    sorted_v = sorted(abs(v) for v in velocities)
    idx = min(int(len(sorted_v) * percentile / 100), len(sorted_v) - 1)
    return max(0.02, sorted_v[idx] + 0.05)


def compute_hand_span(landmarks) -> float:
    """Euclidean distance wrist (0) to middle fingertip (12) in normalized coords."""
    if landmarks is None or len(landmarks) < 13:
        return 0.2
    w = landmarks[0]
    m = landmarks[12]
    return math.sqrt((w.x - m.x) ** 2 + (w.y - m.y) ** 2)
