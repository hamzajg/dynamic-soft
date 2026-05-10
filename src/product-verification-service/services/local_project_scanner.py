import os
import json
import subprocess
from pathlib import Path
from typing import List, Optional, Tuple
from models.local_project import TestFile, TestFramework, ScanResult


class LocalProjectScanner:
    """Scans a local project folder for E2E tests."""

    def scan(self, project_path: str) -> ScanResult:
        path = Path(project_path).resolve()
        
        if not path.exists():
            raise ValueError(f"Path does not exist: {project_path}")
        
        if not path.is_dir():
            raise ValueError(f"Path is not a directory: {project_path}")

        framework, config_path = self._detect_framework(path)
        test_files = self._discover_tests(path, framework)

        # Fallback: if detected framework found 0 tests, try UNKNOWN patterns
        if len(test_files) == 0 and framework != TestFramework.UNKNOWN:
            fallback = self._discover_tests(path, TestFramework.UNKNOWN)
            if fallback:
                test_files = fallback

        return ScanResult(
            path=str(path),
            framework=framework,
            test_files=test_files,
            test_count=len(test_files),
            config_found=config_path is not None,
            config_path=config_path
        )

    def _detect_framework(self, path: Path) -> Tuple[TestFramework, Optional[str]]:
        """Detect test framework by looking for config files."""
        
        # Check for Playwright
        for config_name in ["playwright.config.js", "playwright.config.ts", 
                           "playwright.config.mjs", "playwright.config.json"]:
            config_path = path / config_name
            if config_path.exists():
                return TestFramework.PLAYWRIGHT, str(config_path)

        # Check for Cypress
        for config_name in ["cypress.config.js", "cypress.config.ts", 
                           "cypress.json", "cypress.config.mjs"]:
            config_path = path / config_name
            if config_path.exists():
                return TestFramework.CYPRESS, str(config_path)

        # Check for Vitest
        for config_name in ["vitest.config.js", "vitest.config.ts", "vitest.config.mjs"]:
            config_path = path / config_name
            if config_path.exists():
                return TestFramework.VITEST, str(config_path)

        # Check for Python-based Playwright (e2e/ directory with pytest + playwright)
        e2e_dir = path / "e2e"
        if e2e_dir.exists() and e2e_dir.is_dir():
            e2e_pytest_ini = e2e_dir / "pytest.ini"
            e2e_conftest = e2e_dir / "conftest.py"
            e2e_requirements = e2e_dir / "requirements.txt"
            if (e2e_pytest_ini.exists() or e2e_conftest.exists()) and e2e_requirements.exists():
                with open(e2e_requirements) as f:
                    if "playwright" in f.read():
                        return TestFramework.PLAYWRIGHT, str(
                            e2e_conftest if e2e_conftest.exists() else e2e_pytest_ini
                        )

        # Also check root-level pytest.ini with playwright dependency
        pytest_ini = path / "pytest.ini"
        requirements = path / "requirements.txt"
        if pytest_ini.exists() and requirements.exists():
            with open(requirements) as f:
                if "playwright" in f.read():
                    return TestFramework.PLAYWRIGHT, str(pytest_ini)

        # Check for Jest
        for config_name in ["jest.config.js", "jest.config.ts", "jest.config.json"]:
            config_path = path / config_name
            if config_path.exists():
                return TestFramework.JEST, str(config_path)

        return TestFramework.UNKNOWN, None

    def _discover_tests(self, path: Path, framework: TestFramework) -> List[TestFile]:
        """Discover test files based on framework patterns."""
        test_files = []

        if framework == TestFramework.PLAYWRIGHT:
            test_files.extend(self._find_by_pattern(path, "**/*.spec.{ts,js,mjs}"))
            test_files.extend(self._find_by_pattern(path, "**/*.test.{ts,js,mjs}"))
            # Also discover Python Playwright tests
            test_files.extend(self._find_by_pattern(path, "**/test_*.py"))
            test_files.extend(self._find_by_pattern(path, "**/tests/test_*.py"))
            test_files.extend(self._find_by_pattern(path, "**/e2e/test_*.py"))
            # Normalize paths to relative
            base_path_str = str(path)
            for test in test_files:
                if test.path.startswith(base_path_str):
                    rel = test.path[len(base_path_str) + 1:]
                    if rel.startswith('/'):
                        rel = rel[1:]
                    test.path = rel
            # Deduplicate
            seen = set()
            unique = []
            for tf in test_files:
                if tf.path not in seen:
                    seen.add(tf.path)
                    unique.append(tf)
            return unique

        elif framework == TestFramework.CYPRESS:
            test_files.extend(self._find_by_pattern(path, "cypress/e2e/**/*.{cy,spec}.{ts,js}"))
            test_files.extend(self._find_by_pattern(path, "cypress/integration/**/*.{ts,js}"))
            return test_files

        elif framework in [TestFramework.VITEST, TestFramework.JEST]:
            test_files.extend(self._find_by_pattern(path, "**/*.test.{ts,js,tsx,jsx}"))
            test_files.extend(self._find_by_pattern(path, "**/*.spec.{ts,js,tsx,jsx}"))
            # Also check for common test directories
            test_files.extend(self._find_by_pattern(path, "tests/**/*.test.{ts,js,tsx,jsx}"))
            test_files.extend(self._find_by_pattern(path, "tests/**/*.spec.{ts,js,tsx,jsx}"))
            test_files.extend(self._find_by_pattern(path, "test/**/*.test.{ts,js,tsx,jsx}"))
            test_files.extend(self._find_by_pattern(path, "test/**/*.spec.{ts,js,tsx,jsx}"))
            test_files.extend(self._find_by_pattern(path, "__tests__/**/*.test.{ts,js,tsx,jsx}"))
            test_files.extend(self._find_by_pattern(path, "__tests__/**/*.spec.{ts,js,tsx,jsx}"))
            # Deduplicate
            seen = set()
            unique = []
            for tf in test_files:
                if tf.path not in seen:
                    seen.add(tf.path)
                    unique.append(tf)
            return unique

        # Generic fallback
        test_files.extend(self._find_by_pattern(path, "**/*e2e*.{ts,js}"))
        test_files.extend(self._find_by_pattern(path, "**/e2e/**/*.{ts,js}"))
        test_files.extend(self._find_by_pattern(path, "**/tests/**/*.{ts,js}"))
        # Also check for Python test files
        # Also check for Python test files
        python_tests = self._find_by_pattern(path, "**/test_*.py")
        python_tests.extend(self._find_by_pattern(path, "**/tests/test_*.py"))
        python_tests.extend(self._find_by_pattern(path, "**/e2e/test_*.py"))
        
        # Convert absolute paths to relative paths for the test runner
        base_path_str = str(path)
        for test in python_tests:
            if test.path.startswith(base_path_str):
                test.path = test.path[len(base_path_str) + 1:]
                if test.path.startswith('/'):
                    test.path = test.path[1:]
        
        test_files.extend(python_tests)
        return test_files

    SKIP_DIRS = {"node_modules", ".venv", "venv", ".git", "__pycache__", ".pytest_cache",
                  ".kilo", ".opencode", ".idea", ".vscode", "dist", "build", ".next", ".cache"}

    def _find_by_pattern(self, base_path: Path, pattern: str) -> List[TestFile]:
        """Find files matching glob pattern."""
        import fnmatch
        
        test_files = []
        parts = pattern.split("/")
        
        # Simple glob matching
        for root, dirs, files in os.walk(base_path):
            root_path = Path(root)
            
            # Skip known non-project directories
            parts_list = root_path.parts
            if any(skip in parts_list for skip in self.SKIP_DIRS):
                continue
            # Skip Python virtual environment site-packages
            if "site-packages" in parts_list:
                continue
            
            rel_root = root_path.relative_to(base_path)
            rel_parts = list(rel_root.parts) if str(rel_root) != "." else []
            
            for file in files:
                file_path = root_path / file
                rel_path = str(file_path.relative_to(base_path))
                
                # Check if matches pattern
                if self._match_glob(rel_path, pattern):
                    test_files.append(TestFile(
                        path=str(file_path),
                        name=file
                    ))
        
        return test_files

    def _match_glob(self, path: str, pattern: str) -> bool:
        """Simple glob matching."""
        import fnmatch
        
        # Normalize pattern
        if pattern.startswith("**/"):
            suffix = pattern[3:]
            return fnmatch.fnmatch(path, suffix) or fnmatch.fnmatch(os.path.basename(path), suffix)
        
        return fnmatch.fnmatch(path, pattern)
