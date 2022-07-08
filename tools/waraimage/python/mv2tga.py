F='wb'
A=open
import os,sys,struct,time,ssl,zlib as C,base64 as D
def B(filename):
	E=filename
	with A(E)as B:G=B.read()
	with A(os.path.splitext(E)[0]+'.tga',F)as B:B.write(C.decompress(D.b64decode(G)))
def E(filename):
	E=filename
	with A(E,'rb')as B:G=B.read()
	with A(os.path.splitext(E)[0]+'2.txt',F)as B:B.write(D.b64encode(C.compress(G,6)))
B(sys.argv[1])