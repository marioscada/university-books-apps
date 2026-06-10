#!/usr/bin/env python3
"""Estrae le 7 icone 3D da Image #1 (sfondo scuro) in PNG TRASPARENTI.
Strategia: per ogni bbox, flood-fill dal bordo dei pixel "scuri" (sfondo);
si ferma sull'alone luminoso che circonda ogni icona → l'interno (icona + glow,
anche le parti scure come il tocco accademico) resta opaco. Poi autocrop.
"""
from collections import deque
from PIL import Image

SRC = "/Users/marianoscada/.claude/image-cache/2bab9a19-3a85-4d40-84dc-1681592166bd/1.png"
OUT = "projects/ai-book-generator/public/images/models"
T = 78  # soglia luminanza: sotto = sfondo (riempibile), sopra = glow/icona

# bbox (x0,y0,x1,y1) e id modello per ciascuna icona
ICONS = [
    ("book",         (150, 120, 500, 480)),
    ("summary",      (560, 120, 900, 480)),
    ("thesis",       (1000, 120, 1380, 480)),
    ("study_guide",  (120, 540, 460, 900)),
    ("course",       (470, 540, 850, 900)),
    ("custom",       (930, 560, 1170, 880)),
    ("presentation", (1140, 540, 1450, 900)),
]


def lum(p):
    return 0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2]


def extract(img, box):
    crop = img.crop(box).convert("RGBA")
    w, h = crop.size
    px = crop.load()
    bg = [[False] * w for _ in range(h)]
    q = deque()
    # semina dai bordi
    for x in range(w):
        for y in (0, h - 1):
            q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            q.append((x, y))
    while q:
        x, y = q.popleft()
        if x < 0 or y < 0 or x >= w or y >= h or bg[y][x]:
            continue
        if lum(px[x, y]) >= T:  # alone/icona → stop
            continue
        bg[y][x] = True
        q.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
    # applica alpha=0 allo sfondo, calcola bbox dell'opaco
    minx, miny, maxx, maxy = w, h, 0, 0
    for y in range(h):
        for x in range(w):
            if bg[y][x]:
                r, g, b, _ = px[x, y]
                px[x, y] = (r, g, b, 0)
            else:
                minx, miny = min(minx, x), min(miny, y)
                maxx, maxy = max(maxx, x), max(maxy, y)
    if maxx < minx:
        return crop
    pad = 8
    return crop.crop(
        (max(0, minx - pad), max(0, miny - pad), min(w, maxx + pad), min(h, maxy + pad))
    )


def main():
    img = Image.open(SRC).convert("RGBA")
    for name, box in ICONS:
        out = extract(img, box)
        path = f"{OUT}/{name}.png"
        out.save(path)
        print(f"{name}: {out.size[0]}x{out.size[1]} -> {path}")


if __name__ == "__main__":
    main()
