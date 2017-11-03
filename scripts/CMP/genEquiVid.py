#! /usr/bin/env python
#
# a skeleton script to animate a set of L4 files using python matplotlib library.
#
#
#   2016.09.01  Yibo Jiang, version 0

##################################
# user parameters to be editted: #
##################################

# Caution: This is a Python script, and Python takes indentation seriously.
# DO NOT CHANGE INDENTATION OF ANY LINE BELOW!

from matplotlib import animation
from matplotlib import pyplot as plt
import numpy as np
from mpl_toolkits.basemap import Basemap
from netCDF4 import Dataset

# setup figure object
fig, ax = plt.subplots()

# set up map projection
#m = Basemap(projection='nsper',lon_0=-0,lat_0=90)
parallels = np.arange(-90,90+30,30.)
meridians = np.arange(-180,180+60,60)

m = Basemap(projection='cyl', llcrnrlon=min(meridians), llcrnrlat=min(parallels),
        urcrnrlon=max(meridians), urcrnrlat=max(parallels))

# draw costal line and lat lon lines
m.drawcoastlines()
m.drawparallels(parallels)
m.drawmeridians(meridians)

# setup contour levels and colarmap
clevs = np.linspace(270, 310, 21)
cmap=plt.get_cmap("jet")

# Open Data Files which list the filesnames to be processed
f = open('data_files.list', 'r')

# ims is a list of lists, each row is a list of artists to draw in the
# current frame; here we are animating two artists, the contour and a annotatons (title) in each frame
ims = []
# read each data file in the list
for line in f:
    filename = line.strip()
    ncin = Dataset(filename, 'r')
    lon = ncin.variables['lon'][:]
    lat = ncin.variables['lat'][:]
    data = ncin.variables['analysed_sst'][:]
    ncin.close()
    lons,lats = np.meshgrid(lon,lat)

    cs=m.contourf(lons,lats, data[0,:,:].squeeze(), clevs, cmap=cmap)
    m.drawcoastlines()
    m.fillcontinents(color='#000000',lake_color='#99ffff')
    m.drawparallels(parallels,labels=[1,0,0,0])
    meri = m.drawmeridians(meridians,labels=[1,0,0,1])

    add_arts = cs.collections
    te = ax.text(-180, 99, filename, va='center')

    cb = m.colorbar(cs, 'right', size='5%', pad='2%')
    cb.set_label('SST (K)', fontsize=10)

    for i in meri:
      try:
        meri[i][1][0].set_rotation(45)
      except:
        pass

    ims.append(add_arts + [te])

ani = animation.ArtistAnimation(fig, ims)

# save the animation as an mp4.  This requires ffmpeg or mencoder to be
# installed.  The extra_args ensure that the x264 codec is used, so that
# the video can be embedded in html5.  You may need to adjust this for
# your system: for more information, see
# http://matplotlib.sourceforge.net/api/animation_api.html
#ani.save('python_anim_dataset.mp4', fps=30, extra_args=['-vcodec', 'libx264'])

plt.show()
