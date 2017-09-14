
import re, os, time, json, dateutil
import urllib2, base64
import spacetrack.operators as op
from dateutil.parser import parse
from datetime import datetime
from spacetrack import SpaceTrackClient
import SPACE_TRACK_AUTH as STA

DIR = "STDB"
USE_INTS = True

EPOCH0 = datetime(1970,1,1)

def toTime(epoch):
    #print "toTime", epoch
    d = parse(epoch)
    #print " d:", d, " type:", type(d)
    #print " tup:", d.timetuple()
    diff = d - EPOCH0
    t = diff.total_seconds()
    #t2 = time.mktime(d.timetuple())
    #print " t:", t, "  t2:", t2, "   delta:", (t2-t)
    return t

#TODO: fix this to use date objects.  This will
# make error if d is last day of month
def nextEpoch(epoch):
    y,m,d = map(int, epoch.split("-"))
    return "%04d-%02d-%02d" % (y,m,d+1)

def verifyDir(path):
    if os.path.exists(path):
        return
    print "Creating directory",path
    os.mkdir(path)

def filterFields(obj, fields):
    nobj = {}
    for field in fields:
        nobj[field] = obj[field]
    return nobj

class SpaceObject:
    def __init__(self, id, name=None):
        self.id = id
        self.firstEpoch = None
        self.lastEpoch = None
        self.TLEs = []
        self.OBJECT_NAME = None
        self.OBJECT_TYPE = None
        self.INTLDES = None
        self.ORIGINATOR = None

    def observeTLEObj(self, tleObj):
        epoch = tleObj['EPOCH']
        self.TLEs.append(tleObj)
        if 'OBJECT_NAME' in tleObj:
            self.OBJECT_NAME = tleObj['OBJECT_NAME']
        if 'OBJECT_TYPE' in tleObj:
            self.OBJECT_TYPE = tleObj['OBJECT_TYPE']
        if 'INTLDES' in tleObj:
            self.INTLDES = tleObj['INTLDES']
        if 'ORIGINATOR' in tleObj:
            self.ORIGINATOR = tleObj['ORIGINATOR']
        if self.firstEpoch:
            self.firstEpoch = min(self.firstEpoch, epoch)
        else:
            self.firstEpoch = epoch
        if self.lastEpoch:
            self.lastEpoch = max(self.lastEpoch, epoch)
        else:
            self.lastEpoch = epoch

    def toJSONObj(self, summary=False, tleFields=None):
        if tleFields == None:
            tleFields = ['TLE_LINE1', 'TLE_LINE2', 'NORAD_CAT_ID', 'EPOCH']
        obj =  {'NORAD_CAT_ID': self.id}
        if summary:
            obj['numTLEs'] = len(self.TLEs)
            obj['ORIGINATOR'] = self.ORIGINATOR
            obj['INTLDES'] = self.INTLDES
            obj['OBJECT_NAME'] = self.OBJECT_NAME
            obj['OBJECT_TYPE'] = self.OBJECT_TYPE
            obj['firstEpoch'] = self.firstEpoch
            obj['lastEpoch'] = self.lastEpoch
            obj['startTime'] = toTime(self.firstEpoch)
        else:
            tleObjs = map(lambda obj: filterFields(obj, tleFields), self.TLEs)
            #tleObjs = self.TLEs
            obj['TLEs'] = tleObjs
        return obj

class DataSet:
    def __init__(self, epoch):
        self.epoch = epoch
        self.objects = {}

    def observeTLEObj(self, tleObj):
        """
        absorb a JSON object from the SpaceTrack API
        """
        id = tleObj['NORAD_CAT_ID']
        if USE_INTS:
            id = int(id)
        name = tleObj['OBJECT_NAME']
        tleEpoch = tleObj['EPOCH']
        tle1 = tleObj['TLE_LINE1']
        tle2 = tleObj['TLE_LINE2']
        if id in self.objects:
            obj = self.objects[id]
        else:
            obj = SpaceObject(id, name)
            self.objects[id] = obj
        obj.observeTLEObj(tleObj)

    def toJSONObj(self, summary=False):
        objs = {}
        for id in self.objects:
            objs[id] = self.objects[id].toJSONObj(summary)
        dataSet = {'type': 'dataSet',
                   'epoch': self.epoch,
                   'objects': objs}
        return dataSet


