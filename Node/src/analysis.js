//-------------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------------
// Define constants
//-------------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------------

var recordId = window.location.hash.substr(1, window.location.hash.length);

// Data used to initialize the page
var gommettes = [{'time':10, 'color':'red', 'labelText': 'essai_gommette','id':'gommette_0'}];
var p;
var path = "/records/"+recordId+"/";


// Data used to memorize
    // - the menus to be displayed
    // - the mode of the application (listen or edit)
    // - the edition mode, when the user is editing the visualization
    // - the state of the loop segments and gommettes before the user edits them, to be able to undo changes
    // - the segment / gommette being edited
    // - the number of loop segments / gommettes created, to be able to create a new id for each new element created
    // - the position of the reading head when we switch to edit mode, to come back there when we switch back to listen mode
var app_mode = 'listen';
var listen_mode = 'continuous';
var edition_mode = 'menu';
var save_of_gommettes = [];
var save_of_segments = [];
var last_segment_id = null;
var last_gommette_id = null;
var last_color = null;
var nb_segments_created = 0;
var nb_gommettes_created = 0;
var audio_duration;
var listening_mode_playhead_position = 0;

var initial_gommettes_list;
var initial_loops_list;
var background_segment_list;

// Data used to display every segment/gommette with its own color
var colors = ['cyan', 'blue', 'olive', 'green', 'orange', 'yellow', 'maroon', 'purple', 'fuschia'];
var colors_in_use = [];
var loop_colors = {};


//-------------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------------
// Functions used to transformed the initialization data sent by the server into visualization data
//-------------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------------

function get_record_title(date) {
    var days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    var frenchDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    var french = frenchDays[days.indexOf(date.substr(0, 3))];
    var title = "Cours du " + french + " " + date.substr(4, date.length);
    return title;
}

function initialize_counters() {

}

//-------------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------------
// Main program
//-------------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------------

window.onload = function() {
    socket.emit('listen_and_edit/require_initialization', recordId);

    socket.on('listen_and_edit/initialization_data', function(data) {
        var date = data.date;
        initial_gommettes_list = data.gommettes;
        initial_loops_list = data.loops;
        background_segment_list = data.segments;

        $('title').html(get_record_title(date));
        $('#create_audio').html("<audio onloadeddata=\"initialize_peaks()\" preload=\"true\" controls id=\"audio\"><source src=\"" + path + "fullRecord.wav\" id=\"audio_source\" type=\"audio/wav\"></audio><script src=\"/node_modules/peaks.js/peaks.js\"></script>");
    })
}

function initialize_counters() {
    var gommette_ids = p.get_gommettes().map((g) => g.id).filter((id) => id.includes('User-created gommette'));
    var gommettes_numbers = gommette_ids.map((id) => parseInt(id.split(' ')[2]));
    nb_gommettes_created = Math.max(0, Math.max.apply([], gommettes_numbers));

    var loop_ids = p.get_segments().map((s) => s.id).filter((id) => id.includes('loop_'));
    var loop_numbers = loop_ids.map((id) => parseInt(id.split('_'))[1]);
    nb_segments_created = Math.max(0, Math.max.apply([], loop_numbers));
}

//-------------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------------
// Initialization of the view (isolated in a closure; and delayed to avoid asynchronousness-related issues)
//-------------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------------

