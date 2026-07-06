#!/usr/bin/env python3
"""Generate favicon.ico with steering wheel on dark gray background"""
import struct, zlib, math, os

def create_png(w, h, get_pixel):
    def chunk(ctype, data):
        c = ctype + data
        return struct.pack('>I', len(data)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)
    sig = b'\x89PNG\r\n\x1a\n'
    ihdr = struct.pack('>IIBBBBB', w, h, 8, 6, 0, 0, 0)
    raw = b''
    for y in range(h):
        raw += b'\x00'
        for x in range(w):
            r, g, b, a = get_pixel(x, y)
            raw += struct.pack('BBBB', r, g, b, a)
    return sig + chunk(b'IHDR', ihdr) + chunk(b'IDAT', zlib.compress(raw)) + chunk(b'IEND', b'')

bg = (26, 26, 36, 255)
gold = (196, 160, 85, 255)
gold2 = (212, 184, 122, 255)
gold3 = (235, 224, 204, 255)

def get_pixel(x, y):
    # rounded corners
    if (x<5 and y<5 and (x-5)**2+(y-5)**2>25) or \
       (x>=27 and y<5 and (x-27)**2+(y-5)**2>25) or \
       (x<5 and y>=27 and (x-5)**2+(y-27)**2>25) or \
       (x>=27 and y>=27 and (x-27)**2+(y-27)**2>25):
        return (0, 0, 0, 0)
    
    cx = cy = 16
    dx, dy = x - cx, y - cy
    dist = math.sqrt(dx*dx + dy*dy)
    
    # steering wheel ring
    if 7 <= dist <= 9:
        angle = math.degrees(math.atan2(dy, dx)) % 360
        if not (340 < angle < 20):  # gap at top
            return gold
    
    # spokes
    spoke_angles = [90, 210, 330]
    for sa in spoke_angles:
        rad = math.radians(sa)
        sx, sy = cx + dist * math.cos(rad), cy + dist * math.sin(rad)
        if abs(x - sx) <= 0.8 and abs(y - sy) <= 0.8:
            return gold
    
    # center hub
    if dist <= 3:
        return gold2
    
    # highlight center
    if (x, y) in [(16,16),(16,17),(17,16),(15,16),(16,15)]:
        if (x, y) == (16, 16):
            return gold3
    
    return bg

png_data = create_png(32, 32, get_pixel)
ico = struct.pack('<HHH', 0, 1, 1) + struct.pack('<BBBBHHII', 32, 32, 0, 0, 1, 32, len(png_data), 22) + png_data
path = '/home/team/shared/autoexec/public/favicon.ico'
with open(path, 'wb') as f:
    f.write(ico)
print(f'Created {path}: {os.path.getsize(path)} bytes')