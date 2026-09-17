"""生成手机主屏图标。一次性脚本，改了配色或字号后重跑即可。

用法：python 生成图标.py
"""

from PIL import Image, ImageDraw, ImageFont

BG = (15, 23, 42)  # 深蓝黑，与 index.html 里的 theme_color 一致
FG = (255, 255, 255)

FONT_CANDIDATES = ("msyhbd.ttc", "msyh.ttc", "simhei.ttf", "simsun.ttc")


def load_font(size: int) -> ImageFont.FreeTypeFont:
    for name in FONT_CANDIDATES:
        try:
            return ImageFont.truetype(f"C:/Windows/Fonts/{name}", size)
        except OSError:
            continue
    raise SystemExit("找不到中文字体，请手动准备图标文件")


def make(size: int, path: str, font_ratio: float = 0.54) -> None:
    img = Image.new("RGB", (size, size), BG)
    draw = ImageDraw.Draw(img)
    font = load_font(int(size * font_ratio))
    left, top, right, bottom = draw.textbbox((0, 0), "平", font=font)
    draw.text(
        ((size - (right - left)) / 2 - left, (size - (bottom - top)) / 2 - top),
        "平",
        font=font,
        fill=FG,
    )
    img.save(path)
    print(f"已生成 {path}")


make(192, "public/icon-192.png")
make(512, "public/icon-512.png")
# iPhone 主屏图标固定 180×180，不按这个尺寸会被裁边
make(180, "public/apple-touch-icon.png")