function initialize_peaks() {
    // This function creates the peaks object used to interact with the sound record, customizes it adding our own
    // high-level methods, and sets the page application contents visibility to 'visible'.
    setTimeout(() => {
        (function(Peaks) {
            // After 50ms, we create the peaks object and prepare the page to interact with it
            var myAudioContext = new AudioContext();

            var options = {
                container: document.getElementById('peaks-container'),
                mediaElement: document.querySelector('audio'),
                audioContext: myAudioContext,
                zoomLevels: [512, 1024, 2048, 4096],
                // Colour for the zoomed in waveform
                zoomWaveformColor: 'rgba(0, 225, 128, 1)',
                // Colour for the overview waveform
                overviewWaveformColor: 'rgba(0,0,0,0.2)',
                // Colour for the overview waveform rectangle
                // that shows what the zoom view shows
                overviewHighlightRectangleColor: 'grey',
                // Colour for the in marker of segments
                inMarkerColor: '#a0a0a0',
                // Colour for the out marker of segments
                outMarkerColor: '#a0a0a0',
                // Colour of the play head
                playheadColor: 'rgba(0, 0, 0, 1)',
                // Colour of the play head text
                playheadTextColor: '#aaa',
                // Colour of the axis gridlines
                axisGridlineColor: '#ccc',
                // Colour of the axis labels
                axisLabelColor: '#aaa',
                // Zoom view adapter to use. Valid adapters are:
                // 'animated' (default) and 'static'
                zoomAdapter: 'animated',
                // Array of initial segment objects with startTime and
                // endTime in seconds and a boolean for editable.
                // See below.
            }

            p = Peaks.init({
                container: options.container,
                mediaElement: options.mediaElement,
                audioContext: options.audioContext,
                zoomLevels: options.zoomLevels,
                segments: [],
                zoomAdapter: options.zoomAdapter,
                playheadColor: options.playheadColor,
                points: []
            });

            add_custom_methods(p);

            p.add_segments(background_segment_list, segments_are_loops=false);
            p.add_segments(initial_loops_list, segments_are_loops=true);
            p.add_gommettes(initial_gommettes_list);

            initialize_counters();

            p.on('zoom.update', function(before, after) {
                // Function called when the zoom in / zoom out functionalities are used
                console.log(before);
                console.log(after);
            });

            p.on('segments.dragged', function(segment) {
                // When an editable segment is being dragged, set the reading head position
                // to its center. The peaks.js api lacks the dragstart and dragend events, and
                // this is the only way to select the segment when we are done dragging it (we can't
                // highlight a dragged segment without dropping it) :-(
                if (edition_mode == 'edit_segments') {
                    this.player.seek((segment.startTime + segment.endTime) / 2);
                }
            });

            p.on('points.dragged', function(point) {
                // When a gommette is being dragged, we select it for edition and we put the reading head
                // into it to show this is the gommette in edition. Highlighting it just by changing its color
                // will drop the segment :-(
                if(edition_mode == 'edit_gommettes') {
                    select_gommette_for_edition(point);
                    if(last_gommette_id != null) {
                        this.player.seek(point.time);
                    }
                }
            });

            $('.waveform').on('click', function() {
                // When the user clicks on the waveform inside a segment loop, we select it for edition and we make it appear
                // in red to show this is the segment loop in edition.
                if (edition_mode == 'edit_segments') {
                    var current_time = p.player.getCurrentTime();
                    var active_segment = p.get_context_segment(current_time);
                    select_segment_for_edition(active_segment);
                }
            });

        })(peaks);
        // And then we set the page contents to 'visible' (we also initialize the listen loop, see its definition for more precisions)
        audio_duration = $('audio')[0].duration;
        initialize_menus();
        p.listenLoop(0, null, 0.050);
    }, 50);

}

//-------------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------------
// We add to p methods that are more adapted to our application
//-------------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------------

