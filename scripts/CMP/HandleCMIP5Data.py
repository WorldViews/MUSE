
from datetime import datetime
from netCDF4 import Dataset, num2date, date2num
from PIL import Image, ImageDraw, ImageFont
import os
import colorsys
import numpy

BASE_DIR = "m:/MUSE/CMIP5"
COLOR_KEY_PATH = os.path.join(BASE_DIR, "colorKey.png")

def verifyDir(path):
    if not os.path.exists(path):
        os.mkdir(path)


"""
min(tas) 204.3
max(tas) 321.787
"""
TAS_MIN = 200
TAS_MAX = 325
TAS_RANGE = TAS_MAX-TAS_MIN
HBLUE = 240/360.0
HRED = 0.0
H_RANGE = HBLUE - HRED

def tempToColor(T):
    dT = T - TAS_MIN
    f = dT/float(TAS_RANGE)
    h = HBLUE - f*H_RANGE
    r,g,b = colorsys.hsv_to_rgb(h,.8, .8)
    r,g,b = (int(255*r), int(255*g), int(255*b))
    return r,g,b

def makeColorKey(path="key.png", low=TAS_MIN, high=TAS_MAX):
    wd = 512
    ht = 64
    img = Image.new("RGB", (wd,ht), "black")
    pixels = img.load()
    for i in range(wd):
        T = low + (high-low)*i/(wd-1.0)
        for j in range(ht):
            rgb = tempToColor(T)
            pixels[i,j] = rgb
    img.save(path)

class CMIP5Data:
    def __init__(self, name, path=None):
        self.name = name
        if not path:
            path = "%s/%s.nc" % (BASE_DIR, name)
        self.vidWriter = None
        ncin = Dataset(path, 'r')
        self.ncin = ncin
        self.lat = ncin.variables['lat']
        self.lon = ncin.variables['lon']
        self.time = ncin.variables['time']
        self.tas = ncin.variables['tas']
        self.dump()

    def dump(self):
        print self.ncin.variables
        vals = self.tas[::]
        print "vals.shape", vals.shape
        print "min(tas)", vals.min()
        print "max(tas)", vals.max()
        print
        
    def writeImageToVideo(self, img, videoPath):
        import cv2
        size = img.size
        if not self.vidWriter:
            print "Creating video file", videoPath
            fourcc = cv2.VideoWriter_fourcc(*'MP4V')
            self.vidWriter = cv2.VideoWriter(videoPath, fourcc, 20.0, size)
        open_cv_image = numpy.array(img)
        # Convert RGB to BGR 
        open_cv_image = open_cv_image[:, :, ::-1].copy() 
        print "writing image to video"
        self.vidWriter.write(open_cv_image)

    def getImage(self, tas, i=0, path="tas.png"):
        v = tas[i]
        nLat, nLon = v.shape
        nLat = int(nLat)
        #imgSize = (nLat, nLon)
        imgSize = (nLon, nLat)
        #img = Image.new("L", imSize)
        img = Image.new("RGB", imgSize, "black")
        pixels = img.load()
        s = 2.0
        numErrs = 0
        for i in range(nLat):
            for j in range(nLon):
                T = v[i,j]
                r,g,b = tempToColor(T)
                #pixels[j,nLat-i-1] = (int(255*r), int(255*g), int(255*b))
                pixels[j,nLat-i-1] = r,g,b
        print "saving to", path
        img.save(path)
        return img

    def timeToDate(self, t):
        t = float(t)
        times = self.time
        date = num2date(t, units=times.units, calendar=times.calendar)
        return date
    
    def dumpStats(self):
        tas = self.tas
        times = self.time
        print "times.units:", times.units
        print "times.calendar:", times.calendar
        nsteps = int(tas.shape[0])
        print "nsteps:", nsteps
        for i in range(nsteps):
            t = times[i]
            #tnum = date2num(t, units=times.units, calendar=times.calendar)
            #date = num2date(t, units=times.units, calendar=times.calendar)
            date = self.timeToDate(t)
            st = self.tas[i]
            Tmax = st[:].max()
            Tmin = st[:].min()
            print "%3d %12s %6.1f %6.1f" % (i, date, Tmin, Tmax)
        
    def genImages(self, imageDir=None, videoPath=None):
        if imageDir == None:
            imageDir = "%s/%s_images" % (BASE_DIR, self.name)
        verifyDir(imageDir)
        videoPath = "%s/%s.mp4" % (BASE_DIR, self.name)
        self.videoPath = videoPath
        tas = self.tas
        print "tas:", tas
        print "tas shape:", tas.shape
        nsteps = int(tas.shape[0])
        font = ImageFont.truetype('verdana.ttf', 8)
        print "nsteps:", nsteps
        for i in range(nsteps):
            time = self.time[i]
            print "time:", time
            date = self.timeToDate(time)
            img = self.getImage(tas, i, "%s/tas_%d.png" % (imageDir, i))
            draw = ImageDraw.Draw(img, 'RGB')
            tstr = "%s" % date
            tstr = tstr[:7]
            draw.text((10,5), "%s" % tstr, font=font, fill=(255,255,255))
            if videoPath:
                self.writeImageToVideo(img, videoPath)


dataPath = "m:/MUSE/CMIP5/xxx.nc"
imageDir = "m:/MUSE/CMIP5/xxx_img"
videoPath = "m:/MUSE/CMIP5/xxx.mp4"

dataName = "tas_Amon_CCSM4_historical_r1i1p1_185001-200512"
dataName = "tas_Amon_CCSM4_rcp85_r1i1p1_200601-210012"
dataName = "tas_Amon_CCSM4_rcp85_r1i1p1_210101-230012"

makeColorKey(COLOR_KEY_PATH)
ds = CMIP5Data(dataName)
ds.dumpStats()
ds.genImages()


    
