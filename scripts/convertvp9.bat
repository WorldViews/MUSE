echo %1 -> %2
ffmpeg -y -hwaccel cuvid -i %1 -c:v libvpx-vp9 -b:v 6000k -pass 1 -an -f webm %2
ffmpeg -y -hwaccel cuvid -i %1 -c:v libvpx-vp9 -b:v 6000k -pass 2 -c:a libopus -b:a 64k -f webm %2