function add_custom_methods(p) {
    // Add higher-level interaction methods to the peaks object p. For the rest of
    // this program, we will be interacting with p using these methods only.

    p._get_copy_of_segment = function(segment) {
        // Get a copy of the segment 'segment'. Modifying this copy won't affect
        // the p.segments._segments object (the API getters p.segments.getSegment(s) being
        // imperfect for this aspect)
        if(segment == null) {
            return null;
        } else {
            return {
                'color' : segment.color,
                'editable' : segment.editable,
                'startTime' : segment.startTime,
                'endTime' : segment.endTime,
                'id' : segment.id,
                'labelText' : segment.labelText
            };     
        }
    }

    p.get_segment = function(id) {
        // Get a copy of the segment of id 'id'.
        var segment = this.segments.getSegment(id);
        return this._get_copy_of_segment(segment);
    }


    p.get_segments = function() {
        // Get a copy of the loop segment list. Ignore background segments.
        var segment_objects = this.segments.getSegments();
        var segments = segment_objects.filter((segment) => !segment.id.includes('static'));
        segments = segments.map(this._get_copy_of_segment)
        return segments;
    }

    p.remove_segment = function(id) {
        // Remove the segment of id 'id'from the visualization. Update it.
        var segment = this.segments.getSegment(id);
        this.segments.removeById(id);
        this.points.removeById('lower_'+id);
        this.points.removeById('upper_'+id);
        var removed_color = loop_colors[id];
        if(removed_color != undefined) {colors_in_use.pop(colors_in_use.indexOf(removed_color))};
    }

    p.remove_all_segments = function() {
        // Remove all loop segments from the visualization. Update it.
        var segments = this.segments.getSegments();
        var ids_to_remove = segments.map((segment) => segment.id).filter((id) => !id.includes('static'));
        ids_to_remove.forEach((id) => this.remove_segment(id));
    }

    p.add_segments = function(segments, segments_are_loops=true) {
        // Add every segment in the list 'segments' to the visualization. If the segments are loop segments,
        // make them transparent (if they are not explicitely given a color, see select_segment_for_edition) and
        // delimit them using two points of the same color. If they're background segments (i.e. theit function is
        // to display if a time period is voice or if it is music), do not delimit them using points (a color must
        // then be precised). Update the visualization. (Note: segments loops in edition do not have their extremity
        // points displayed).
        if(segments_are_loops) {
            segments.forEach((segment) => {
                var segment_to_add = this._get_copy_of_segment(segment);
                segment_to_add.color = (segment.color == undefined) ? 'transparent' : segment.color;
                if (segment.id == null) {
                    nb_segments_created ++;
                    segment_to_add.id = 'loop_' + String(nb_segments_created);
                };
                this.segments.add([segment_to_add]);

                var color;
                if(loop_colors[segment_to_add.id] != null) {
                    color = loop_colors[segment_to_add.id];
                } else {
                    color = random_color();
                    loop_colors[segment_to_add.id] = color;
                };
                    colors_in_use.push(color);
                    
                if(!segment_to_add.editable){
                    var lower_limit = {'time': segment.startTime, 'color': color, 'editable': false, 'id': 'lower_'+segment_to_add.id};
                    var upper_limit = {'time': segment.endTime,   'color': color, 'editable': false, 'id': 'upper_'+segment_to_add.id};
                    this.points.add([lower_limit, upper_limit]);
                }        
            });
        } else {
            this.segments.add(segments);
        };
    }

    p.change_segment_attribute = function(id, attribute, new_value) {
        // Sets the attribute 'attribute' of the loop segment of id 'id' to the value 'new_value',
        // and updates the visualization. Note: if the segment is being dragged when this function is
        // called, it will be dropped.
        var modified_segment = this.get_segment(id);
        modified_segment[attribute] = new_value;
        this.remove_segment(id);
        this.add_segments([modified_segment]);
    }

    p._get_copy_of_point = function(point) {
        // Get a copy of the point 'point'. Prevents modifications of this point to impact the peaks object p.
        if(point == null) {
            return null
        } else {
            return {'time':point.time, 'color':point.color, editable:point.editable, 'labelText':point.labelText, 'id':point.id};
        }
    }

    p.get_gommette = function(id) {
        // Get a copy of the gommette of id 'id'
        var gommette = this.points.getPoint(id);
        return p._get_copy_of_point(gommette);
    }

    p.get_gommettes = function() {
        // Gets a copy of the gommettes list. (ignore the points which are segmet extremities)
        var point_list = this.points.getPoints();
        var gomettes = point_list.filter((point) => point.id.includes('gommette'));
        gommettes = gommettes.map((point) => this._get_copy_of_point(point));
        return gomettes
    }

    p.add_gommettes = function(gommettes) {
        // Add every gommette in the list 'gommettes' to the visualization. Update it.
        this.points.add(gommettes);
    }

    p.remove_gommette = function(id) {
        // Remove a gommette and update the visualization.
        this.points.removeById(id); 
    }

    p.remove_all_gommettes = function() {
        // Remove all the gommettes and update the visualization.
        var gommettes = this.get_gommettes();
        gommettes.forEach((gommette) => this.remove_gommette(gommette.id));
    }

    p.change_gommette_attribute = function(id, attribute, new_value) {
        // Sets the attribute 'attribute' of the gommette of id 'id' to the value 'new_value',
        // and updates the visualization. Note: if the gommette is being dragged when this function is
        // called, it will be dropped.
        var modified_gommette = this.get_gommette(id);
        modified_gommette[attribute] = new_value;
        this.remove_gommette(id);
        this.add_gommettes([modified_gommette]);
    }

    p.get_landmarks = function() {
        // Get all the segment loop extremities and gommette dates of the visualization,
        // and return them as a sorted array.
        var segments = this.get_segments();
        var gommettes = this.get_gommettes();
        var landmarks = [0];
        segments.forEach(function(segment) {
            landmarks.push(segment.startTime);
            landmarks.push(segment.endTime);
        });
        gommettes.forEach(function(gommette) {
            landmarks.push(gommette.time);
        })
        landmarks.sort((x,y) => x - y);
        landmarks = landmarks.filter((landmark, index) => index == 0 || landmark != landmarks[index - 1]);
        return landmarks
    }

    p.get_context_segment = function(time) {
        // Returns the time segment (potentially null) which contains the date 'time'
        var segment_list = this.get_segments();
        for(const segment of segment_list) {
            if(time >= segment.startTime && time <= segment.endTime) {
                return segment;
            };
        };
        return null
    }

    p.listenLoop = function(previous_time, previous_segment, loop_time) {
        // Listen to the peak object in order to detect when the reading head leaves the end of a loop section (named segment here).
        // When it happens, loop back to the beginning of this segment.
        if(app_mode == 'listen') {
            var current_time = this.player.getCurrentTime();
            var current_segment = this.get_context_segment(current_time);
            if(listen_mode == 'loop') {
                if (current_time >=  previous_time && (current_time - previous_time) <= 2 * loop_time) { // if the reading head wasn't moved manually
                    if (previous_segment != null && !are_equal(current_segment, previous_segment)) {     // and it arrives at the end of a segment
                        this.player.seek(previous_segment.startTime);                                    // then loop
                        current_segment = previous_segment;
                    };
                };
            };
        } else {
            this.player.pause();
        }
        setTimeout(() => this.listenLoop(current_time, current_segment, loop_time), loop_time * 1000);
    }
}

