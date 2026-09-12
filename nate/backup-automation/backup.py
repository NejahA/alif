#!/usr/bin/env python3
"""
Backup Automation Script
========================
A flexible backup script for files and directories with compression,
logging, scheduling, and rotation support.

Usage:
    python backup.py              # Run a single backup using config.json
    python backup.py --config custom_config.json
    python backup.py --source /path/to/source --dest /path/to/destination
    python backup.py --schedule   # Run in scheduled mode
    python backup.py --list       # List available backups
"""

import argparse
import json
import logging
import os
import shutil
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import List, Optional

try:
    import zipfile
except ImportError:
    zipfile = None


# ──────────────────────────── Configuration ────────────────────────────

DEFAULT_CONFIG_PATH = Path(__file__).parent / "config.json"

DEFAULT_CONFIG = {
    "source_directories": [],
    "backup_destination": str(Path.home() / "Backups"),
    "backup_name_prefix": "backup",
    "compression": {"enabled": True, "format": "zip"},
    "exclude_patterns": ["__pycache__", "*.tmp", "*.log", "node_modules", ".git"],
    "schedule": {"enabled": False, "interval_hours": 24, "max_backups": 10},
    "logging": {"enabled": True, "log_file": "backup.log", "verbose": False},
}


def load_config(config_path: Path = DEFAULT_CONFIG_PATH) -> dict:
    """Load configuration from a JSON file, falling back to defaults."""
    if config_path.exists():
        with open(config_path, "r") as f:
            user_config = json.load(f)
        # Merge with defaults so missing keys are filled in
        merged = {**DEFAULT_CONFIG, **user_config}
        for key in DEFAULT_CONFIG:
            if isinstance(DEFAULT_CONFIG[key], dict) and key in user_config:
                merged[key] = {**DEFAULT_CONFIG[key], **user_config[key]}
        return merged
    else:
        print(f"[WARN] Config file not found: {config_path}. Using defaults.")
        return dict(DEFAULT_CONFIG)


# ──────────────────────────── Logging ────────────────────────────


def setup_logging(config: dict) -> logging.Logger:
    """Set up logging based on configuration."""
    logger = logging.getLogger("backup")
    logger.setLevel(logging.DEBUG if config["logging"].get("verbose") else logging.INFO)

    formatter = logging.Formatter(
        "%(asctime)s | %(levelname)-8s | %(message)s", datefmt="%Y-%m-%d %H:%M:%S"
    )

    # Console handler
    ch = logging.StreamHandler(sys.stdout)
    ch.setLevel(logging.DEBUG if config["logging"].get("verbose") else logging.INFO)
    ch.setFormatter(formatter)
    logger.addHandler(ch)

    # File handler
    if config["logging"].get("enabled"):
        log_path = Path(config["logging"].get("log_file", "backup.log"))
        if not log_path.is_absolute():
            log_path = Path(config["backup_destination"]) / log_path
        log_path.parent.mkdir(parents=True, exist_ok=True)
        fh = logging.FileHandler(log_path, encoding="utf-8")
        fh.setLevel(logging.DEBUG)
        fh.setFormatter(formatter)
        logger.addHandler(fh)

    return logger


# ──────────────────────────── Backup Logic ────────────────────────────


def should_exclude(name: str, exclude_patterns: List[str]) -> bool:
    """Check if a file/directory name matches any exclude pattern."""
    import fnmatch

    for pattern in exclude_patterns:
        if fnmatch.fnmatch(name, pattern):
            return True
    return False


def collect_files(
    source_dir: Path, exclude_patterns: List[str], logger: logging.Logger
) -> List[Path]:
    """Recursively collect files from source_dir, respecting exclude patterns."""
    files = []
    if not source_dir.exists():
        logger.warning(f"Source directory does not exist: {source_dir}")
        return files
    if not source_dir.is_dir():
        logger.warning(f"Source path is not a directory: {source_dir}")
        return files

    for entry in source_dir.rglob("*"):
        # Check if any part of the path matches an exclude pattern
        if any(should_exclude(part.name, exclude_patterns) for part in entry.relative_to(source_dir).parents):
            continue
        if should_exclude(entry.name, exclude_patterns):
            continue
        if entry.is_file():
            files.append(entry)

    return files


