function fetchUserYips(user) {
  if (!(user in state.userYips)) {
    state.userYips[user] = {
      yips: 0,
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
    userYips.yips = userYips.yips + (extraYips || 0);

    var newTimestamp = new Date();
    var seconds = Math.floor(getSecondsDiff(newTimestamp, userYips.lastTimestamp) / config.secondsPerYip);
    if (seconds > 0) {
      userYips.lastTimestamp = new Date();
      userYips.yips += seconds;
    }
  }
}

function reset_yip() {
    $("#yip").attr("src", config.image1);
    state.isYipping = false;
}

function yip(client, target, yipCount, msPerYip) {
    var audio = new Audio('sounds/yip.mp3');
    audio.loop = false;
    audio.play();
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

    if (yipCount > 0) {
        setTimeout(yip, msPerYip, client, target, yipCount-1, msPerYip);
    }
}