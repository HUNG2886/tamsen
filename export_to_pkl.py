"""
Đóng gói landing page Trà Tâm Sen thành file .pkl (Python pickle).
Chạy: python export_to_pkl.py
"""

from __future__ import annotations

import pickle
import re
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "tra_tam_sen_landing.pkl"

TEXT_FILES = {
    "index.html": ROOT / "index.html",
    "css/styles.css": ROOT / "css" / "styles.css",
    "js/main.js": ROOT / "js" / "main.js",
}

IMAGE_GLOB = ("tam_sen_*.png",)


def extract_sections(html: str) -> list[dict]:
    """Tách các WC-SECTION từ HTML để dùng lại trong pipeline."""
    pattern = re.compile(
        r"<!--\s*WC-SECTION:\s*([^>]+)\s*-->\s*"
        r"(<(?:section|footer|aside)[^>]*data-section=\"([^\"]+)\"[^>]*>.*?"
        r"</(?:section|footer|aside)>)",
        re.DOTALL | re.IGNORECASE,
    )
    sections = []
    for m in pattern.finditer(html):
        sections.append(
            {
                "label": m.group(1).strip(),
                "data_section": m.group(3),
                "html": m.group(2).strip(),
            }
        )
    return sections


def main() -> None:
  files_text: dict[str, str] = {}
  for key, path in TEXT_FILES.items():
    if not path.is_file():
      raise FileNotFoundError(f"Thiếu file: {path}")
    files_text[key] = path.read_text(encoding="utf-8")

  images: dict[str, bytes] = {}
  for pattern in IMAGE_GLOB:
    for img_path in sorted(ROOT.glob(pattern)):
      images[img_path.name] = img_path.read_bytes()

  html = files_text["index.html"]
  payload = {
    "version": 1,
    "brand": "Trà Tâm Sen",
    "exported_at": datetime.now(timezone.utc).isoformat(),
    "source_dir": str(ROOT),
    "files": files_text,
    "images": images,
    "sections": extract_sections(html),
    "meta": {
      "title": "Trà Tâm Sen Thượng Hạng",
      "locale": "vi",
      "mobile_only": True,
      "max_width_px": 430,
      "colors": {
        "background": "#F7F1E5",
        "green": "#4A6741",
        "gold": "#B08D57",
        "wood": "#6B4F3A",
        "text": "#1E1B18",
      },
      "hotline": "0916188330",
    },
  }

  with OUTPUT.open("wb") as f:
    pickle.dump(payload, f, protocol=pickle.HIGHEST_PROTOCOL)

  size_mb = OUTPUT.stat().st_size / (1024 * 1024)
  print(f"Đã tạo: {OUTPUT}")
  print(f"  - {len(files_text)} file text")
  print(f"  - {len(images)} ảnh")
  print(f"  - {len(payload['sections'])} section")
  print(f"  - Kích thước: {size_mb:.2f} MB")


if __name__ == "__main__":
  main()
