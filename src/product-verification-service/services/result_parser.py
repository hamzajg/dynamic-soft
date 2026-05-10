import json
import re
from pathlib import Path
from typing import Optional
from models.local_project import TestFramework
from core.database import db


def parse_pytest_output(log_path: Path) -> Optional[dict]:
    """Parse pytest verbose (-v) output into structured results."""
    text = log_path.read_text()
    lines = text.splitlines()

    test_pattern = re.compile(r'^(.+?)::(\w+)\s+(PASSED|FAILED|ERROR|SKIPPED|XPASS|XFAIL)\s+\[')
    summary_pattern = re.compile(r'^=+\s+(?:(\d+) passed)?(?:,?\s*(\d+) failed)?(?:,?\s*(\d+) skipped)?(?:,?\s*(\d+) errors)?\s+in\s+([\d.]+)([ms])\s+=+$')

    individual = []
    total = 0
    passed = 0
    failed_count = 0
    errors = 0
    duration_ms = 0

    for line in lines:
        m = test_pattern.match(line)
        if m:
            name = m.group(2)
            status = m.group(3)
            individual.append({"name": name, "status": status.lower()})
            total += 1
            if status == "PASSED":
                passed += 1
            elif status == "FAILED":
                failed_count += 1
            elif status == "ERROR":
                errors += 1

    for line in lines:
        m = summary_pattern.match(line)
        if m:
            p = int(m.group(1)) if m.group(1) else 0
            f = int(m.group(2)) if m.group(2) else 0
            s = int(m.group(3)) if m.group(3) else 0
            e = int(m.group(4)) if m.group(4) else 0
            dur_val = float(m.group(5))
            dur_unit = m.group(6)
            duration_ms = int(dur_val * 1000) if dur_unit == "s" else int(dur_val)
            if total == 0:
                total = p + f + e + s
                passed = p
                failed_count = f
                errors = e
            break

    if total == 0:
        return None

    return {
        "total": total,
        "passed": passed,
        "failed": failed_count,
        "errors": errors,
        "duration_ms": duration_ms,
        "results": individual
    }


def write_results_json(log_path: Path, output_dir: Path, framework: TestFramework):
    """Parse raw test runner log and write structured results.json."""
    if not log_path.exists():
        return

    results = {"framework": framework.value, "total": 0, "passed": 0, "failed": 0, "errors": 0, "duration_ms": 0, "results": []}

    if framework == TestFramework.PLAYWRIGHT:
        parsed = parse_pytest_output(log_path)
        if parsed:
            results.update(parsed)

    if results["total"] == 0:
        return

    (output_dir / "results.json").write_text(json.dumps(results, indent=2))


def parse_results(output_dir: Path, framework: TestFramework, passed: bool) -> dict:
    """Parse test results from output. Tries results.json first, then test-results.json, then falls back to return code."""
    results = {
        "passed": 0,
        "failed": 0,
        "total": 0,
        "duration_ms": 0,
        "framework": framework.value
    }

    results_json = output_dir / "results.json"
    if results_json.exists():
        try:
            with open(results_json) as f:
                data = json.load(f)
                results["total"] = data.get("total", 0)
                results["passed"] = data.get("passed", 0)
                results["failed"] = data.get("failed", 0)
                results["duration_ms"] = data.get("duration_ms", 0)
            return results
        except Exception:
            pass

    json_output = output_dir / "test-results.json"
    if json_output.exists():
        try:
            with open(json_output) as f:
                data = json.load(f)
                if framework == TestFramework.PLAYWRIGHT:
                    results["total"] = data.get("stats", {}).get("tests", 0)
                    results["passed"] = data.get("stats", {}).get("passed", 0)
                    results["failed"] = data.get("stats", {}).get("failed", 0)
                elif framework == TestFramework.JEST:
                    results["total"] = data.get("numTotalTests", 0)
                    results["passed"] = data.get("numPassedTests", 0)
                    results["failed"] = data.get("numFailedTests", 0)
        except Exception:
            pass

    if results["total"] == 0:
        results["total"] = 1
        results["passed"] = 1 if passed else 0
        results["failed"] = 0 if passed else 1

    return results


async def store_test_results(run_id: str, test_label: str, status: str, results: dict, output_dir: str):
    await db.insert_test_result(
        run_id=run_id,
        test_file=test_label,
        status=status,
        passed=results.get("passed", 0),
        failed=results.get("failed", 0),
        total=results.get("total", 0),
        duration_ms=results.get("duration_ms", 0),
        output_dir=output_dir
    )
