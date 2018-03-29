#!/usr/bin/env python3
import subprocess
import os, sys
from os import listdir
from os.path import exists, splitext, isdir

infile_extension = ".mp3"
folder = "all-samples"

outfolder = "samples"
outfile_extension = ".wav"

if (exists(folder) == False):
    sys.stderr.write("You didn't type a valid folder then it won't work\nAborting...\n")
    sys.exit(84)
if (exists(outfolder) == False):
    if (os.makedirs(outfolder) != None):
        sys.stderr.write("There was a problem creating \"" + outfolder + "\" folder\nAborting...\n")
        sys.exit(84)

def convert_folder(args):
    for f in listdir(args):
        if (f.endswith(infile_extension)):
            outfile = outfolder + '/' + splitext(f)[0] + outfile_extension
            infile = args + '/' + f
            subprocess.run(['ffmpeg', '-y', '-i', infile, '-strict', '-2', outfile])
        else:
            if (isdir(args + '/' + f)):
                convert_folder(args + '/' + f)

convert_folder(folder)