//-------------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------------
// Utility functions for calculations
//-------------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------------

function are_equal(array1, array2) {
    // Return true if the two arrays of numbers array1 an array2 have the same content
    if(array1 == null || array2 == null) return false;
    if(array1.length != array2.length) return false;
    for(var i=0; i < array1.length; i++){
        if(array1[i] != array2[i]) return false;
    };
    return true;
}

function intersection_is_empty(segment_list) {
    // Determines if two segments in a segment list to intersect. We have:
    // [a1, a2] intersects [b1, b2] if a1<=b1<=a2 or a1<=b2<=a2 or b1<=a1<=a2<=b2.
    // This function also returns false if a segment is empty (a1 = a2), which is convenient here.
    var landmarks = [];
    segment_list.forEach(function(segment) {
        landmarks.push(segment.startTime);
        landmarks.push(segment.endTime);
    });
    landmarks.sort((x,y) => x - y);
    for(const segment of segment_list) {
        if(landmarks.indexOf(segment.endTime) - landmarks.indexOf(segment.startTime) != 1) {
            return false
        }
    }
    return true;
}

function random_color() {
    // Picks a random unused color in the 'colors' list, in order to apply it to the 
    // displayed loop segments.
    var available_colors = colors.filter((color) => !colors_in_use.includes(color));
    if(available_colors.length == 0) {
        console.error('Plus de couleur disponible. Des couleurs seront répétées.')
        available_colors = colors;
    }
    var nb_colors = available_colors.length;
    var color_picked = Math.floor(Math.random() * nb_colors);
    return available_colors[color_picked];
}

