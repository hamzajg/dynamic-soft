import os
import re
import subprocess

from .models import Frame


def extract_frames(video_path, output_dir, interval=5, max_frames=20):
    os.makedirs(output_dir, exist_ok=True)

    for f in os.listdir(output_dir):
        if f.endswith(".jpg"):
            os.remove(os.path.join(output_dir, f))

    if not os.path.exists(video_path):
        raise FileNotFoundError(f"Video not found: {video_path}")

    pattern = os.path.join(output_dir, "frame_%04d.jpg")

    cmd = [
        "ffmpeg", "-i", video_path,
        "-vf", f"fps=1/{interval}",
        "-frames:v", str(max_frames),
        "-q:v", "2",
        "-y", pattern,
    ]

    result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    if result.returncode != 0:
        raise RuntimeError(f"ffmpeg failed: {result.stderr.strip()}")

    frames = []
    for f in sorted(os.listdir(output_dir)):
        if f.endswith(".jpg"):
            fp = os.path.join(output_dir, f)
            m = re.search(r"frame_(\d+)\.jpg$", f)
            if m:
                frame_num = int(m.group(1))
                ts = (frame_num - 1) * interval
                frames.append(Frame(path=fp, timestamp_seconds=float(ts)))

    return frames


def get_video_duration(video_path):
    try:
        result = subprocess.run(
            [
                "ffprobe", "-v", "error",
                "-show_entries", "format=duration",
                "-of", "csv=p=0", video_path,
            ],
            capture_output=True, text=True, timeout=30,
        )
        return float(result.stdout.strip())
    except (ValueError, subprocess.TimeoutExpired, FileNotFoundError):
        return 0.0
