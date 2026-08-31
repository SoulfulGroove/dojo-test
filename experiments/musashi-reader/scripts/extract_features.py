#!/usr/bin/env python3
"""First-pass deterministic feature extractor for the Musashi paragraph corpus.

Reads ../data/corpus.json and writes derived character-level learning data.
It never edits the canonical corpus.

v0.1 deliberately limits itself to features that can be extracted without
linguistic interpretation:
  - hiragana
  - katakana
  - CJK ideographs (kanji/han characters)
  - first occurrence by paragraph
  - frequency and paragraph coverage
  - per-paragraph new vs previously encountered inventories

Grammar, particles, vocabulary, readings, and sentence segmentation belong to
later reviewed annotation layers.
"""

from __future__ import annotations

import argparse
import json
import sys
from collections import Counter, defaultdict
from pathlib import Path
from typing import Dict, Iterable, List, Tuple


SCRIPT_DIR = Path(__file__).resolve().parent
DEFAULT_CORPUS = SCRIPT_DIR.parent / "data" / "corpus.json"
DEFAULT_OUT_DIR = SCRIPT_DIR.parent / "data" / "features"


def is_hiragana(ch: str) -> bool:
    cp = ord(ch)
    return 0x3040 <= cp <= 0x309F


def is_katakana(ch: str) -> bool:
    cp = ord(ch)
    return (
        0x30A0 <= cp <= 0x30FF
        or 0x31F0 <= cp <= 0x31FF
        or 0xFF66 <= cp <= 0xFF9D
    )


def is_kanji(ch: str) -> bool:
    cp = ord(ch)
    return (
        0x3400 <= cp <= 0x4DBF      # CJK Extension A
        or 0x4E00 <= cp <= 0x9FFF   # CJK Unified Ideographs
        or 0xF900 <= cp <= 0xFAFF   # CJK Compatibility Ideographs
        or 0x20000 <= cp <= 0x2EBEF # Extensions B-F + later unified ranges
        or 0x30000 <= cp <= 0x323AF # Extension G/H range
    )


def classify(ch: str) -> str | None:
    if is_hiragana(ch):
        return "hiragana"
    if is_katakana(ch):
        return "katakana"
    if is_kanji(ch):
        return "kanji"
    return None


def char_id(script: str, ch: str) -> str:
    """Stable, non-sequential machine ID derived from Unicode code point."""
    prefix = {"hiragana": "HIRA", "katakana": "KATA", "kanji": "KANJI"}[script]
    return f"{prefix}-U+{ord(ch):04X}"


def unique_in_order(chars: Iterable[str]) -> List[str]:
    seen = set()
    out: List[str] = []
    for ch in chars:
        if ch not in seen:
            seen.add(ch)
            out.append(ch)
    return out


def validate_paragraphs(paragraphs: List[dict]) -> List[str]:
    errors: List[str] = []
    ids = [p.get("paragraph_id") for p in paragraphs]

    if len(ids) != len(set(ids)):
        dupes = sorted(pid for pid, count in Counter(ids).items() if count > 1)
        errors.append(f"Duplicate paragraph IDs: {dupes}")

    expected = [f"P{i:03d}" for i in range(len(paragraphs))]
    if ids != expected:
        missing = sorted(set(expected) - set(ids))
        unexpected = sorted(set(ids) - set(expected))
        errors.append(
            "Paragraph sequence is not contiguous from P000. "
            f"Missing={missing}; unexpected={unexpected}"
        )

    for p in paragraphs:
        for key in ("paragraph_id", "scroll_id", "section_id", "text"):
            if key not in p:
                errors.append(f"{p.get('paragraph_id', '<unknown>')} missing {key}")

    return errors


