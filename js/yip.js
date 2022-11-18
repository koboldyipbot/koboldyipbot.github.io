var baseYip = new Audio("sounds/yip.mp3");

function fetchUserYips(user) {
  if (!(user in state.userYips)) {
    let yips = localStorage.getItem(user);
    if (yips == null) {
        yips = 0;
    } else {
        yips = parseInt(yips);
    }
    state.userYips[user] = {
      yips: yips,
      commandCooldown: false,
      lastTimestamp: new Date()
    };    
  }

  return state.userYips[user];
}

function updateYips(user, extraYips) {
  var userYips = fetchUserYips(user);
  if (config.mods.includes(user)) {
    userYips.yips = 99999999999999;
  } else {
    var newTimestamp = new Date();
    var seconds = Math.floor(getSecondsDiff(newTimestamp, userYips.lastTimestamp) / config.secondsPerYip);
    if (seconds > 0) {
      userYips.lastTimestamp = new Date();
      userYips.yips = Math.min(100, userYips.yips + seconds + (extraYips || 0));
      localStorage.setItem(user, userYips.yips);
    } else {
        userYips.yips = Math.min(100, userYips.yips + (extraYips || 0));
    }
    console.log("h" + userYips.yips);
  }
}

function reset_yip() {
    $("#yip").attr("src", config.image1);
    state.isYipping = false;
}

function marioYip() {
    playSong([
        65, 65, 65, 61, 65, 68, 56
    ]);
}

function girlInTheTowerYip() {
    playSong([
        59.6,
        61.3,
        62.5, 
        [62.5, 600], 
        [61.3, 300], 
        61.3, 
        59.6, 
        [62.5, 600], 
        [61.3, 300], 
        61.3,
        64.2, 
        [64.2, 600], 
        [62.5, 300], 
        62.5,
        61.3, 
        59.6
    ]);
}

function chargeYip() {
    playSong([
        [55, 200],
        [60, 200],
        [64, 200],
        [67, 400],
        [64, 150],
        67
    ]);
}

function sansYip() {
    playSong([
        [62, 200],
        [62, 200],
        [74, 400],
        69
    ]);
}

function yaketyYip() {
  playSong([
    [62,100],[63,100],[64,100],
    [67,200],[67,200],[64,100],[62,100],[58,100],[59,100],[62,100],[59,100],[64,200],[62,100],[59,100],[57,100],[59,100],
    [55,200],[57,100],[58,100],[59,100],[62,100],[64,100],[62,100],[67,500],[62,100],[64,100],[62,100],
    [67,200],[67,200],[64,100],[62,100],[58,100],[59,100],[62,100],[59,100],[64,200],[62,100],[59,100],[57,100],[59,100],
    [62,200],[62,100],[62,100],[66,100],[69,100],[66,200],[62,500],[62,100],[64,100],[62,100],
    [67,200],[67,100],[67,100],[67,200],[67,100],[67,100],[67,200],[67,200],[64,100],[62,300],
    [60,200],[60,200],[60,200],[60,200],[64,100],[67,100],[69,100],[67,100],[70,100],[69,200],[70,100],
    [71,100],[70,100],[71,100],[70,100],[71,100],[74,200],[69,100],[71,100],[74,100],[71,200],[67,200],[67,200],[62,200],
    [76,100],[70,200],[62,100],[69,300],[67,300]
  ]);
}

function yipShanty2Yip() {
  playSong([
    [69, 300], [64, 150], [62, 150], [61, 450], [61, 150], [62, 150], [64, 150], [66, 150], [68, 150], [64, 600], 
    [66, 300], [64, 150], [62, 150], [61, 300], [61, 300], [59, 300], [61, 300], [62, 600], 
    [69, 300], [64, 150], [62, 150], [61, 600], [61, 150], [62, 150], [64, 150], [66, 150], [62, 600], 
    [66, 150], [64, 150], [62, 150], [61, 150], [59, 150], [61, 150], [62, 150], [66, 150], [64, 150], [62, 150], [61, 150], [59, 150], [57, 600], 
    [61, 150], [59, 150], [61, 300], [61, 300], [61, 150], [59, 150], [61, 300], [59, 300], [61, 600], 
    [57, 150], [59, 150], [61, 150], [62, 150], [61, 300], [59, 300], [61, 1200], 
    [61, 150], [59, 150], [61, 300], [61, 300], [62, 150], [61, 150], [59, 300], [64, 300], [61, 600], 
    [61, 150], [59, 150], [61, 150], [62, 150], [61, 300], [57, 300], [61, 1200], 
    [64, 150], [62, 150], [64, 300], [64, 300], [64, 150], [62, 150], [64, 300], [66, 300], [64, 600], 
    [68, 300], [68, 150], [66, 150], [64, 300], [62, 300], [64, 1200], 
    [61, 150], [59, 150], [61, 300], [61, 300], [59, 150], [61, 150], [62, 300], [59, 300], [61, 600], 
    [61, 150], [59, 150], [61, 0], [64, 100], [62, 100], [61, 100], [59, 0], [61, 300], [57, 0], [61, 300], [57, 0], [45, 1200], 
  ]);
}

