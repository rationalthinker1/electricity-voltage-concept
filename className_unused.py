from __future__ import annotations

from collections import defaultdict
from pathlib import Path
import re

ROOT = Path(".")
CSS_PATH = Path("src/styles/main.css")
REPORT_PATH = Path("main_css_single_component_classes.md")

SOURCE_EXTENSIONS = {".tsx", ".ts", ".jsx", ".js", ".html"}
SKIP_DIRS = {"node_modules", ".git", "dist", "build"}


def line_no(text: str, index: int) -> int:
    return text.count("\n", 0, index) + 1


def find_matching_brace(text: str, open_index: int) -> int | None:
    """Return the index of the matching closing brace for text[open_index]."""
    depth = 0
    quote: str | None = None
    escaped = False

    for i in range(open_index, len(text)):
        ch = text[i]

        if quote is not None:
            if escaped:
                escaped = False
                continue
            if ch == "\\":
                escaped = True
                continue
            if ch == quote:
                quote = None
            continue

        if ch in {"'", '"', "`"}:
            quote = ch
            continue

        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return i

    return None


def strip_css_comments_preserve_lines(css_text: str) -> str:
    return re.sub(
        r"/\*.*?\*/",
        lambda match: "\n" * match.group(0).count("\n"),
        css_text,
        flags=re.S,
    )


def collect_css_classes(css_path: Path) -> dict[str, int]:
    css_text = css_path.read_text(encoding="utf-8")
    clean_css = strip_css_comments_preserve_lines(css_text)

    classes: dict[str, int] = {}
    class_selector_re = re.compile(r"(?<![A-Za-z0-9_-])\.([A-Za-z_-][A-Za-z0-9_-]*)")

    for line_number, line in enumerate(clean_css.splitlines(), 1):
        for match in class_selector_re.finditer(line):
            classes.setdefault(match.group(1), line_number)

    return classes


STRING_RE = re.compile(r"(['\"`])((?:\\.|(?!\1).)*?)\1", re.S)
CLASS_ATTR_RE = re.compile(r"\b(?:className|class)\s*=\s*(['\"`])((?:\\.|(?!\1).)*?)\1", re.S)
EXPR_START_RE = re.compile(r"\b(?:className|class)\s*=\s*\{")
CONST_RE = re.compile(
    r"\b(?:const|let|var)\s+"
    r"[A-Za-z0-9_$]*(?:CLASS|Class|CARD|META|TITLE|PILL)[A-Za-z0-9_$]*"
    r"\s*=\s*(['\"`])((?:\\.|(?!\1).)*?)\1",
    re.S,
)


def add_tokens(raw: str, file_path: str, source_line: int, usage: defaultdict[str, list[tuple[str, int]]], classes: dict[str, int]) -> None:
    # Keep static template chunks and quoted conditional fragments.
    # Dynamic values are intentionally ignored unless handled manually below.
    raw = re.sub(r"\$\{.*?\}", " ", raw, flags=re.S)

    for token in re.split(r"\s+", raw.strip()):
        token = token.strip().strip("`'\"{}(),;")
        if token in classes:
            usage[token].append((file_path, source_line))


def iter_source_files(root: Path):
    for path in sorted(root.rglob("*")):
        if not path.is_file():
            continue
        if path.suffix not in SOURCE_EXTENSIONS:
            continue
        if any(part in SKIP_DIRS for part in path.parts):
            continue
        if str(path).endswith("routeTree.gen.ts"):
            continue
        yield path


def collect_usage(root: Path, classes: dict[str, int]) -> defaultdict[str, list[tuple[str, int]]]:
    usage: defaultdict[str, list[tuple[str, int]]] = defaultdict(list)

    for path in iter_source_files(root):
        source_text = path.read_text(encoding="utf-8", errors="ignore")
        source_path = str(path)

        # className="..." / class='...' / className=`...`
        for match in CLASS_ATTR_RE.finditer(source_text):
            add_tokens(match.group(2), source_path, line_no(source_text, match.start()), usage, classes)

        # className={...}; scan string literals inside the expression.
        for match in EXPR_START_RE.finditer(source_text):
            open_index = source_text.find("{", match.start())
            close_index = find_matching_brace(source_text, open_index)
            if close_index is None:
                continue

            expression = source_text[open_index + 1 : close_index]
            base_line = line_no(source_text, open_index)

            for string_match in STRING_RE.finditer(expression):
                add_tokens(
                    string_match.group(2),
                    source_path,
                    base_line + expression.count("\n", 0, string_match.start()),
                    usage,
                    classes,
                )

        # Local constants like TITLE_CLASS = "...".
        for match in CONST_RE.finditer(source_text):
            add_tokens(match.group(2), source_path, line_no(source_text, match.start()), usage, classes)

    # Known dynamic class produced by Formula's `formula-${size}` API.
    if "formula-small" in classes:
        usage["formula-small"].append(("src/textbook/Ch17Materials.tsx", 838))

    return usage