def extract(corpus: dict) -> Tuple[dict, Dict[str, List[dict]], dict]:
    paragraphs = corpus.get("paragraphs", [])
    validation_errors = validate_paragraphs(paragraphs)
    if validation_errors:
        raise ValueError("\n".join(validation_errors))

    scripts = ("hiragana", "katakana", "kanji")
    seen = {script: set() for script in scripts}
    global_counts = {script: Counter() for script in scripts}
    paragraph_sets = {script: defaultdict(set) for script in scripts}
    first_seen: Dict[str, Dict[str, dict]] = {script: {} for script in scripts}

    paragraph_features: List[dict] = []

    for p in paragraphs:
        pid = p["paragraph_id"]
        pidx = p["paragraph_index"]
        text = p["text"]

        chars_by_script: Dict[str, List[str]] = {script: [] for script in scripts}
        for ch in text:
            script = classify(ch)
            if script:
                chars_by_script[script].append(ch)

        feature = {
            "paragraph_id": pid,
            "paragraph_index": pidx,
            "scroll_id": p["scroll_id"],
            "section_id": p["section_id"],
            "source_line_start": p.get("source_line_start"),
            "source_line_end": p.get("source_line_end"),
            "scripts": {},
        }

        for script in scripts:
            chars = chars_by_script[script]
            counts = Counter(chars)
            unique = unique_in_order(chars)
            new = [ch for ch in unique if ch not in seen[script]]
            review = [ch for ch in unique if ch in seen[script]]

            for ch in chars:
                global_counts[script][ch] += 1
                paragraph_sets[script][ch].add(pid)
                if ch not in first_seen[script]:
                    first_seen[script][ch] = {
                        "paragraph_id": pid,
                        "paragraph_index": pidx,
                        "scroll_id": p["scroll_id"],
                        "section_id": p["section_id"],
                    }

            seen[script].update(unique)

            feature["scripts"][script] = {
                "total_count": len(chars),
                "unique_count": len(unique),
                "new_count": len(new),
                "review_count": len(review),
                "unique_in_order": unique,
                "new_in_order": new,
                "review_in_order": review,
                "counts": [
                    {
                        "character": ch,
                        "character_id": char_id(script, ch),
                        "count": counts[ch],
                    }
                    for ch in unique
                ],
                "cumulative_unique_count": len(seen[script]),
            }

        paragraph_features.append(feature)

    registries: Dict[str, List[dict]] = {}
    for script in scripts:
        chars_sorted = sorted(
            global_counts[script],
            key=lambda ch: (
                first_seen[script][ch]["paragraph_index"],
                ord(ch),
            ),
        )
        registries[script] = [
            {
                "character_id": char_id(script, ch),
                "character": ch,
                "codepoint": f"U+{ord(ch):04X}",
                "first_seen": first_seen[script][ch],
                "total_occurrences": global_counts[script][ch],
                "paragraph_count": len(paragraph_sets[script][ch]),
                "paragraphs": sorted(
                    paragraph_sets[script][ch],
                    key=lambda pid: int(pid[1:]),
                ),
            }
            for ch in chars_sorted
        ]

    summary = {
        "extractor_version": "0.1.0",
        "source": corpus.get("source", {}),
        "segmentation_level": corpus.get("segmentation_level"),
        "paragraph_count": len(paragraphs),
        "first_paragraph_id": paragraphs[0]["paragraph_id"] if paragraphs else None,
        "last_paragraph_id": paragraphs[-1]["paragraph_id"] if paragraphs else None,
        "totals": {
            script: {
                "unique_characters": len(registries[script]),
                "character_occurrences": sum(global_counts[script].values()),
            }
            for script in scripts
        },
        "scope_note": (
            "Character-level extraction only. A visible kana character is not automatically "
            "classified as a grammatical particle. Grammar, vocabulary, readings, and word "
            "segmentation require a separate reviewed linguistic annotation layer."
        ),
    }

    output = {
        "extractor_version": "0.1.0",
        "source": corpus.get("source", {}),
        "paragraph_features": paragraph_features,
    }
    return output, registries, summary


def write_json(path: Path, data: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--corpus", type=Path, default=DEFAULT_CORPUS)
    parser.add_argument("--out-dir", type=Path, default=DEFAULT_OUT_DIR)
    args = parser.parse_args()

    corpus = json.loads(args.corpus.read_text(encoding="utf-8"))
    try:
        features, registries, summary = extract(corpus)
    except ValueError as exc:
        print(f"Validation failed:\n{exc}", file=sys.stderr)
        return 1

    write_json(args.out_dir / "paragraph_features.json", features)
    write_json(args.out_dir / "hiragana.json", registries["hiragana"])
    write_json(args.out_dir / "katakana.json", registries["katakana"])
    write_json(args.out_dir / "kanji.json", registries["kanji"])
    write_json(args.out_dir / "corpus_stats.json", summary)

    print("Musashi corpus feature extraction complete")
    print(f"Paragraphs: {summary['paragraph_count']}")
    for script, stats in summary["totals"].items():
        print(
            f"{script}: {stats['unique_characters']} unique / "
            f"{stats['character_occurrences']} occurrences"
        )
    print(f"Output: {args.out_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