function sandstormYip() {
    playSong([
        [59, 100], [59, 100], [59, 100], [59, 100], [59, 2400], 
        [64, 400], [59, 100], [59, 100], [59, 100], [59, 100], [59, 2400], 
        [59, 100], [59, 100], [59, 100], [59, 100], [59, 400], 
        [59, 100], [59, 100], [59, 100], [59, 100], [59, 400], 
        [59, 100], [59, 100], [59, 100], [59, 100], [59, 400], 
        [59, 100], [59, 100], [59, 100], [59, 100], [59, 400]
    ]);
}

/*
recommended max note range - x gets a little awkward

x  x                                            x
52 53 55 57 59 60 62 64 65 67 69 71 72 74 76 77 79
e  f  g  a  b  c  d  e  f  g  a  b  c  d  e  f  g
        
*/

function blindedYip() {
    // 150 bpm, 1600 ms per bar
    playSong([
        [62, 800], [62, 600], [60, 200], 
        [62, 200], [64, 400], [57, 400], [60, 600],
        [62, 800], [62, 600], [60, 200], 
        [62, 200], [64, 400], [57, 400], [60, 600],
        [67, 200], [64, 400], [62, 400], [60, 600], 
        [67, 200], [64, 400], [62, 400], [60, 600], 
        [62, 0], [52, 0], [59, 200], [62, 0], [59, 200], [62, 0], [59, 200], [62, 0], [59, 200], [52, 0], [62, 0], [59, 200], [62, 0], [59, 200], [62, 0], [59, 200], [62, 0], [59, 200], 
        // [62, 0], [52, 0], [59, 200], [62, 0], [59, 200], [62, 0], [59, 200], [62, 0], [59, 200],
    ]);
}

function angelYip() {
    

    /* 80 bpm, 3000 ms per bar */
    var whole = 3000;
    var half = whole/2;
    var quarter = half/2;
    var eighth = quarter/2;
    var sixteenth = eighth/2;

    var line1 = [
        [51, 0], [55, 0], [60, quarter], [63, quarter], [60, 0],  [56, 0], [65, eighth+sixteenth], [63, eighth+sixteenth], [65, eighth], 
        [62, 0], [58, 0], [65, eighth], [65, eighth], [70, eighth], [68, eighth], [67, 0], [55, 0], [63, sixteenth], [65, eighth], [63, 0], [67, quarter+sixteenth],
        [63, 0], [60, 0], [67, quarter], [70, quarter], [65, 0], [68, 0], [72, eighth+sixteenth], [65, eighth+sixteenth], [63, eighth],
        [62, 0], [70, eighth], [62, 0], [70, eighth], [62, 0], [67, eighth], [62, 0], [70, eighth], [62, 0], [70, eighth+sixteenth], [63, 0], [72, eighth+sixteenth+1850], 
    ];

    /* 130 bpm, 1846.153846153846 ms per bar, let's do 1850 */
    var whole = 2000;
    var half = whole/2;
    var quarter = half/2;
    var eighth = quarter/2;
    var sixteenth = eighth/2;
    

    var line2 = [
        [51, 0], [55, 0], [60, quarter], [63, quarter], [60, 0], [56, 0], [65, eighth+sixteenth], [63, eighth+sixteenth], [65, eighth], 
        [62, 0], [58, 0], [65, eighth], [65, eighth], [70, eighth], [68, eighth], [67, 0], [55, 0], [63, sixteenth], [65, eighth], [63, 0], [67, quarter+sixteenth],
        [63, 0], [60, 0], [67, quarter], [70, quarter], [65, 0], [68, 0], [72, eighth+sixteenth], [65, eighth+sixteenth], [63, eighth],
        [58, 0], [70, eighth], [58, 0], [70, eighth], [55, 0], [67, eighth], [58, 0], [70, eighth], [58, 0], [70, eighth+sixteenth], [60, 0], [72, quarter+sixteenth+quarter], 
    ];

    /*
                                                                        x  x                                            x
                                                                        51 53 55 56 58 60 62 63 65 67 68 70 72 74 75 77 79
                                                                        eb f  g  ab bb c  d  eb f  g  ab bb c  d  eb f  g
    */

    var line3 = [
        [63, eighth], [58, sixteenth], [58, quarter+eighth+sixteenth], [63, eighth], 
        [58, 0], [63, eighth+sixteenth], [65, eighth+sixteenth], [58, eighth], [58, quarter+eighth], [63, sixteenth], [65, sixteenth], 
        [60, 0], [63, 0], [67, eighth+sixteenth], [60, 0], [63, 0], [68, eighth+sixteenth], [60, 0], [67, eighth], [58, 0], [62, 0], [65, eighth+sixteenth], [63, eighth+sixteenth], [65, eighth+sixteenth], 
    ];

    playSong(line3);

    playSong(first.concat(second));
}

