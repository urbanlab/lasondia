#!/usr/bin/env python3
import subprocess
import os, sys
from os import listdir
from os.path import exists, splitext

infile_extension = ".ts"
folder = "Workshop erasme enregistrements/3015/storage.sbg1.cloud.ovh.net/v1/AUTH_751b44b97edb45d49f529e1674ec3723/sb-0079"

outfolder = "sounds"
outfile_extension = ".wav"

if (exists(folder) == False):
    sys.stderr.write("You didn't type a valid folder then it won't work\nAborting...\n")
    sys.exit(84)
if (exists(outfolder) == False):
    if (os.makedirs(outfolder) != None):
        sys.stderr.write("There was a problem creating \"" + outfolder + "\" folder\nAborting...\n")
        sys.exit(84)
for f in listdir(folder):
    if (f.endswith(infile_extension)):
        outfile = outfolder + '/' + splitext(f)[0] + outfile_extension
        infile = folder + '/' + f
        subprocess.run(['ffmpeg', '-y', '-i', infile, '-strict', '-2', outfile])
    else:
        sys.stderr.write(f, "is not a", infile_extension, "file\n")