//-------------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------------
// Utility functions for displaying the right html elements
//-------------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------------

function display_comment_menu(menu) {
    // Sets what is displayed in the upper-left menu: null for nothing,
    // 'segment' or 'gommette' for the comment interfaces
    $('.comment').val('');
    switch (menu) {
        case null:
            $('#comment_segment_cell').css('display', 'none');
            $('#comment_gommette_cell').css('display', 'none');
            break;
        case 'segment':
            $('#comment_segment_cell').css('display', 'flex');
            $('#comment_gommette_cell').css('display', 'none');
            break;
        case 'gommette':
            $('#comment_segment_cell').css('display', 'none');
            $('#comment_gommette_cell').css('display', 'flex');
            break;
    }
}

function display_edit_menu(menu) {
    // Sets what is displayed in the upper-right menu: null for nothing,
    // 'segment' or 'gommette' for the Supprimer/Annuler/Terminer options
    switch (menu) {
        case null:
            $('#edit_segment_cell').css('display', 'none');
            $('#edit_gommette_cell').css('display', 'none');
            display_delete_button(false);
            break;
        case 'segment':
            $('#edit_segment_cell').css('display', 'flex');
            $('#edit_gommette_cell').css('display', 'none');
            break;
        case 'gommette':
            $('#edit_segment_cell').css('display', 'none');
            $('#edit_gommette_cell').css('display', 'flex');
            break;
    }
}

function display_main_menu(menu) {
    // Sets the bottom menu to be displayed: 'listen' for listen mode,
    // or 'edit' for edition mode.
    switch (menu) {
        case 'listen':
            $('#listen_form').css('display', 'flex');
            $('#edit_form').css('display', 'none');
            break;
        case 'edit':
            $('#listen_form').css('display', 'none');
            $('#edit_form').css('display', 'flex');
            break;
    }
}

function display_edition_options(mode) {
    // Display the buttons of the edition bottom menu as clickable or as
    // disabled.
    if(mode == 'menu') {
        $('.edition_button').removeClass('disabled');
        $('.edition_button').removeClass('selected');
    } else {
        $('.edition_button').addClass('disabled');
        $('.edition_button').removeClass('selected');
        $('#'+mode).addClass('selected');
    }
}

function initialize_menus() {
    // Sets the initial interface to listen mode, with no upper menu displayed
    display_main_menu('listen');
    display_comment_menu(null);
    display_edit_menu(null);
    $('.content').css('visibility', 'visible');
}

function display_delete_button(display) {
    // If display=true,display the delete button (right upper menu),
    // if display=false hide it.
    var visibility = display ? 'visible' : 'hidden';
    $('.button_delete').css('visibility', visibility);
}

//-------------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------------
// Behaviour of the different buttons of the app
//-------------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------------------
// Listening mode
//-------------------------------------------------------------------------------------------------------------

function zoomOut() {
    p.zoom.zoomOut();
}

function zoomIn() {    
    p.zoom.zoomIn();
}

