#!/usr/bin/env python
# -*- coding: utf-8 -*-


#-------------------------------------------------------------------------------------------------------------------------
# Import modules
#-------------------------------------------------------------------------------------------------------------------------

import numpy as np
from pyAudioAnalysis import audioSegmentation as aS
from pyAudioAnalysis import audioBasicIO as aIO

import datetime
import json
import io
import sys
import os

#-------------------------------------------------------------------------------------------------------------------------
# Define functions used for calculations
#-------------------------------------------------------------------------------------------------------------------------

def audio_segmentation(wav_file_path, classifier_type, classifier_path):
	"""
		Main function: takes a .wav file, and a scikit-learn classifier as arguments. Returns a partition of the sound track
		into segments of silence, of speech or of music.

		Example: audio_segmentation(path_to_wav_file, 'svm', path_to_svm_pickle_object)
		See pyAudioAnalysis's code and documentation for the list of possible classifiers.
		For this to work, the 'classifier' and 'classifier.arff' files must be in the same directory, as
		('classifier' + 'classifier.arff' = trained_classifier) 
	"""

	[Fs, x] = aIO.readAudioFile(wav_file_path)
	startTime = 0
	endTime = x / float(Fs)
	sound_segments = aS.mtFileClassification(wav_file_path, classifier_path, classifier_type, return_for_user=True)

	segments = sound_segments['segments']
	classes = sound_segments['classes']
	silences = detect_silences(wav_file_path)

	final_segmentation = incorporate_silences_to_segments(segments, classes, silences)
	return final_segmentation



def detect_silences(wav_file_path, min_silence_size=2, min_sound_size=2):
	"""
		Returns the list of the silences in a sound track, as a list of time segments.
		It is done separately from classification as the algorithm to detect silences is
		not the same (see https://github.com/tyiannak/pyAudioAnalysis/wiki/5.-Segmentation for
		more explanations)
	"""

	# We detect all the periods with significant sound level as an array: sound_segments
	[Fs, x] = aIO.readAudioFile(wav_file_path)
	startTime = 0
	endTime = len(x) / float(Fs)
	sound_segments = aS.silenceRemoval(x, Fs, 0.020, 0.020, smoothWindow = 1., Weight=0.5, plot=False)
	if sound_segments == []:
		return [[startTime, endTime]]

	# We define silence segments as the complementary of sound_segments
	silence_segments = [[startTime, sound_segments[0][0]]]
	n = len(sound_segments)
	for i in range(n - 1):
		silence_segments.append([sound_segments[i][1], sound_segments[i+1][0]])
	silence_segments.append([sound_segments[n - 1][1], endTime])

	# We remove short silences (false positives)
	silence_segments = [segment for segment in silence_segments if segment[1] - segment[0] >= min_silence_size]
	
	# We remove short sounds surrounded by silences (false negatives)
	n_silences = len(silence_segments)
	merge_with_next = [(silence_segments[i+1][0] - silence_segments[i][1] <= min_sound_size) for i in range(n_silences - 1)]

	for i in range(n_silences - 1, 0, -1):
		if merge_with_next[i - 1]:
			silence_segments[i -1][1] = silence_segments[i][1]
			silence_segments.pop(i)

	if silence_segments[0][0] - startTime < min_sound_size:
		silence_segments[0][0] = startTime
	if endTime - silence_segments[-1][1] < min_sound_size:
		silence_segments[-1][1] = endTime

	# We round time values to have the same format as for classified sound segments (we have to leave the last value unchanged)
	last_value = silence_segments[-1][1]
	silence_segments = np.array(silence_segments)
	silence_segments = np.round(silence_segments)
	if last_value == endTime:
		silence_segments[-1, 1] = endTime

	# We return the filtered silence segment list
	return silence_segments


def incorporate_silences_to_segments(segments, classes, silences):
	"""
		The classification and silence detection algorithms return two different
		lists of time segments. This function merges these two lists into a time
		partition of the sound track, for example: 
		[{'segment': [0, t1], 'class': 'silence'}, {'segment': [t1, t2], 'class': 'music'}, ...]
	"""
	n_seg = len(segments)
	n_sil = len(silences)
	segs = [{'segment': segments[i], 'class': classes[i]} for i in range(n_seg)]
	for i in range(n_sil):
		incorporate_silence_to_segments(silences[i], segs)
	segs = [seg for seg in segs if seg['segment'][1] > seg['segment'][0]]
	return segs


