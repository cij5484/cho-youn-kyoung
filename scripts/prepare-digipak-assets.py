from __future__ import annotations

import argparse
import re
from pathlib import Path

from PIL import Image


OUTER_NAME = "CP_디지팩(소형) _ 2단_속지부착.png"
DISC_NAME = "CD DVD라벨 칼선.png"
BOOKLET_PATTERN = "CP_디지팩(소형) 속지 칼선_130_120_*.png"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Prepare web-ready digipak textures from clean artwork and matching dieline PNGs."
    )
    parser.add_argument("--artwork-dir", type=Path, required=True)
    parser.add_argument("--dieline-dir", type=Path, required=True)
    parser.add_argument("--output-dir", type=Path, required=True)
    return parser.parse_args()


def is_magenta(pixel: tuple[int, ...]) -> bool:
    red, green, blue = pixel[:3]
    return red > 210 and blue > 100 and green < 140


def collapse_runs(values: list[int]) -> list[int]:
    if not values:
        return []
    runs: list[list[int]] = [[values[0]]]
    for value in values[1:]:
        if value <= runs[-1][-1] + 1:
            runs[-1].append(value)
        else:
            runs.append([value])
    return [round(sum(run) / len(run)) for run in runs]


def straight_dielines(image: Image.Image) -> tuple[list[int], list[int]]:
    rgb = image.convert("RGB")
    width, height = rgb.size
    pixels = rgb.load()
    x_counts = [0] * width
    y_counts = [0] * height
    for y in range(height):
        for x in range(width):
            if is_magenta(pixels[x, y]):
                x_counts[x] += 1
                y_counts[y] += 1
    xs = collapse_runs([index for index, count in enumerate(x_counts) if count >= height * 0.18])
    ys = collapse_runs([index for index, count in enumerate(y_counts) if count >= width * 0.18])
    return xs, ys


def magenta_bounds(image: Image.Image) -> tuple[int, int, int, int]:
    rgb = image.convert("RGB")
    width, height = rgb.size
    pixels = rgb.load()
    points = [
        (x, y)
        for y in range(height)
        for x in range(width)
        if is_magenta(pixels[x, y])
    ]
    if not points:
        raise ValueError("No magenta dieline was found")
    xs, ys = zip(*points)
    return min(xs), min(ys), max(xs) + 1, max(ys) + 1


