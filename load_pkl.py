"""Đọc tra_tam_sen_landing.pkl và (tuỳ chọn) giải nén ra thư mục."""

from __future__ import annotations

import argparse
import pickle
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DEFAULT_PKL = ROOT / "tra_tam_sen_landing.pkl"


def load(path: Path) -> dict:
  with path.open("rb") as f:
    return pickle.load(f)


def export_files(data: dict, out_dir: Path) -> None:
  out_dir.mkdir(parents=True, exist_ok=True)
  for rel, content in data["files"].items():
    target = out_dir / rel
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(content, encoding="utf-8")
  for name, blob in data["images"].items():
    (out_dir / name).write_bytes(blob)
  print(f"Đã giải nén vào: {out_dir}")


def main() -> None:
  parser = argparse.ArgumentParser(description="Load Trà Tâm Sen landing .pkl")
  parser.add_argument("--pkl", type=Path, default=DEFAULT_PKL)
  parser.add_argument("--extract", type=Path, help="Thư mục đích để giải nén")
  args = parser.parse_args()

  data = load(args.pkl)
  print(f"Brand: {data.get('brand')}")
  print(f"Exported: {data.get('exported_at')}")
  print(f"Sections: {len(data.get('sections', []))}")
  print(f"Images: {list(data.get('images', {}).keys())}")

  if args.extract:
    export_files(data, args.extract)


if __name__ == "__main__":
  main()
