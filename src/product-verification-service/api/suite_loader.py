import os
import yaml
from pathlib import Path

from models.suite_config import SuiteConfig


SUITES_DIR = Path(__file__).parent.parent / "suites"


def list_suites():
    suites = []
    if not SUITES_DIR.exists():
        return suites
    for f in sorted(SUITES_DIR.iterdir()):
        if f.suffix in (".yml", ".yaml"):
            with open(f) as fh:
                data = yaml.safe_load(fh)
            suites.append(SuiteConfig(**data))
    return suites


def get_suite(name):
    for f in SUITES_DIR.iterdir():
        if f.suffix in (".yml", ".yaml") and f.stem == name:
            with open(f) as fh:
                data = yaml.safe_load(fh)
            return SuiteConfig(**data)
    return None
