"""
This is older version of code fot getting TLE's.
Now SpaceTrack.py should be used
"""
import re, os, json
import urllib

urlPattern = 'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
CACHE_DIR = "../data/satellites/cache"
#OUTPUT_PATH = "../data/satellites/allSats.json"
OUTPUT_PATH = "allSats.json"
MAKE_UNIQUE = True

def verifyDir(dir):
    if not os.path.exists(dir):
        print "Creating", dir
        os.mkdir(dir)

class TLEFetch:
    def __init__(self, indexPath=None, cacheDir=CACHE_DIR):
        verifyDir(cacheDir)
        self.cacheDir = cacheDir
        if indexPath:
            self.getUrls(indexPath)

    def dump(self, outPath=None):
        print "Num TLE's:", self.numTLEs
        print "Num sats:", len(self.sats)
        if not outPath:
            outPath = OUTPUT_PATH
        file(outPath, "w").write(json.dumps(self.sats, indent=3, sort_keys=True))

    def getUrls(self, indexPath):
        self.urls = []
        str = file(indexPath).read()
        urls = re.findall(urlPattern, str)
        for url in urls:
            if url.endswith(".txt"):
                self.urls.append(url)

    def getFiles(self, urls=None, linesPerEntry=3):
        self.sats = {}
        self.numTLEs = 0
        if urls == None:
            urls = self.urls
        for url in urls:
            if linesPerEntry == 2:
                self.handleFile2(url)
            elif linesPerEntry == 3:
                self.handleFile3(url)
            else:
                print "Bad linesPerEntry: ", linesPerEntry
                raise ValueError

    def handleFile2(self, url):
        ret = self.getFile(url)
        if not ret:
            print "Cannot get", url
            return
        fileName, buf = ret
        buf = buf.replace("\r", "").strip()
        lines = buf.split("\n")
        lines = map(lambda s: s.strip(), lines)
        n = len(lines)
        if n % 2 != 0:
            print "Bad file", url
            return
        print "%d  (= %d mod 2)" % (n, n % 2)
        for i in range(n/2):
            line1 = lines[2*i+0].strip()
            line2 = lines[2*i+1].strip()
            name = "sat%d" % (i+1)
            self.numTLEs += 1
            self.addEntry(name, fileName, line1, line2)
        print

    def handleFile3(self, url):
        ret = self.getFile(url)
        if not ret:
            print "Cannot get", url
            return
        fileName, buf = ret
        buf = buf.replace("\r", "").strip()
        lines = buf.split("\n")
        lines = map(lambda s: s.strip(), lines)
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
                if name in self.sats:
                    id = 2
                    name0 = name
                    while 1:
                        name = "%s_%d" % (name0, id)
                        if name not in self.sats:
                            break
                        id += 1
            self.addEntry(name, fileName, line1, line2)
        print

    def addEntry(self, name, fileName, line1, line2):
        if name in self.sats:
            obj = self.sats[name]
        else:
            obj = {'TLEs': [], 'name': name}
            self.sats[name] = obj
        obj['TLEs'].append([fileName, (line1, line2)])
        print name

    def getFile(self, url):
        i = url.rindex("/")
        if i < 0:
            print "Bad URL", url
            return None
        name = url[i+1:]
        if url.startswith("file:"):
            path = url[5:]
            print "Getting file", path
            return name, file(path).read()
        i = url.rindex("/")
        if i < 0:
            return None
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

def getAll():
    indexPath = "../data/satellites/CelesTrak_ Master TLE Index.html"
    tlef = TLEFetch()
    tlef.getUrls(indexPath)
    tlef.getFiles()
    tlef.dump("allSats.json")

def getCollision():
    tlef = TLEFetch()
    #urls = ["http://celestrak.com/NORAD/elements/cosmos-2251-debris.txt",
    #        "http://celestrak.com/NORAD/elements/iridium-33-debris.txt"]
    urls = ["file://data2/groups/mixed/MUSE/astrodata/cosmos2251Deb.txt",
            "file://data2/groups/mixed/MUSE/astrodata/iridium33Deb.txt"]
    tlef.getFiles(urls)
    tlef.dump("irid-cosmos.json")

def getCatalog():
    tlef = TLEFetch()
    urls = ["file:C:/GitHub/WorldViews/MUSE/data/satellites/tle-9-1-2017.txt"]
    tlef.getFiles(urls, linesPerEntry=2)
    tlef.dump("tle-9-1-2017.json")

if __name__ == '__main__':
    #getAll()
    getCollision()
    #getCatalog()