function previous_landmark() {
    // Reach the previous loop segment beginning /end, or the previous gommette
    var landmarks = p.get_landmarks();
    var currentTime = p.player.getCurrentTime();
    var currentTimeIndex = -1;
    var landmarks_number = landmarks.length;
    if(currentTime == 0) {
        return
    } else {
        currentTime = Math.max(0, currentTime - 0.01); // without this line, the added reading head translation in next_landmark will make previous_landmark move the reading head by 0.01s only
        for(var i=0; i<landmarks_number; i++) {
            if(currentTime > landmarks[i]) {currentTimeIndex++} else {break};
        };
        var new_time = landmarks[currentTimeIndex];
        p.player.seek(new_time);
    }
}

function next_landmark() {
    // Reach the next loop segment beginning /end, or the next gommette
    var landmarks = p.get_landmarks();
    var currentTime = p.player.getCurrentTime();
    var currentTimeIndex = 0;
    var landmarks_number = landmarks.length;
    if(currentTime >= landmarks[landmarks_number - 1]) {
        return
    } else {
        for(var i=0; i<landmarks_number; i++) {
            if(currentTime >= landmarks[i]) {currentTimeIndex++} else {break};
        };
        var new_time = landmarks[currentTimeIndex];
        p.player.seek(new_time + 0.01); // this line was added to prevent bugs when loop_mode is enabled and next_landmark is called (without this listen_loop will take the reading head back to the beginning of the segment)
    }
}

function loop_mode() {
    // When the play head reaches the end of a loop segment,
    // it returns to the beginning of this segments. Implemented
    // using p.listenLoop
    listen_mode = 'loop';
    $('#loop').addClass('selected');
    $('#continuous').removeClass('selected');
}

function continuous_mode() {
    // When the play head reaches the end of a loop segment,
    // ignore it
    listen_mode ='continuous';
    $('#loop').removeClass('selected');
    $('#continuous').addClass('selected');
}

function edit_mode() {
    // Switch to the edition mode interface.
    display_main_menu('edit');
    display_edition_options('menu');
    listening_mode_playhead_position = p.player.getCurrentTime();
    app_mode = 'edit';
    edition_mode = 'menu';
}

//-------------------------------------------------------------------------------------------------------------
// Edition mode
//-------------------------------------------------------------------------------------------------------------

// Actions of the upper right menu

function delete_selected_segment() {
    // Action of the "Supprimer" button (segment edition mode).
    // Delete the selected loop segment.  
    p.remove_segment(last_segment_id);
    last_segment_id = null;
    last_color = null;
    display_delete_button(false);
    display_comment_menu(null);
}


function delete_selected_gommette() {
    // Action of the "Supprimer" button (gommette edition mode).
    // Delete the selected gommette.
    p.remove_gommette(last_gommette_id);
    last_gommette_id = null;
    last_color = null;
    display_delete_button(false);
    display_comment_menu(null);
}


function cancel_edition() {
    // Action of the "Annuler" button. Return to the bottom menu and cancel
    // every undertaken change.
    if(edition_mode.includes('gommette')) {
        p.remove_all_gommettes();
        p.add_gommettes(save_of_gommettes);
    } else if (edition_mode.includes('segment')) {
        p.remove_all_segments();
        p.add_segments(save_of_segments);
    }
    display_edit_menu(null);
    display_comment_menu(null);
    display_edition_options('menu');
    last_segment_id = null;
    last_gommette_id = null;
    edition_mode = 'menu';
}


function return_to_menu() {
    // Action of the "Terminé" button. Tries saving the undertaken changes.
    // If it is successful, hide the upper menus and make the bottom menu
    // interactive again.
    switch(edition_mode) {
        case 'menu':
            console.error('Error should not happen');
            return_successful = true;
            break;
        case 'create_segment':
            return_successful = complete_create_segment();
            break;
        case 'edit_segments':
            return_successful = complete_edit_segments();
            break;
        case 'create_gommette':
            return_successful = complete_create_gommette();
            break;
        case 'edit_gommettes':
            return_successful = complete_edit_gommettes();
            break;
    };
    if(return_successful) {
        last_segment_id = null;
        last_gommette_id = null;
        edition_mode = 'menu';
        display_comment_menu(null);
        display_edit_menu(null);
        display_edition_options('menu');
    }
}

