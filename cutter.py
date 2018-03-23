## Imports
import os
import wave
import contextlib
from math import ceil
from pydub import AudioSegment

## Cutting function

def cutter(file_name,length):
	'''take a wave file in argument and return the sound cut in multiple 
	wav files of a length define by the eponym argument'''
	with contextlib.closing(wave.open(file_name,'r')) as f:
		frames = f.getnframes() 
		rate = f.getframerate()
		duration = frames / float(rate)
	n_files = ceil(duration/length) #the number of files in output
	if not os.path.exists(file_name[:-4]):
		os.makedirs(file_name[:-4]+'_files') #create a directory for all the files
	for i in range(n_files):
		newAudio = AudioSegment.from_wav(file_name)
		newAudio = newAudio[i*length*1000:(i+1)*length*1000]
		os.chdir(os.getcwd()+'/'+file_name[:-4]+'_files/')
		newAudio.export(file_name[:-4] + '-{0}.wav'.format(i+1), format="wav") #Exports to a wav file in the current path
		os.chdir(os.path.normpath(os.getcwd() + os.sep + os.pardir))