function detokenizeYipSong(song) {
    // return null if invalid song
    var splitted = song.replaceAll('[', '[ ').replaceAll(']', ' ]').replaceAll(",", "").split(/\s+/);
    var song = [];
    var index = 0;
    while (index < splitted.length) {
        if (splitted[index] === "[") {
            // pitch and length
            var pitch = Number(splitted[index+1]);
            var length = Number(splitted[index+2]);
            if (!pitch || !length) {
                return null;
            }
            song.push([pitch, length]);
            if (splitted[index+3] != "]") {
                return null;
            }
            index += 4;
        } else {
            // just pitch
            var pitch = Number(splitted[index]);
            if (!pitch) {
                return null;
            }
            song.push(pitch);
            index += 1;
        }
    }
    return song;
}

function playSong(song, forceSong, index) {
    if (forceSong === undefined && state.isSinging) {
        console.log(":(")
        // var val = $("#debugdiv").val();
        // $("#debugdiv").html(())
        return;
    }
    if (index === undefined) {
        index = 0;
    }
    state.isSinging = true;
    var yips = [];
    for (var yipIndex in song) {
        // if (yipIndex > 2) { break; }
      var a = baseYip.cloneNode(true);
      a.mozPreservesPitch = false;
      a.webkitPreservesPitch = false;
      a.preservesPitch = false;

      a.volume = 0.05;

      var midiPitch;
      var lengthInMillis;
      if (Array.isArray(song[yipIndex])) {
          midiPitch = song[yipIndex][0];
          lengthInMillis = song[yipIndex][1];
      } else {
          midiPitch = song[yipIndex];
          lengthInMillis = config.defaultYipSongNoteLength;
      }

      a.playbackRate = Math.pow(2, (1+((midiPitch-70)/12)));
      yips.push([a, lengthInMillis]);
    }
    
    setTimeout(playSongInner, Math.min(Math.max(yips[0][1], 100), 100), yips, 0);
}

var stopSong = false;

function playSongInner(song, index) {  
  var a = song[index][0];
  var lengthInMillis = song[index][1];
  while(lengthInMillis == 0 && index < song.length-2) {
    a.play();
    index += 1;
    a = song[index][0];
    lengthInMillis = song[index][1];
  }
  
  animate_yip();
  a.play();
  
  if (index < song.length-1 && !stopSong) {
    setTimeout(playSongInner, lengthInMillis, song, index+1); 
  } else {
    state.isSinging = false;
  }
}

function cheer_yip(channel, context, msg, self) {
    yip(client, target, yipCount, msPerYip);
}

function animate_yip() {
    var size = Math.floor(Math.random() * 18) + 6;
    var span = $('<span class="yip">yip</span>');
    span.css({
        "font-size": size + "px",
        left: config.yipOffsetLeft,
        top: config.yipOffsetTop
    });
    $("#yip_box").append(span);
    last_anim = span;

    var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    var height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

    var target_x = Math.floor(width * (Math.random() * 2.4 - 1.6));
    var target_y = Math.floor(-height);

    var dir = Math.random() > 0.5 ? -1 : 1;

    var iters = 10;
    var wiggle_multiplier = 0.1;
    var animation_time = 400;

    for (var i = 1 ; i <= iters; i++) {
        var next_x_line = i * target_x / iters;
        var next_x_wiggle = wiggle_multiplier * width * dir;
        var next_y_line = i * target_y / iters + config.yipOffsetTop;

        var doneFunc = function(){};
        if (i === iters) {
            doneFunc = function () {
                span.remove();
            };
        }
        last_anim = last_anim.animate(
            {
                left: Math.floor(config.yipOffsetLeft + next_x_line + next_x_wiggle),
                top: Math.floor(config.yipOffsetTop + next_y_line)
            },
            {
                duration: animation_time,
                specialEasing: {
                    left: "swing",
                    top: "linear"
                },
                done: doneFunc
            }
        );
        dir = dir * -1;
    }
    var nextDate = new Date();
    if (!state.isYipping && getMillisecondsDiff(state.lastYipDate, nextDate) > config.minimumYipGapMilliseconds * 2) {
        state.isYipping = true;
        state.lastYipDate = nextDate;

        $("#yip").attr("src", config.image2);
        setTimeout(reset_yip, config.minimumYipGapMilliseconds);
    }
}

function yip(yipCount, msPerYip) {
    var audio = baseYip.cloneNode(true);
    audio.volume = 0.05;
    audio.loop = false;
    audio.mozPreservesPitch = false;
    audio.webkitPreservesPitch = false;
    audio.preservesPitch = false;
    audio.playbackRate = 0.8 + Math.random()*0.8
    audio.play();
    animate_yip();

    if (yipCount-1 > 0) {
        setTimeout(yip, msPerYip, yipCount-1, msPerYip);
    }
}
