//--------------------------------------------------------------------------------------------------------------
// When the page is ready, we add the add-a-gommette buttons and the recording-on/off button to the page.
// The gommette buttons are generated using the gommettes variable created in the html page.
//--------------------------------------------------------------------------------------------------------------

$(document).ready(function() {

  gommettes.forEach(function(gommette) {
      var gommette_container = $("<div class='gommette_container'></div>");
      var gommette_button = $("<div class='gommette_button'></div>").html("<img src='"+gommette.image_src+"' height=50em>");
      var gommette_comment = $("<div class='gommette_comment'></div>").text(gommette.comment);

      gommette_button.on('click', () => {if(recording) add_gommette(gommette.identifier)});

      gommette_container.append(gommette_button);
      gommette_container.append(gommette_comment);
      $('.colorGroup').append(gommette_container);
  });

  $('#btnStartStop_label').text('Enregistrer (min. )' + String(min_record_length) + ' sec');

  $("#btnStartStop").click(function() {
    if(!recording) {
      start_recording_for_stream();
      start_recording_for_interface();
    } else {
      stop_recording_for_stream();
      stop_recording_for_interface();
    }
  });

});
