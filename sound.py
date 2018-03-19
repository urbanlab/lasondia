import pygame
import matplotlib.pyplot as plt
from scipy.io import wavfile
import numpy as np
from math import ceil,log10

file = "piano.wav"

# Plot and play sound
sampFreq, snd = wavfile.read(file)
n = snd.shape[0] #number of elements
print(snd.shape)
snd = snd / (2.**15) #snd in int16 -> normalization
if len(snd.shape)>1:
	snd = snd[:,0] #select only the first channel
timeArray = np.arange(0, n, 1)
timeArray = timeArray / sampFreq
timeArray = timeArray * 1000  #scale to milliseconds
plt.plot(timeArray, snd, color='k')
plt.ylabel('Amplitude')
plt.xlabel('Time (ms)')

pygame.mixer.init()
pygame.mixer.Sound(file).play()
while pygame.mixer.get_busy():
    # lecture en cours
    plt.show()
    pass
plt.close()

#Fourier transformtion
p = np.fft.fft(snd)
nUniquePts = int(ceil((n+1)/2.0))
p = p[0:nUniquePts]
p = abs(p)
p = p / float(n) #scale by the number of points so that
                 #the magnitude does not depend on the length 
                 # of the signal or on its sampling frequency
p = p**2  # square it to get the power 
if n % 2 > 0: # we've got odd number of points fft
    p[1:len(p)] = p[1:len(p)] * 2
else:
    p[1:len(p) -1] = p[1:len(p) - 1] * 2 # we've got even number of points fft

freqArray = np.arange(0, nUniquePts, 1.0) * (sampFreq / n);
plt.plot(freqArray/1000, 10*np.log10(p), color='k')
plt.xlabel('Frequency (kHz)')
plt.ylabel('Power (dB)')
plt.show()

