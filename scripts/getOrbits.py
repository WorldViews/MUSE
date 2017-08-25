
import re, os, json
import urllib

urlPattern = 'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
CACHE_DIR = "../data/satellites/cache"
OUTPUT_PATH = "../data/satellites/allSats.json"
MAKE_UNIQUE = True

def verifyDir(dir):
    if not os.path.exists(dir):
        print "Creating", dir
        os.mkdir(dir)

class TLEFetch:
    def __init__(self, indexPath, cacheDir=CACHE_DIR):
        verifyDir(cacheDir)
        self.cacheDir = cacheDir
        self.getUrls(indexPath)
        self.getFiles()
        self.dump()

    def dump(self):
        print "Num TLE's:", self.numTLEs
        print "Num sats:", len(self.sats)
        outPath = OUTPUT_PATH
        file(outPath, "w").write(json.dumps(self.sats, indent=3, sort_keys=True))
        
    def getUrls(self, indexPath):
        self.sats = {}
        self.urls = []
        self.numTLEs = 0
        str = file(indexPath).read()
        urls = re.findall(urlPattern, str)
        for url in urls:
            if url.endswith(".txt"):
                self.urls.append(url)

    def getFiles(self):
        for url in self.urls:
            self.handleFile(url)

    def handleFile(self, url):
        ret = self.getFile(url)
        if not ret:
            print "Cannot get", url
            return
        fileName, buf = ret
        buf = buf.replace("\r", "").strip()
        lines = buf.split("\n")
        n = len(lines)
        if n % 3 != 0:
            print "Bad file", url
            return
        print "%d  (= %d mod 3)" % (n, n % 3)
        for i in range(n/3):
            name = lines[3*i].strip()
            line1 = lines[3*i+1].strip()
            line2 = lines[3*1+2].strip()
            self.numTLEs += 1
            if MAKE_UNIQUE:
                id = 2
                name0 = name
                while 1:
                    name = "%s_%d" % (name0, id)
                    if name not in self.sats:
                        break
                    id += 1
            if name in self.sats:
                obj = self.sats[name]
            else:
                obj = {'TLEs': [], 'name': name}
                self.sats[name] = obj
            obj['TLEs'].append([fileName, (line1, line2)])
            print name
        print
        
    def getFile(self, url):
        i = url.rindex("/")
        if i < 0:
            return None
        name = url[i+1:]
        cachePath = os.path.join(self.cacheDir, name)
        cachePath = cachePath.replace("\\","/")
        print "name: %s  url: %s" % (name, url)
        print cachePath
        if os.path.exists(cachePath):
            print "Getting from cache", cachePath
            return name, file(cachePath).read()
        print "getting from HTTP:", url
        uos = urllib.urlopen(url)
        str = uos.read()
        print "got %d chars" % len(str)
        file(cachePath, "w").write(str)
        return name, str

def run():
    path = "../data/satellites/CelesTrak_ Master TLE Index.html"
    tlef = TLEFetch(path)

if __name__ == '__main__':
    run()
