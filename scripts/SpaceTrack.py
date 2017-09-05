
import re, os, json
import urllib2, base64
import spacetrack.operators as op
from spacetrack import SpaceTrackClient
import SPACE_TRACK_AUTH as STA

DIR = "STDB"

def verifyDir(path):
    if os.path.exists(path):
        return
    print "Creating directory",path
    os.path.mkdir(path)

def getJSON():
    st = SpaceTrackClient(identity=STA.identity, password=STA.password)
    #st.tle()
    buf = st.tle(norad_cat_id=25544, orderby='epoch desc', limit=30, format='json')
    print buf
    obj = json.loads(buf)
    obuf = json.dumps(obj, indent=4)
    print obuf
    file("queryOut.json", "w").write(obuf)
    #buf = st.tle_latest(ordinal=1, norad_cat_id=25544, orderby='epoch desc', limit=10, format='json')

def getTLE():
    st = SpaceTrackClient(identity=STA.identity, password=STA.password)
    #st.tle()
    buf = st.tle(norad_cat_id=25544, orderby='epoch desc', limit=1000, format='tle')
    print buf
    file("sat_25544.tle.txt", "w").write(buf)

def getTLE_latest():
    st = SpaceTrackClient(identity=STA.identity, password=STA.password)
    #st = SpaceTrackClient(identity="donkimber@gmail.com", password="spacetrack12345")
    buf = st.tle_latest(ordinal=1, orderby='epoch desc', format='tle')
    print buf
    file("9_1_2017.tle_latest.txt", "w").write(buf)
    #buf = st.tle_latest(ordinal=1, norad_cat_id=25544, orderby='epoch desc', limit=10, format='json')

class SpaceTrackDB:
    def __init__(self):
        self.st = SpaceTrackClient(identity=STA.identity, password=STA.password)
        self.dir = DIR

    def fetch(self):
        years = [1950, 1960, 1970, 1980, 1990, 2000, 2010]
        months = [1]
        days = [1]
        for year in years:
            for month in months:
                for day in days:
                    epoch = "%4d-%02d-%02d" % (year, month, day)
                    self.getTLE(epoch)

    def getTLE(self, epoch='2010-03-01', format='json'):
        print "Getting data for", epoch
        path = os.path.join(self.dir, "%s.tle_latest.%s" % (epoch, format))
        path = path.replace("\\", "/")
        if os.path.exists(path):
            buf = file(path).read()
            if format == 'json':
                return json.loads(buf)
            return buf
        st = SpaceTrackClient(identity=STA.identity, password=STA.password)
        #st = SpaceTrackClient(identity="donkimber@gmail.com", password="spacetrack12345")
        buf = self.st.tle_latest(ordinal=1, orderby='epoch desc', format=format, epoch='>'+epoch)
        if format == 'json':
            obj = json.loads(buf)
            buf = json.dumps(obj, indent=3)
        print buf
        file(path, "w").write(buf)
        return buf

if __name__ == '__main__':
    #getJSON()
    #getTLE()
    #getTLE_latest()
    stdb = SpaceTrackDB()
    stdb.fetch()
    #stdb.getTLE('2010-03-01')