def create_backup_name(prefix: str) -> str:
    """Generate a timestamped backup name."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    return f"{prefix}_{timestamp}"


def copy_backup(
    files: List[Path],
    source_dir: Path,
    dest_dir: Path,
    backup_name: str,
    compression: dict,
    logger: logging.Logger,
) -> Optional[Path]:
    """Copy or compress files to the backup destination."""
    dest_dir.mkdir(parents=True, exist_ok=True)

    if compression.get("enabled") and compression.get("format") == "zip":
        return _create_zip_backup(files, source_dir, dest_dir, backup_name, logger)
    else:
        return _create_folder_backup(files, source_dir, dest_dir, backup_name, logger)


def _create_zip_backup(
    files: List[Path],
    source_dir: Path,
    dest_dir: Path,
    backup_name: str,
    logger: logging.Logger,
) -> Optional[Path]:
    """Create a compressed ZIP backup."""
    zip_path = dest_dir / f"{backup_name}.zip"
    logger.info(f"Creating ZIP backup: {zip_path}")

    try:
        with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
            for file_path in files:
                arcname = str(file_path.relative_to(source_dir))
                zf.write(file_path, arcname)
        logger.info(f"ZIP backup created: {zip_path} ({_get_size(zip_path)} bytes)")
        return zip_path
    except Exception as e:
        logger.error(f"Failed to create ZIP backup: {e}")
        return None


def _create_folder_backup(
    files: List[Path],
    source_dir: Path,
    dest_dir: Path,
    backup_name: str,
    logger: logging.Logger,
) -> Optional[Path]:
    """Create a simple folder copy backup."""
    backup_path = dest_dir / backup_name
    logger.info(f"Creating folder backup: {backup_path}")

    try:
        backup_path.mkdir(parents=True, exist_ok=True)
        for file_path in files:
            rel_path = file_path.relative_to(source_dir)
            target = backup_path / rel_path
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(file_path, target)
        logger.info(f"Folder backup created: {backup_path}")
        return backup_path
    except Exception as e:
        logger.error(f"Failed to create folder backup: {e}")
        return None


def _get_size(path: Path) -> int:
    """Get file size in bytes."""
    return path.stat().st_size


# ──────────────────────────── Backup Rotation ────────────────────────────


def rotate_backups(
    dest_dir: Path, prefix: str, max_backups: int, logger: logging.Logger
) -> None:
    """Remove oldest backups exceeding max_backups count."""
    if max_backups <= 0:
        return

    backups = _list_backups(dest_dir, prefix)
    if len(backups) <= max_backups:
        return

    # Sort by creation time (oldest first)
    backups.sort(key=lambda p: p.stat().st_ctime)
    to_remove = backups[: len(backups) - max_backups]

    for backup_path in to_remove:
        try:
            if backup_path.is_dir():
                shutil.rmtree(backup_path)
            else:
                backup_path.unlink()
            logger.info(f"Removed old backup: {backup_path}")
        except Exception as e:
            logger.error(f"Failed to remove old backup {backup_path}: {e}")


def _list_backups(dest_dir: Path, prefix: str) -> List[Path]:
    """List all backup files/directories matching the prefix."""
    backups = []
    if not dest_dir.exists():
        return backups

    for entry in dest_dir.iterdir():
        if entry.name.startswith(prefix) and not entry.suffix == ".log":
            backups.append(entry)
    return backups


# ──────────────────────────── Main Backup Function ────────────────────────────


def run_backup(config: dict, logger: logging.Logger) -> bool:
    """Execute a single backup operation. Returns True on success."""
    source_dirs = config.get("source_directories", [])
    if not source_dirs:
        logger.error("No source directories configured. Nothing to back up.")
        return False

    dest_dir = Path(config["backup_destination"])
    prefix = config.get("backup_name_prefix", "backup")
    exclude_patterns = config.get("exclude_patterns", [])
    compression = config.get("compression", {"enabled": True, "format": "zip"})

    backup_name = create_backup_name(prefix)
    all_files = []
    total_size = 0

    for src in source_dirs:
        src_path = Path(src)
        logger.info(f"Scanning source: {src_path}")
        files = collect_files(src_path, exclude_patterns, logger)
        all_files.extend((src_path, f) for f in files)
        total_size += sum(f.stat().st_size for f in files)
        logger.info(f"  Found {len(files)} files in {src_path}")

    if not all_files:
        logger.warning("No files found to back up.")
        return False

    logger.info(f"Total files to back up: {len(all_files)} ({total_size} bytes)")

    # Create a combined backup directory structure
    combined_dir = dest_dir / f"{backup_name}_temp"
    combined_dir.mkdir(parents=True, exist_ok=True)

    try:
        for src_path, file_path in all_files:
            rel_path = file_path.relative_to(src_path)
            # Prefix with source directory name to avoid collisions
            target = combined_dir / src_path.name / rel_path
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(file_path, target)

        # Now back up the combined directory
        result = copy_backup(
            list(combined_dir.rglob("*")),
            combined_dir,
            dest_dir,
            backup_name,
            compression,
            logger,
        )

        # Clean up temp directory
        shutil.rmtree(combined_dir, ignore_errors=True)

        if result:
            # Rotate old backups
            max_backups = config.get("schedule", {}).get("max_backups", 0)
            if max_backups > 0:
                rotate_backups(dest_dir, prefix, max_backups, logger)
            return True
        return False

    except Exception as e:
        logger.error(f"Backup failed: {e}")
        shutil.rmtree(combined_dir, ignore_errors=True)
        return False


# ──────────────────────────── Scheduled Mode ────────────────────────────


def run_scheduled(config: dict, logger: logging.Logger) -> None:
    """Run backup on a schedule (loop with interval)."""
    interval = config.get("schedule", {}).get("interval_hours", 24)
    logger.info(f"Starting scheduled mode. Interval: {interval} hours")

    while True:
        logger.info("=" * 50)
        logger.info("Starting scheduled backup...")
        success = run_backup(config, logger)
        if success:
            logger.info("Scheduled backup completed successfully.")
        else:
            logger.warning("Scheduled backup completed with issues.")

        logger.info(f"Next backup in {interval} hour(s). Press Ctrl+C to stop.")
        try:
            time.sleep(interval * 3600)
        except KeyboardInterrupt:
            logger.info("Scheduled mode stopped by user.")
            break


# ──────────────────────────── List Backups ────────────────────────────


def list_backups(config: dict) -> None:
    """List all existing backups."""
    dest_dir = Path(config["backup_destination"])
    prefix = config.get("backup_name_prefix", "backup")

    if not dest_dir.exists():
        print("No backup destination directory found.")
        return

    backups = _list_backups(dest_dir, prefix)
    if not backups:
        print("No backups found.")
        return

    print(f"\n{'Backup Name':<50} {'Type':<8} {'Size':<12} {'Created':<20}")
    print("-" * 90)
    for bp in sorted(backups, key=lambda p: p.stat().st_ctime, reverse=True):
        size = bp.stat().st_size if bp.is_file() else _dir_size(bp)
        btype = "ZIP" if bp.suffix == ".zip" else "Folder"
        created = datetime.fromtimestamp(bp.stat().st_ctime).strftime("%Y-%m-%d %H:%M:%S")
        print(f"{bp.name:<50} {btype:<8} {size:<12} {created:<20}")
    print()


def _dir_size(path: Path) -> int:
    """Calculate total size of a directory."""
    total = 0
    for f in path.rglob("*"):
        if f.is_file():
            total += f.stat().st_size
    return total


# ──────────────────────────── CLI Entry Point ────────────────────────────


def parse_args() -> argparse.Namespace:
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(
        description="Backup Automation Script - backup files and directories.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python backup.py                        Run backup with config.json
  python backup.py --config myconfig.json Use a custom config file
  python backup.py --source /data --dest /backups  Quick backup with inline args
  python backup.py --schedule             Run in scheduled mode
  python backup.py --list                 List existing backups
        """,
    )
    parser.add_argument(
        "--config",
        type=str,
        default=None,
        help="Path to configuration JSON file (default: config.json in script directory)",
    )
    parser.add_argument(
        "--source",
        type=str,
        action="append",
        dest="sources",
        help="Source directory(s) to back up (can be used multiple times)",
    )
    parser.add_argument(
        "--dest",
        type=str,
        default=None,
        help="Backup destination directory",
    )
    parser.add_argument(
        "--schedule",
        action="store_true",
        help="Run in scheduled mode (uses interval from config)",
    )
    parser.add_argument(
        "--list",
        action="store_true",
        help="List existing backups and exit",
    )
    parser.add_argument(
        "--verbose",

        action="store_true",
        help="Enable verbose logging",
    )
    return parser.parse_args()


def main() -> None:
    """Main entry point."""
    args = parse_args()

    # Load config
    config_path = Path(args.config) if args.config else DEFAULT_CONFIG_PATH
    config = load_config(config_path)

    # Override config with CLI arguments
    if args.sources:
        config["source_directories"] = args.sources
    if args.dest:
        config["backup_destination"] = args.dest
    if args.verbose:
        config["logging"]["verbose"] = True

    # Setup logging
    logger = setup_logging(config)

    logger.info("Backup Automation Script")
    logger.info(f"Config: {config_path}")

    # Handle --list
    if args.list:
        list_backups(config)
        return

    # Handle --schedule
    if args.schedule:
        run_scheduled(config, logger)
        return

    # Run a single backup
    success = run_backup(config, logger)
    if success:
        logger.info("Backup completed successfully.")
        sys.exit(0)
    else:
        logger.error("Backup failed.")
        sys.exit(1)


if __name__ == "__main__":
    main()
    