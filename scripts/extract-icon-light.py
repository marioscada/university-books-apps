#!/usr/bin/env python3
"""Estrae un'icona da un crop su SFONDO CHIARO (card render) in PNG trasparente.
Flood-fill dal bordo dei pixel CHIARI (sfondo bianco + cerchio pallido): si ferma
sui contorni scuri/colorati dell'icona, quindi gli interni chiari ma CHIUSI dai
bordi (foglio bianco, fumetti) restano. Poi despeckle (via puntini/residui) e
bordi morbidi. Uso: extract-icon-light.py <in> <out_id> [<in> <out_id> ...]"""
import sys
from collections import deque
from PIL import Image, ImageFilter

OUT = "projects/ai-book-generator/public/images/models"
T = 238          # luminanza: sopra = sfondo chiaro (riempibile)
MIN_AREA = 250   # componenti opachi pi�� piccoli = puntini/residui → rimossi


def lum(p):
    return 0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2]


def neighbors(x, y, w, h):
    if x > 0:
        yield x - 1, y
    if x < w - 1:
        yield x + 1, y
    if y > 0:
        yield x, y - 1
    if y < h - 1:
        yield x, y + 1


def extract(path, out_id):
    img = Image.open(path).convert("RGBA")
    w, h = img.size
    px = img.load()
    bg = [[False] * w for _ in range(h)]
    q = deque()
    for x in range(w):
        q.append((x, 0)); q.append((x, h - 1))
    for y in range(h):
        q.append((0, y)); q.append((w - 1, y))
    # 1) flood-fill sfondo chiaro dal bordo
    while q:
        x, y = q.popleft()
        if bg[y][x] or lum(px[x, y]) < T:
            continue
        bg[y][x] = True
        for nx, ny in neighbors(x, y, w, h):
            if not bg[ny][nx]:
                q.append((nx, ny))
    # 2) opaco = non-sfondo; rimuovo componenti piccoli (puntini/residui)
    seen = [[False] * w for _ in range(h)]
    for sy in range(h):
        for sx in range(w):
            if bg[sy][sx] or seen[sy][sx]:
                continue
            comp = []
            st = [(sx, sy)]
            seen[sy][sx] = True
            while st:
                x, y = st.pop()
                comp.append((x, y))
                for nx, ny in neighbors(x, y, w, h):
                    if not bg[ny][nx] and not seen[ny][nx]:
                        seen[ny][nx] = True
                        st.append((nx, ny))
            if len(comp) < MIN_AREA:
                for x, y in comp:
                    bg[y][x] = True  # troppo piccolo → sfondo
    # 3) applica alpha + bbox
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
        return
    pad = 6
    img = img.crop((max(0, minx - pad), max(0, miny - pad),
                    min(w, maxx + pad), min(h, maxy + pad)))
    # 4) bordi morbidi: leggero blur sull'alpha
    r, g, b, a = img.split()
    a = a.filter(ImageFilter.GaussianBlur(0.6))
    img = Image.merge("RGBA", (r, g, b, a))
    img.save(f"{OUT}/{out_id}.png")
    print(f"{out_id}: {img.size[0]}x{img.size[1]}")


if __name__ == "__main__":
    args = sys.argv[1:]
    for i in range(0, len(args), 2):
        extract(args[i], args[i + 1])