class SpaceTrackDB:
    def __init__(self):
        self.st = SpaceTrackClient(identity=STA.identity, password=STA.password)
        self.dir = DIR
        verifyDir(self.dir)
        self.objs = {}
        self.epochs = []
        self.dataSets = {}

    def getSavedEpochs(self):
        epochs = []
        names = os.listdir(self.dir)
        suffix = ".json"
        for name in names:
            if not name.endswith(suffix):
                continue
            epoch = name[:-len(suffix)]
            epochs.append(epoch)
        print epochs
        return epochs

    def fetch(self):
        #years = [1950, 1960, 1970, 1980, 1990, 2000, 2010]
        years = [1960, 1970, 1980, 1990, 2000, 2010, 2015, 2017]
        years = [1965, 1975, 1985, 1995, 2005, 2014, 2016, 2017]
        #years = [2010]
        #years = range(1958,2018,2)
        years = range(1958,1990,2)
        years = range(1959,1991,2)
        months = [1,6]
        days = [1]
        for year in years:
            for month in months:
                for day in days:
                    epoch = "%4d-%02d-%02d" % (year, month, day)
                    self.getEpochData_API(epoch)

    def getEpochData_API(self, epoch="2010-03-01", format='json'):
        print "Getting data for", epoch, format
        epoch0 = epoch
        epoch1 = nextEpoch(epoch)
        path = os.path.join(self.dir, "%s.%s" % (epoch, format))
        path = path.replace("\\", "/")
        if os.path.exists(path):
            buf = file(path).read()
            if format == 'json':
                return json.loads(buf)
            return buf
        st = SpaceTrackClient(identity=STA.identity, password=STA.password)
        epochPat = epoch0+"--"+epoch1
        print "query epoch range:", epochPat
        #buf = self.st.tle(orderby='epoch desc', format=format, epoch=epochPat,distinct=True)
        buf = self.st.tle(format=format, epoch=epochPat)
        print "returned buffer of length", len(buf)
        obj = None
        if format == 'json':
            obj = json.loads(buf)
            buf = json.dumps(obj, indent=3, sort_keys=True)
        print buf
        file(path, "w").write(buf)
        return obj


    def agglomerate(self, outPath="all_stdb.json", epochs=None, dataSetsDir=None):
        if epochs == None:
            epochs = self.getSavedEpochs()
            #epochs = [epochs[0], epochs[15], epochs[30], epochs[-1]]
            #epochs = [epochs[0], epochs[1]]
        epochs.sort()
        print "epochs:", epochs
        dataSets = {};
        allData = DataSet("2017-1-1")
        for epoch in epochs:
            data = self.getEpochData_API(epoch)
            dataSet = DataSet(epoch)
            for tleObj in data:
                dataSet.observeTLEObj(tleObj)
                allData.observeTLEObj(tleObj)
            if dataSetsDir:
                dataSetPath = "%s/%s.json" % (dataSetsDir, epoch)
                print "saving dataSet to", dataSetPath
                dsObj = dataSet.toJSONObj()
                file(dataSetPath,"w").write(json.dumps(dsObj, indent=3, sort_keys=True))
        dataSets[epoch] = dataSet.toJSONObj()
        dbObj = {
            'type': 'SpaceTrackDB',
            'created': '%s' % time.ctime(),
            'catalog': allData.toJSONObj(summary=True),
            'epochs': epochs,
            'dataSets': dataSets
        }
        print "Saving to", outPath
        file(outPath, "w").write(json.dumps(dbObj, indent=3, sort_keys=True))




def test1():
    epochs = ["2001-01-01",
              "2009-02-09",
              "2011-03-30",
              "2014-02-11"]
    for epoch in epochs:
        print epoch, nextEpoch(epoch)

def makeDB_JSON():
    stdb = SpaceTrackDB()
    path = "../data/satellites/all_stdb.json"
    dataSetsDir = "../data/satellites/stdb"
    stdb.agglomerate(path, dataSetsDir=dataSetsDir)

if __name__ == '__main__':
    makeDB_JSON()
    #stdb = SpaceTrackDB()
    #stdb.fetch()
    #stdb.getEpochData_API("1964-01-01", "tle")
    #stdb.getEpochData_API("1962-01-01")
    #getTLE()
    #stdb.getEpochData('2010-03-01')
    #stdb.agglomerate()
    #stdb.fetch()
