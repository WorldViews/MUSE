
import os, urllib2, time

URL_BASE = "http://www.planet4589.org/space/elements"

STORAGE_BASE = "//data2/groups/mixed/MUSE/astrodata/Planet4589/elements"
USE_CACHE = True

NUM_RECS = 0
NUM_FETCHED = 0
NUM_ERRS = 0
NUM_CACHED = 0

def verifyDir(path):
    if not os.path.exists(path):
        print "Creating directory", path
        os.mkdir(path)

def fetchOne(i):
    global NUM_RECS, NUM_ERRS, NUM_FETCHED, NUM_CACHED
    NUM_RECS += 1
    group = 100*(i/100)
    dir = "%s/%05d" % (STORAGE_BASE, group)
    fname = "S%05d" % i
    verifyDir(dir)
    path = "%s/%s.txt" % (dir, fname)
    url = "%s/%05d/%s" % (URL_BASE, group, fname)
    if USE_CACHE and os.path.exists(path):
        print "already have", url
        NUM_CACHED += 1
        return
    print "fetch:", url
    #print path
    try:
        uos = urllib2.urlopen(url)
    except:
        print "*** failed to load", url
        NUM_ERRS += 1
        return
    buf = uos.read()
    file(path, "w").write(buf)
    NUM_FETCHED += 1
    time.sleep(0.5)

def fetch(low, high):
    global NUM_RECS, NUM_ERRS, NUM_FETCHED, NUM_CACHED
    for i in range(low,high+1):
        fetchOne(i)
    print "Num tried", NUM_RECS
    print "Num fetched", NUM_FETCHED
    print "Num errs", NUM_ERRS
    print "Num pre cached", NUM_CACHED
    
def test():
    fetch(35012, 35015)

def fetchAll():
    fetch(1,36103)

if __name__ == '__main__':
    #test()
    fetchAll()

        
