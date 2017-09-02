
import re, os, json
import urllib2, base64
import spacetrack.operators as op
from spacetrack import SpaceTrackClient
import SPACE_TRACK_AUTH as STA


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

if __name__ == '__main__':
    #getJSON()
    getTLE()
    #getTLE_latest()
