#!/usr/bin/python
# -*- coding: utf-8 -*-

import io
import sys
import os
import wave
import json
import datetime
import contextlib
from pydub import AudioSegment
from cutter import cutter
import numpy as np

import pickle


# Imports the Google Cloud client library
from google.cloud import speech
from google.cloud.speech import enums
from google.cloud.speech import types

def stringify_bytes_contents(dictionnary):
    """
    For each key and value of a dictionnary, if it is a bytes object, turn it into a string.
    Enables writing this dictionnary into a json file.
    """
    dic = dictionnary.copy()
    for key in dic:
        try:
            dic[key] = dic[key].decode()
        except AttributeError:
            pass
        try:
            dic[key.decode()] = dic[key]
            dic.pop(key)
        except AttributeError:
            pass
    return dic

def speechtotext(file,file_path):
    '''speech to text for a file of less than a minute'''
    # Instantiates a client
    client = speech.SpeechClient()

    # The name of the audio file to transcribe
    file_name = os.path.join(
        os.path.dirname(__file__),
        file_path,
        file)

    #If the sound is in stereo transform it in mono
    audiodata = wave.open(file_name)
    nchannels = audiodata.getnchannels()
    if nchannels > 1:
        sound = AudioSegment.from_wav(file_name)
        sound = sound.set_channels(1)
        output_path = file_path + '/' + file[:-4] + '_mono.wav'
        sound.export(output_path, format="wav")
        file_name = output_path

    # Loads the audio into memory
    with io.open(file_name, 'rb') as audio_file:
        content = audio_file.read()
        audio = types.RecognitionAudio(content=content)

    with contextlib.closing(wave.open(file_name,'r')) as f:
    	rate = f.getframerate()

    config = types.RecognitionConfig(
        encoding=enums.RecognitionConfig.AudioEncoding.LINEAR16,
        sample_rate_hertz=rate,
        language_code='fr-FR')

    # Detects speech in the audio file
    response = client.recognize(config, audio)
    for result in response.results:
        return(result.alternatives[0].transcript.encode('utf-8'))

def analyse(file_name,file_path=os.getcwd()):
    '''from an audio return the files of the selected duration,
    analyse if each file is music or voice and give the text'''
    duration = 3
    cutter(file_name,duration)
    os.chdir(os.getcwd()+'/'+file_name[:-4]+'_files/')
    files = os.listdir(os.getcwd()) #get a list of all the audio
    files.sort()
    output = []
    for file in files:
        text = speechtotext(file,os.getcwd())
        print(text)
        output.append((file,text))
    return output

## write the json file
os.chdir(sys.argv[2])
output = analyse(sys.argv[1], sys.argv[2])
os.chdir(os.path.normpath(os.getcwd() + os.sep + os.pardir))
data = []
for i in range(len(output)):
    if output[i][1] == None:
        data.append({
       'music' : True,
       'time' : str(datetime.timedelta(seconds=i*3)),
       'voice' : None,
       'end_time' : str(datetime.timedelta(seconds=(i+1)*3))
        })
    else:
        data.append({
       'music' : False,
       'time' : str(datetime.timedelta(seconds=i*3)),
       'voice' : output[i][1],
       'end_time' : str(datetime.timedelta(seconds=(i+1)*3))
        })
data = [stringify_bytes_contents(dict) for dict in data]
date = {'date' : datetime.datetime.now().strftime("%a %d/%m/%Y %H:%M")}
json_name = output[0][0][:-9] + '_voices.json'
with open(json_name, 'w') as f:
    json.dump(data, f, indent=4, sort_keys=False, ensure_ascii=False)
with open('date.json', 'w') as f:
    json.dump(date, f, indent=4, sort_keys=False, ensure_ascii=False)