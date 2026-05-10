#!/usr/bin/env python3
import argparse
import os
import sys
from datetime import datetime

from .config import AnalysisConfig
from .pipeline import run_analysis


def parse_args(argv=None):
    p = argparse.ArgumentParser(
        description="Analyze e2e test recordings with AI",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=(
            "Examples:\n"
            "  %(prog)s --video recording.webm --log test.log\n"
            "  %(prog)s --video recording.webm --log test.log --mode discovery\n"
            "  %(prog)s --video recording.webm --log test.log --mode both\n"
            "  %(prog)s --video recording.webm --log test.log --mode discovery --ux-model opencode/gpt-5.1-codex\n"
        ),
    )
    p.add_argument("--video", required=True, help="Path to .webm recording")
    p.add_argument("--log", required=True, help="Path to .log file")
    p.add_argument("--model", help=f"Model override (default: {AnalysisConfig.OPENCODE_MODEL})")
    p.add_argument("--frame-interval", type=int,
                    help=f"Seconds between frames (default: {AnalysisConfig.FRAME_INTERVAL})")
    p.add_argument("--max-frames", type=int,
                    help=f"Max frames to extract (default: {AnalysisConfig.MAX_FRAMES})")
    p.add_argument("--analyzer", choices=["opencode", "ollama"],
                    help=f"Analyzer backend (default: {AnalysisConfig.ANALYZER})")
    p.add_argument("--frame-analyzer", choices=["ollama", "opencode"],
                    help=f"Frame analyzer backend (default: {AnalysisConfig.FRAME_ANALYZER_BACKEND})")
    p.add_argument("--frame-analyzer-model",
                    help=f"Frame analyzer vision model (default: {AnalysisConfig.FRAME_ANALYZER_MODEL})")
    p.add_argument("--ollama-model", help=f"Ollama model (default: {AnalysisConfig.OLLAMA_MODEL})")
    p.add_argument("--model-compare", action="store_true",
                    help="Compare all Ollama vision models on the same frames")
    p.add_argument("--output", help="Output report path")
    p.add_argument("--mode", choices=["validation", "discovery", "both"],
                    help=f"Analysis mode (default: {AnalysisConfig.MODE})")
    p.add_argument("--ux-model",
                    help=f"Delegated UX model (default: {AnalysisConfig.UX_MODEL or 'same as --model'})")
    p.add_argument("--opencode-flags",
                    help=f"Extra flags for opencode (default: '{AnalysisConfig.OPENCODE_FLAGS}')")
    return p.parse_args(argv)


def _resolve_latest(base_dir, suffix):
    files = [f for f in os.listdir(base_dir) if f.endswith(suffix)]
    if not files:
        return None
    return os.path.join(base_dir, sorted(files)[-1])


def main(argv=None):
    args = parse_args(argv)

    video = args.video
    log = args.log

    if not os.path.exists(video):
        print(f"Video not found: {video}", file=sys.stderr)
        return 1
    if not os.path.exists(log):
        print(f"Log not found: {log}", file=sys.stderr)
        return 1

    model = args.model
    analyzer_type = args.analyzer or AnalysisConfig.ANALYZER
    frame_analyzer_backend = args.frame_analyzer or AnalysisConfig.FRAME_ANALYZER_BACKEND
    frame_analyzer_model = args.frame_analyzer_model
    ollama_model = args.ollama_model
    extra_flags = args.opencode_flags.split() if args.opencode_flags else None
    mode = args.mode or AnalysisConfig.MODE
    if args.ux_model:
        AnalysisConfig.UX_MODEL = args.ux_model

    if args.frame_interval:
        AnalysisConfig.FRAME_INTERVAL = args.frame_interval
    if args.max_frames:
        AnalysisConfig.MAX_FRAMES = args.max_frames

    if args.model_compare:
        if frame_analyzer_backend != "ollama":
            print("--model-compare requires --frame-analyzer ollama", file=sys.stderr)
            return 1
        models = ["llava", "qwen2.5-vl", "minicpm-v"]
        from .extract_frames import extract_frames
        from .frame_analyzer import OllamaFrameAnalyzer
        frames = extract_frames(video, AnalysisConfig.FRAME_DIR,
                                AnalysisConfig.FRAME_INTERVAL,
                                AnalysisConfig.MAX_FRAMES)
        comparator = OllamaFrameAnalyzer(model=ollama_model)
        comparison = comparator.compare_models(frames, models)
        out = args.output or os.path.join(
            AnalysisConfig.REPORT_DIR,
            f"model_compare_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md",
        )
        os.makedirs(os.path.dirname(out), exist_ok=True)
        with open(out, "w") as f:
            f.write(comparison)
        print(f"\nModel comparison saved to: {out}")
        return 0

    final_model = ollama_model if analyzer_type == "ollama" else model
    result = run_analysis(
        video_path=video,
        log_path=log,
        analyzer_type=analyzer_type,
        model=final_model,
        extra_flags=extra_flags,
        output_path=args.output,
        frame_analyzer_backend=frame_analyzer_backend,
        frame_analyzer_model=frame_analyzer_model,
        mode=mode,
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
