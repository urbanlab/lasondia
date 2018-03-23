import io
import os
import wave
import contextlib
from pydub import AudioSegment

# Imports the Google Cloud client library
from google.cloud import speech
from google.cloud.speech import enums
from google.cloud.speech import types

def speechtotext(file_path,file):
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
        output_path = file_path + file[:-4] + '_mono.wav'
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
        return('{}'.format(result.alternatives[0].transcript))

