import os, sys, struct, time, ssl, zlib, base64
def mv2tga(filename):
    with open(filename) as f:
        data=f.read()
    with open(os.path.splitext(filename)[0]+'.tga','wb') as f:
        f.write(zlib.decompress(base64.b64decode(data)))
def tga2mv(filename):
    with open(filename, 'rb') as f:
        data=f.read()
    with open(os.path.splitext(filename)[0]+'2.txt', 'wb') as f:
        f.write(base64.b64encode(zlib.compress(data, 6))) # compress level is 0 to 9, 9 is best, 6 is the default (what nintendo apparently uses for miiverse posts)
#mv2tga(r'input.txt')
tga2mv(os.getcwd() + '/python/input.tga')