def build_report(classes: dict[str, int], usage: defaultdict[str, list[tuple[str, int]]]) -> str:
    by_class: dict[str, list[str]] = {}
    first_source_line: dict[str, int] = {}

    for class_name in classes:
        locations = usage.get(class_name, [])
        files = sorted({file_path for file_path, _ in locations})
        by_class[class_name] = files
        if locations:
            first_source_line[class_name] = min(source_line for _, source_line in locations)

    single = {class_name: files[0] for class_name, files in by_class.items() if len(files) == 1}
    shared = {class_name: files for class_name, files in by_class.items() if len(files) > 1}
    unused = [class_name for class_name, files in by_class.items() if not files]

    by_file: defaultdict[str, list[str]] = defaultdict(list)
    for class_name, file_path in single.items():
        by_file[file_path].append(class_name)

    lines: list[str] = []
    lines.append("# main.css Single-Component Class Report")
    lines.append("")
    lines.append(
        "Generated from `src/styles/main.css` and static class references in "
        "`src/**/*.{ts,tsx,js,jsx}` plus `index.html`."
    )
    lines.append("")
    lines.append("## Summary")
    lines.append("")
    lines.append(f"- Class names defined in `main.css`: {len(classes)}")
    lines.append(f"- Used by exactly one source file: {len(single)}")
    lines.append(f"- Used by more than one source file: {len(shared)}")
    lines.append(f"- No static source reference found: {len(unused)}")
    lines.append("")
    lines.append("Notes:")
    lines.append("- “Component” is counted as a distinct source file. A file can export more than one React component.")
    lines.append("- This is a static scan of class strings, `className={...}` string fragments, and local class constants. It does not execute code.")
    lines.append("- `formula-small` is counted via the `Formula size=\"small\"` API because the literal class is assembled dynamically.")
    lines.append("")
    lines.append("## Classes Used In Exactly One Source File")
    lines.append("")

    for file_path, class_names in sorted(by_file.items(), key=lambda item: (-len(item[1]), item[0])):
        lines.append(f"### `{file_path}` ({len(class_names)})")
        lines.append("")
        lines.append("| Class | CSS line | First source line |")
        lines.append("| --- | ---: | ---: |")
        for class_name in sorted(class_names, key=lambda name: (classes[name], name)):
            lines.append(f"| `.{class_name}` | {classes[class_name]} | {first_source_line.get(class_name, '')} |")
        lines.append("")

    lines.append("## No Static Source Reference Found")
    lines.append("")
    if unused:
        lines.append("| Class | CSS line |")
        lines.append("| --- | ---: |")
        for class_name in sorted(unused, key=lambda name: (classes[name], name)):
            lines.append(f"| `.{class_name}` | {classes[class_name]} |")
    else:
        lines.append("None.")

    lines.append("")
    lines.append("## Shared Class Count")
    lines.append("")
    lines.append("The remaining classes are referenced from two or more source files and are not listed in full here.")

    return "\n".join(lines) + "\n"


def main() -> None:
    if not CSS_PATH.exists():
        raise FileNotFoundError(f"Cannot find CSS file: {CSS_PATH}")

    classes = collect_css_classes(CSS_PATH)
    usage = collect_usage(ROOT, classes)
    report_text = build_report(classes, usage)
    REPORT_PATH.write_text(report_text, encoding="utf-8")

    single_count = report_text.count("### `")
    unused_match = re.search(r"- No static source reference found: (\d+)", report_text)
    unused_count = unused_match.group(1) if unused_match else "unknown"

    print(REPORT_PATH)
    print(f"{single_count} source files contain single-file classes, {unused_count} classes have no static source reference")


if __name__ == "__main__":
    main()
