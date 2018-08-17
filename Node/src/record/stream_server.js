//--------------------------------------------------------------------------------------------------------------
// This script opens a connection with the binary server and sends the audio stream from the micro to it.
//--------------------------------------------------------------------------------------------------------------

var liveVolume;

(function(window) {
  
  // we use a closure here, in order to isolate all the recording variables
  var client = new BinaryClient('ws://192.168.70.119:9001');


  client.on('open', function() {
    // When the page manages to connect to the binary server:

    // Load the navigator's sound recorder webkit, and requests the user for their micro
    if (!navigator.getUserMedia)
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||navigator.mozGetUserMedia || navigator.msGetUserMedia;

    if (navigator.getUserMedia) {
      navigator.getUserMedia({audio:true}, success, function(e) {
        alert('Error capturing audio.');
      });
    } else alert('getUserMedia not supported in this browser.');

    var recording_for_stream = false;

    // Define the recorder's behaviour

    window.start_recording_for_stream = function() {
      // When the page starts recording
      recording_for_stream = true;
      window.Stream = client.createStream();
    }

    window.stop_recording_for_stream = function() {
      // When the page stops recording
      recording_for_stream = false;
      window.Stream.end();
    }

    function success(e) {
      // Initialization of the stream when the navigator successfully starts recording
      audioContext = window.AudioContext || window.webkitAudioContext;
      context = new audioContext();

      // (the sample rate is in context.sampleRate)
      audioInput = context.createMediaStreamSource(e);
      var bufferSize = 2048;
      recorder = context.createScriptProcessor(bufferSize, 1, 1);

      recorder.onaudioprocess = function(e){
        // Define how the audio stream is handled
        if(!recording_for_stream) return;

        var left = e.inputBuffer.getChannelData(0);
        liveVolume = 0;
        for(i = 0; i < left.length; i++){
          liveVolume += abs(left[i]);
        }
        liveVolume /= left.length;
        window.Stream.write(convertoFloat32ToInt16(left));
      }

      audioInput.connect(recorder)
      recorder.connect(context.destination);

    }
    function convertoFloat32ToInt16(buffer) {
      // Utility function : int32 to int16 conversion in order to send data to the
      // binary server (which handles 16-bits data)
      var l = buffer.length;
      var buf = new Int16Array(l)

      while (l--) {
        buf[l] = buffer[l]*0xFFFF;    //convert to 16 bit
      }
      return buf.buffer
    }
  });
})(this);