// Actions of the upper right menu

function validate_segment_comment() {
    // When the 'OK' button is clicked, change the comment of the currently edited segment.
    var new_labelText = $('#comment_segment').val();
    p.change_segment_attribute(last_segment_id, 'labelText', new_labelText);
    $('#comment_segment').val('');
}

function validate_gommette_comment() {
    // When the 'OK' button is clicked, change the comment of the currently edited gommette.
    var new_labelText = $('#comment_gommette').val();
    p.change_gommette_attribute(last_gommette_id, 'labelText', new_labelText);
    $('#comment_gommette').val('');
}

// Functions called when the user intracts with the figure

function select_segment_for_edition(segment) {
    // In edition mode, when a loop segment is clicked on / dragged, select it so that its commentary
    // can be edited and it can be deleted. Also display it in red. If the upper left is not being
    // displayed yet , starts displaying it
    if (segment != null && segment.id != last_segment_id) {
        display_comment_menu('segment');
        $('#comment_segment').val(segment.labelText);
        display_delete_button(true);
        p.change_segment_attribute(segment.id, 'color', 'red');
        if(last_segment_id != null) {
            p.change_segment_attribute(last_segment_id, 'color', 'transparent');
        }
        last_segment_id = segment.id;
    }
}

function select_gommette_for_edition(gommette) {
    // In edition mode, when a gommette is clicked on / dragged, select it so that its commentary
    // can be edited and it can be deleted. If the upper left menu is not being displayed yet,
    // starts displaying it.
    if (gommette != null && gommette.id != last_gommette_id) {
        last_gommette_id = gommette.id;
        display_comment_menu('gommette');
        $('#comment_gommette').val(gommette.labelText);
        display_delete_button(true);
        last_segment_id = gommette.id;
    }
}

// Actions of the bottom menu

function begin_edition(mode) {
    // Function called when any of the edition / creation buttons of the edition menu is clicked. Disables
    // the bottom menu, displays the upper right menu and saves the current state of the gommettes / loop segments,
    // in case the user decides to cancel their upcoming actions.
    if(edition_mode.includes('gommette')) {
        save_of_gommettes = p.get_gommettes();
        display_edit_menu('gommette');
    } else if (edition_mode.includes('segment')) {
        save_of_segments = p.get_segments();
        display_edit_menu('segment');
    }
    display_edition_options(mode);
    edition_mode = mode;
}

function create_segment() {
    // Function called when the "Créer une boucle" button is clicked. Creates a new loop segment and makes
    // it editable. 
    if (edition_mode != 'menu') {
        return;
    } else {
        edition_mode = 'create_segment';
        begin_edition(edition_mode);
        var current_time = p.player.getCurrentTime();
        var initial_start = Math.max(current_time - 1, 1);
        var initial_end =  Math.min(initial_start + 2, audio_duration - 1);
        var segment_to_create = {'startTime':initial_start, 'endTime':initial_end, 'editable':false, 'labelText':'', 'id':'segment_in_creation'};
        p.add_segments([segment_to_create]);
        p.change_segment_attribute('segment_in_creation', 'editable', true);
        p.change_segment_attribute('segment_in_creation', 'color','red');
        display_comment_menu('segment');
        last_segment_id = 'segment_in_creation';
        $('#comment_segment').val('');

    }
}

function complete_create_segment() {
    // Function called when the "Terminé" button is clicked (segment creation mode). Definitively adds the created
    // segment to the visualization
    var segments = p.get_segments();
    if(intersection_is_empty(segments)) {
        nb_segments_created += 1;
        var new_id = 'loop_' + String(nb_segments_created);
        p.change_segment_attribute('segment_in_creation', 'editable', false);
        p.change_segment_attribute('segment_in_creation', 'color', 'transparent');
        p.change_segment_attribute('segment_in_creation', 'id', new_id);
        return true;
    } else {
        alert("Erreur: une boucle de lecture ne doit pas être vide et deux boucles ne peuvent s'intersecter.");
        return false;
    }
}

