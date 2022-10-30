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

function mario_yip() {
    play_song([65, 65, 65, 61, 65, 68, 56]);
}

function girl_in_the_tower_yip() {
    play_song([59.6, 61.3, 62.5, 62.5, 61.3, 61.3, 59.6, 62.5, 61.3, 61.3, 64.2, 64.2, 62.5, 62.5, 61.3, 59.6]);
}

function play_song(pitches) {
    if (state.isSinging) {
        console.log(":(")
        return;
    }
    state.isSinging = true;
    var a = new Audio("sounds/yip.mp3");
    a.volume = 0.05;

    a.mozPreservesPitch = false;
    a.webkitPreservesPitch = false;
    a.preservesPitch = false;

    var index = 0;
    
    a.onended = function() {
        index += 1;
        a.playbackRate = Math.pow(2,(1+((pitches[index]+70)/12)));
        a.play();
        animate_yip();
        if (index >= pitches.length-1) {
            state.isSinging = false;
            a.onended = null;
        }
    }


    a.playbackRate = pitches[index];
    a.play();
    animate_yip();

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
    var audio = new Audio('sounds/yip.mp3');
    audio.volume = 0.05;
    audio.loop = false;
    audio.mozPreservesPitch = false;
    audio.webkitPreservesPitch = false;
    audio.preservesPitch = false;
    audio.playbackRate = 0.8 + Math.random()*0.8
    audio.play();

    
   animate_yip();

    if (yipCount > 0) {
        setTimeout(yip, msPerYip, yipCount-1, msPerYip);
    }
}