def fit(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    target_width, target_height = size
    source_ratio = image.width / image.height
    target_ratio = target_width / target_height
    if source_ratio > target_ratio:
        crop_width = round(image.height * target_ratio)
        left = (image.width - crop_width) // 2
        image = image.crop((left, 0, left + crop_width, image.height))
    else:
        crop_height = round(image.width / target_ratio)
        top = (image.height - crop_height) // 2
        image = image.crop((0, top, image.width, top + crop_height))
    return image.resize(size, Image.Resampling.LANCZOS)


def save_webp(image: Image.Image, path: Path, *, width: int | None = None, quality: int = 90) -> None:
    if width is not None and image.width > width:
        height = round(image.height * width / image.width)
        image = image.resize((width, height), Image.Resampling.LANCZOS)
    image.convert("RGB").save(path, "WEBP", quality=quality, method=6)


def booklet_number(path: Path) -> int:
    match = re.search(r"_(\d+)\.png$", path.name)
    if not match:
        raise ValueError(f"Cannot read booklet number from {path.name}")
    return int(match.group(1))


def main() -> None:
    args = parse_args()
    artwork_dir = args.artwork_dir.resolve()
    dieline_dir = args.dieline_dir.resolve()
    output_dir = args.output_dir.resolve()
    if output_dir.exists():
        raise FileExistsError(f"Refusing to overwrite existing output: {output_dir}")

    clean_outer_path = artwork_dir / OUTER_NAME
    dieline_outer_path = dieline_dir / OUTER_NAME
    clean_disc_path = artwork_dir / DISC_NAME
    dieline_disc_path = dieline_dir / DISC_NAME
    dieline_booklets = sorted(dieline_dir.glob(BOOKLET_PATTERN), key=booklet_number)
    clean_booklets = [artwork_dir / path.name for path in dieline_booklets]
    required = [clean_outer_path, dieline_outer_path, clean_disc_path, dieline_disc_path, *clean_booklets]
    missing = [path for path in required if not path.is_file()]
    if missing:
        raise FileNotFoundError("Missing input files:\n" + "\n".join(str(path) for path in missing))
    if len(dieline_booklets) < 2:
        raise ValueError("At least two booklet layouts are required")

    with Image.open(dieline_outer_path) as reference:
        outer_xs, outer_ys = straight_dielines(reference)
    if len(outer_xs) != 4 or len(outer_ys) != 3:
        raise ValueError(f"Unexpected outer dielines: x={outer_xs}, y={outer_ys}")
    left, spine_left, spine_right, right = outer_xs
    top, middle, bottom = outer_ys

    with Image.open(dieline_booklets[0]) as reference:
        booklet_xs, booklet_ys = straight_dielines(reference)
    if len(booklet_xs) != 3 or len(booklet_ys) != 2:
        raise ValueError(f"Unexpected booklet dielines: x={booklet_xs}, y={booklet_ys}")
    page_left, page_middle, page_right = booklet_xs
    page_top, page_bottom = booklet_ys

    web_dir = output_dir / "web"
    viewer_dir = output_dir / "viewer"
    web_dir.mkdir(parents=True)
    viewer_dir.mkdir()

    with Image.open(clean_outer_path) as source:
        source = source.convert("RGB")
        interior_booklet = source.crop((left, top, spine_left, middle))
        interior_tray = source.crop((spine_right, top, right, middle))
        back = source.crop((left, middle, spine_left, bottom))
        front = source.crop((spine_right, middle, right, bottom))
        spine = source.crop((spine_left, middle, spine_right, bottom))
        background = source.crop((left, top, right, middle))
        save_webp(front, web_dir / "front.webp", width=1600, quality=92)
        save_webp(back, web_dir / "back.webp", width=1600, quality=92)
        save_webp(spine, web_dir / "spine.webp", width=180, quality=92)
        save_webp(interior_booklet, web_dir / "interior-booklet.webp", width=1600, quality=92)
        save_webp(interior_tray, web_dir / "interior-tray.webp", width=1600, quality=92)
        save_webp(fit(background, (2560, 1440)), web_dir / "home-hero-desktop.webp", quality=86)
        save_webp(fit(interior_booklet, (1440, 2560)), web_dir / "home-hero-mobile.webp", quality=86)

    with Image.open(dieline_disc_path) as reference:
        disc_bounds = magenta_bounds(reference)
    with Image.open(clean_disc_path) as source:
        disc = source.convert("RGB").crop(disc_bounds)
        side = min(disc.size)
        x = (disc.width - side) // 2
        y = (disc.height - side) // 2
        disc = disc.crop((x, y, x + side, y + side))
        save_webp(disc, web_dir / "cd-label.webp", width=1200, quality=92)

    page_index = 1
    for index, clean_path in enumerate(clean_booklets):
        with Image.open(clean_path) as source:
            source = source.convert("RGB")
            left_page = source.crop((page_left, page_top, page_middle, page_bottom))
            right_page = source.crop((page_middle, page_top, page_right, page_bottom))
            pages = [right_page] if index == 0 else [left_page, right_page]
            for page in pages:
                save_webp(page, viewer_dir / f"booklet-{page_index:02d}.webp", width=1600, quality=94)
                page_index += 1

    print(f"Created {page_index - 1} booklet pages and 9 web assets in {output_dir}")
    print(f"Package geometry: front/back {right - spine_right}x{bottom - middle}, spine {spine_right - spine_left}x{bottom - middle}")


if __name__ == "__main__":
    main()