function edit_segments() {
    // Function called when the "Gérer les boucles" button is clicked. Makes every loop segment editable.
    if (edition_mode != 'menu') {
        return;
    } else {
        edition_mode = 'edit_segments';
        begin_edition('edit_segments');
        var segments = p.get_segments();
        segments.forEach((segment) => p.change_segment_attribute(segment.id, 'editable', true));
    }
}

function complete_edit_segments() {
    // Function called when the "Terminé" button is clicked (segment edition mode). Saves the undertaken changes.
    var segments = p.get_segments();
    if(intersection_is_empty(segments)) {
        if (last_segment_id != null) {p.change_segment_attribute(last_segment_id, 'color', 'transparent')};
        segments.forEach((segment) => p.change_segment_attribute(segment.id, 'editable', false));
        return true;
    } else {
        alert("Erreur: une boucle de lecture ne doit pas être vide et deux boucles ne peuvent s'intersecter.");
        return false;
    }
}

function create_gommette() {
    // Function called when the "Créer une gommette" button is clicked. Creates a new gommette and makes
    // it editable. 
    if (edition_mode != 'menu') {
        return;
    } else {
        edition_mode = 'create_gommette';
        begin_edition(edition_mode);
        var current_time = p.player.getCurrentTime();
        var gommette_to_create = {'time':current_time, 'editable':false, 'labelText':'', 'id':'gommette_in_creation'};
        p.add_gommettes([gommette_to_create]);
        p.change_gommette_attribute('gommette_in_creation', 'editable', true);
        p.change_gommette_attribute('gommette_in_creation', 'color', 'black');
        display_comment_menu('gommette');
        last_gommette_id = 'gommette_in_creation';
    }
}

function complete_create_gommette() {
    // Function called when the "Terminé" button is clicked (gommette creation mode). Definitivey add the
    // created gommette to the vizualization.
    nb_gommettes_created += 1;
    var new_id = 'User-created gommette ' + String(nb_gommettes_created);
    p.change_gommette_attribute('gommette_in_creation', 'editable', false);
    p.change_gommette_attribute('gommette_in_creation', 'color', 'red');
    p.change_gommette_attribute('gommette_in_creation', 'id', new_id);
    return true;
}

function edit_gommettes() {
    // Function called when the "Gérer les gommettes" button is clicked. Makes every gommette editable.
    if (edition_mode != 'menu') {
        return;
    } else {
        edition_mode = 'edit_gommettes';
        begin_edition('edit_gommettes');
        var gommettes = p.get_gommettes();
        gommettes.forEach((gommette) => p.change_gommette_attribute(gommette.id, 'editable', true));
    }
}

function complete_edit_gommettes() {
    // Function called when the "Terminé" button is clicked (gommette edition mode). Saves the undertaken changes.
    var gommettes = p.get_gommettes();
    gommettes.forEach((gommette) => p.change_gommette_attribute(gommette.id, 'editable', false));
    return true;
}

function save_changes() {
    // Function called when the "Sauvegarder les annotations" button is clicked (gommette edition mode).
    // The server will save the loop segments and gommettes variables in the 'event.json' file so that they can be reloaded.
    var loops = p.get_segments();
    var gommettes = p.get_gommettes();
    var data = {'loops': loops, 'gommettes': gommettes};
    socket.emit('listen_and_edit/save_annotations', data);
    alert('Sauvegarde effectuée.');
}

function listening_mode() {
    // Return to the listening mode interface
    if (edition_mode != 'menu') {
        return;
    } else {
        p.player.seek(listening_mode_playhead_position);
        $('#edit_form').hide();
        $('#listen_form').show();
        app_mode = 'listen';
    }
}