def incorporate_silence_to_segments(sil, segs):
	"""
		Incorporates a silence time segment sill into the time partition constructed above, segs.
	"""

	# We can't use a 'for' loop, as segs is modified during the loop. We use index to iterate through
	# the list and length to stop iterating when we reach its end.
	index = 0
	length = len(segs)

	while index < length:

		seg = segs[index]

		if seg['class'] == 'silence':
			index += 1

		else:

			intersection = qualify_intersection(seg['segment'], sil)

			if intersection == 's1 equals s2':
				seg['class'] = 'silence'
				return

			elif intersection == 's1 includes s2':
				new_segments = [{'segment': [seg['segment'][0], sil[0]], 'class': seg['class']},
								 {'segment': sil,                         'class': 'silence'},
								 {'segment': [sil[1], seg['segment'][1]], 'class': seg['class']}]
				segs.pop(index)
				segs.insert(index, new_segments[0])
				segs.insert(index + 1, new_segments[1])
				segs.insert(index + 2, new_segments[2])
				return

			elif intersection == 's2 includes s1':
				segs.pop(index)
				length -= 1

			elif intersection == 's1 intersects s2 s1_ends_in_s2':
				seg['segment'][1] = sil[0]
				index += 1

			elif intersection == 's1 intersects s2 s1_starts_in_s2':
				seg['segment'][0] = sil[1]
				segs.insert(index, {'segment': sil, 'class': 'silence'})
				return

			else: #no intersection
				index += 1

	raise ValueError('All the partition has been evaluated and still the silence segment ' + str(sil) + ' could not be inserted. This should not be possible, by definition of a partition')


def qualify_intersection(s1, s2):
	"""
	Textually describes the nature of the intersection of two segments s1 and s2.
	We use this to make the 'incorporate_silence_to_segments' function easier to
	read and understand
	"""
	[s11, s12] = s1
	[s21, s22] = s2
	if (s1 == s2).all():
		return 's1 equals s2'
	elif s11 <= s21 <= s22 <= s12:
		return 's1 includes s2'
	elif s21 <= s11 <= s12 <= s22:
		return 's2 includes s1'
	elif s11 <= s21 <= s12:
		return 's1 intersects s2 s1_ends_in_s2'
	elif s21 <= s11 <= s22:
		return 's1 intersects s2 s1_starts_in_s2'
	else:
		return 'no_intersection'


def stringify_bytes_contents(dictionnary):
    """
    Utility function. For each key and value of a dictionnary, if it is a bytes object, turn it
    into a string. Enables writing this dictionnary into a json file.
    """
    dic = dictionnary.copy()
    dic_keys = list(dic.keys())
    for key in dic_keys:
        try:
            dic[key] = dic[key].decode('utf-8')
        except AttributeError:
            pass
        try:
            dic[key.decode()] = dic[key]
            dic.pop(key)
        except AttributeError:
            pass
    return dic

#-------------------------------------------------------------------------------------------------------------------------
# Main program
#-------------------------------------------------------------------------------------------------------------------------

# Handle the path system
record_file_path = sys.argv[1]  # "/home/erasme/Téléchargements/fullRecord.wav"
data_directory = os.path.dirname(record_file_path)
python_directory = os.path.dirname(os.path.realpath(__file__))


# Record the current date into a JSON file 
date = {'date' : datetime.datetime.now().strftime("%a %d/%m/%Y %H:%M")}
with open(os.path.join(data_directory, 'date.json'), 'w') as dateFile:
	json.dump(date, dateFile, indent=4, sort_keys=False, ensure_ascii=False)

# Record the results of the segmentation into a JSON file
segments = audio_segmentation(record_file_path, 'svm', os.path.join(python_directory, 'svmSM'))
JSON_data = []
for s in segments:
	JSON_segment = {'startTime': s['segment'][0], 'endTime': s['segment'][1], 'class': s['class']}
	JSON_segment = stringify_bytes_contents(JSON_segment)
	JSON_data.append(JSON_segment)

with open(os.path.join(data_directory, 'segments.json'), 'w') as resultsFile:
	json.dump(JSON_data, resultsFile, indent=4, sort_keys=False, ensure_ascii=False)

