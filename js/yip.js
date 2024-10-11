var baseYip = new Audio("sounds/yip.mp3");
var c4Yip = new Audio("sounds/yipc4.mp3");
var c3Yip = new Audio("sounds/yip2.mp3");

var forceC3Yip = false;


function createYipSpan() {
  var yipSpan = $('<span class="yip">yip</span>');
  var size = Math.floor(Math.random() * 18) + 6;
  yipSpan.css({
    "font-size": size + "px",
    left: config.yipOffsetLeft,
    top: config.yipOffsetTop
  });
  return yipSpan;
}

function resetYipSpan(yipSpan) {
  var size = Math.floor(Math.random() * 18) + 6;
  yipSpan.css({
    "font-size": size + "px",
    left: config.yipOffsetLeft,
    top: config.yipOffsetTop
  });
  return yipSpan;
}

function createYipAudio(yipBaseReference) {
    var a = yipBaseReference.cloneNode(true);
    a.load();
    a.volume = .1;
    // a.playbackRate = Math.pow(2, (1+((midiPitch-70)/12))); -- up to invoker
    a.mozPreservesPitch = false;
    a.webkitPreservesPitch = false;
    a.preservesPitch = false;
    return a;
}

function createBaseYipAudio() {
    return createYipAudio(baseYip);
}

function createC4YipAudio() {
    return createYipAudio(c4Yip);
}

function createC3YipAudio() {
    return createYipAudio(c3Yip);
}

function resetYipAudio(yipAudio) {
    yipAudio.currentTime = 0;
}


function createYipImg() {
    return createYipAudio(baseYip);
}

var yipSpanPool = new ObjectPool(createYipSpan, resetYipSpan);
var yipBaseAudioPool = new ObjectPool(createBaseYipAudio, resetYipAudio);
var yipC4AudioPool = new ObjectPool(createC4YipAudio, resetYipAudio);
var yipC3AudioPool = new ObjectPool(createC3YipAudio, resetYipAudio);
// var yipImgPool = new ObjectPool(createYipImg, resetYipImage);

function fetchUserYips(user) {
  if (!(user in state.userYips)) {
    let userData = localStorage.getItem(user);
    let yips = 0;
    let bonusYips = 0;
    if (userData != null) {
      try {
        userData = JSON.parse(userData);
        yips = userData.yips || 100;
        bonusYips = userData.bonusYips || 0;
      } catch (e) {
        // ignore
      }
    }
    state.userYips[user] = {
      yips: yips,
      bonusYips: bonusYips,
      commandCooldown: false,
      lastTimestamp: new Date()
    };    
  }

  return state.userYips[user];
}

function updateYips(user, yipChange) {
  var userYips = fetchUserYips(user);
  yipChange = yipChange || 0;
  if (config.mods.includes(user)) {
    userYips.yips = 99999999999999;
  } else {
    let newTimestamp = new Date();
    let newYips = Math.floor(getSecondsDiff(newTimestamp, userYips.lastTimestamp) / config.secondsPerYip);
    userYips.lastTimestamp = newTimestamp;
    if (yipChange < 0) {
      userYips.yips = userYips.yips + newYips + yipChange;
      if (userYips.yips < 0) {
        userYips.bonusYips = userYips.bonusYips + userYips.yips;
        userYips.yips = 0;
      }
    } else {
      userYips.yips = Math.min(100, userYips.yips + newYips);
      if (!Number.isInteger(userYips.bonusYips)) {
        userYips.bonusYips = 0;
      }
      userYips.bonusYips += yipChange;
    }
    let newUserData = {"yips": userYips.yips, "bonusYips": userYips.bonusYips};
    localStorage.setItem(user, JSON.stringify(newUserData));
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
  var w = 1600;
  var h = w/2;
  var q = h/2;
  var e = q/2;
  var s = e/2;
  playSong([
    [59, s], [59, s], [59, s], [59, s], [59, w+h], 
    [64, q], [59, s], [59, s], [59, s], [59, s], [59, w+h], 
    [59, s], [59, s], [59, s], [59, s], [59, q], [59, s], [59, s], [59, s], [59, s], [59, q], 
    [59, s], [59, s], [59, s], [59, s], [59, q], [59, s], [59, s], [59, s], [59, s], [59, q], 
    [59, s], [59, s], [59, s], [59, s], [59, s], [59, s], [59, s], [59, s], [59, s], [59, s], [59, s], [59, s], [59, s], [59, s], [59, s], [59, s], 
    [59, s], [59, s], [59, s], [59, s], [59, s], [59, s], [59, s], [59, s], [59, s], [59, s], [59, s], [59, s], [64, s/2], [63, s/2], [62.5, s/2], [62, s/2], [61, s/2], [60.5, s/2], [60, s/2], [59.5, s/2], 
    [59, s], [59, s], [59, s], [59, s], [59, e], [59, s], [59, s], [59, s], [59, s], [59, s], [59, s], [59, e], [64, s], [64, s], 
    [64, s], [64, s], [64, s], [64, s], [64, e], [62, s], [62, s], [62, s], [62, s], [62, s], [62, s], [62, e], [57, s], [57, s],
    [59, s], [59, s], [59, s], [59, s], [59, e], [59, s], [59, s], [59, s], [59, s], [59, s], [59, s], [59, e], [64, s], [64, s], 
    [59, s], [59, s], [59, s], [59, s], [59, e], [59, s], [59, s], [59, s], [59, s], [59, s], [59, s], [59, e], [64, s], [64, s], 
    [59, s], [59, s], [59, s], [59, s], [59, e], [59, s], [59, s], [59, s], [59, s], [59, s], [59, s], [59, e], [64, s], [64, s], 
    [64, s], [64, s], [64, s], [64, s], [64, e], [62, s], [62, s], [62, s], [62, s], [62, s], [62, s], [62, e], [57, s], [57, s], 
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
    // https://musescore.com/asiatomax/a-cruel-angel-s-thesis-difficulty-3-5

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

  var line3 = [
    [63, eighth], [58, sixteenth], [58, quarter+eighth+sixteenth], [63, eighth], 
    [58, 0], [63, eighth+sixteenth], [65, eighth+sixteenth], [58, eighth], [58, quarter+eighth], [63, sixteenth], [65, sixteenth], 
    [60, 0], [63, 0], [67, eighth+sixteenth], [60, 0], [63, 0], [68, eighth+sixteenth], [60, 0], [67, eighth], [58, 0], [62, 0], [65, eighth+sixteenth], [58, 0], [60, 0], [63, eighth+sixteenth], [58, 0], [62, 0], [65, eighth+sixteenth], 
    [60, 0], [63, 0], [67, eighth+sixteenth], [60, 0], [63, 0], [68, eighth+sixteenth], [60, 0], [63, 0], [67, eighth+sixteenth], [60, quarter+eighth], [60, sixteenth], [62, sixteenth],
    [58, 0], [53, 0], [63, eighth+sixteenth], [58, 0], [53, 0], [63, eighth+sixteenth], [58, 0], [53, 0], [62, eighth], [58, 0], [53, 0], [62, quarter+eighth], [63, sixteenth], [65, sixteenth],
    ];


  var line4 = [
    [63, 0], [58, 0], [68, eighth+sixteenth], [63, 0], [58, 0], [67, eighth+sixteenth], [62, 0], [58, 0], [65, eighth], [63, quarter+eighth], [67, eighth],
    [62, 0], [57, 0], [67, eighth+sixteenth], [62, 0], [57, 0], [65, eighth+sixteenth], [57, 0], [64, eighth], [62, 0], [57, 0], [65, quarter], [60, quarter],
    [57, 0], [53, 0], [60, quarter+eighth], [59, 0], [55, 0], [62, eighth], [59, 0], [55, 0], [62, half+quarter], [63, eighth], [58, sixteenth], [58, quarter+eighth+sixteenth], [63, eighth],
    [58, 0], [63, eighth+sixteenth], [65, eighth+sixteenth], [58, eighth], [58, quarter+eighth], [63, sixteenth], [65, sixteenth],
    ];

  var line5 = [
    [60, 0], [63, 0], [67, eighth+sixteenth], [60, 0], [63, 0], [68, eighth+sixteenth], [60, 0], [67, eighth], [58, 0], [62, 0], [65, eighth+sixteenth], [58, 0], [60, 0], [63, eighth+sixteenth], [58, 0], [62, 0], [65, eighth], 
    [60, 0], [63, 0], [67, eighth+sixteenth], [60, 0], [63, 0], [68, eighth+sixteenth], [60, 0], [63, 0], [67, eighth], [60, quarter+eighth], [60, sixteenth], [62, sixteenth], 
    [53, 0], [58, 0], [63, eighth+sixteenth], [53, 0], [58, 0], [63, eighth+sixteenth], [53, 0], [58, 0], [62, eighth], [53, 0], [58, 0], [62, quarter+eighth], [63, sixteenth], [65, sixteenth],
    [58, 0], [63, 0], [68, eighth+sixteenth], [58, 0], [63, 0], [67, eighth+sixteenth], [58, 0], [62, 0], [62, eighth], [63, quarter+eighth], [67, eighth],
    [57, 0], [62, 0], [67, eighth+sixteenth], [57, 0], [62, 0], [65, eighth+sixteenth], [57, 0], [64, eighth], [57, 0], [62, 0], [65, eighth+sixteenth], [67, eighth+sixteenth], [68, eighth]
    ];

    // page 2 bar 25

  var line6 = [
    [55, 0], [59, 0], [62, 0], [67, quarter], [50, 0], [55, 0], [59, quarter], [50, 0], [55, 0], [60, quarter], [50, 0], [55, 0], [62, quarter],
    [56, 0], [60, 0], [63, eighth+sixteenth], [56, 0], [60, 0], [63, eighth+sixteenth], [56, 0], [58, 0], [62, eighth], [56, 0], [60, 0], [63, eighth+sixteenth], [56, 0], [60, 0], [63, eighth+sixteenth], [56, 0], [58, 0], [62, eighth], 
    [58, 0], [62, 0], [65, eighth+sixteenth], [58, 0], [62, 0], [65, eighth+sixteenth], [58, 0], [60, 0], [63, eighth], [55, 0], [62, eighth+sixteenth], [60, eighth+sixteenth], [62, eighth],
    [56, 0], [60, 0], [63, eighth+sixteenth], [56, 0], [60, 0], [63, eighth+sixteenth], [56, 0], [58, 0], [62, eighth], [58, 0], [62, 0], [65, eighth+sixteenth], [62, eighth+sixteenth], [60, eighth],
    ];

  var line7 = [
    [49, 0], [53, 0], [58, quarter], [55, quarter], [56, quarter], [58, quarter],
    [56, 0], [60, 0], [63, eighth+sixteenth], [56, 0], [60, 0], [63, eighth+sixteenth], [56, 0], [58, 0], [62, eighth], [56, 0], [60, 0], [63, eighth+sixteenth], [56, 0], [60, 0], [63, eighth+sixteenth], [56, 0], [58, 0], [62, eighth], 
    [58, 0], [62, 0], [65, eighth+sixteenth], [58, 0], [62, 0], [65, eighth+sixteenth], [58, 0], [60, 0], [63, eighth], [55, 0], [62, eighth+sixteenth], [63, eighth+sixteenth], [65, eighth],
    [62, 0], [67, eighth+sixteenth], [62, 0], [65, eighth+sixteenth], [62, 0], [64, eighth], [62, 0], [65, eighth+sixteenth], [62, 0], [67, eighth+sixteenth], [68, eighth]
    ];


  var line8 = [
    [59, 0], [62, 0], [63, half], [58, 0], [63, eighth+sixteenth], [60, 0], [63, eighth+sixteenth], [62, 0], [63, eighth], 
    [51, 0], [55, 0], [60, quarter], [63, quarter], [56, 0], [60, 0], [65, eighth+sixteenth], [63, eighth+sixteenth], [65, eighth], 
    [58, 0], [62, 0], [65, eighth], [65, eighth], [70, eighth], [68, eighth], [58, 0], [63, 0], [67, sixteenth], [65, eighth], [58, 0], [63, 0], [67, quarter+sixteenth],
    [60, 0], [63, 0], [67, quarter], [70, quarter], [65, 0], [68, 0], [72, eighth+sixteenth], [65, eighth+sixteenth], [63, eighth],
    ]

    /*
                                                                        x  x                                            x
                                                                        51 53 55 56 58 60 62 63 65 67 68 70 72 74 75 77 79
                                                                        eb f  g  ab bb c  d  eb f  g  ab bb c  d  eb f  g
    */

    /*

        -  72
           70
        -  68
           67
        -- 65
           63
        -- 62
           60
        -- 58
           56
        -- 55
           53
        -- 51
           50
        -  48
    */

  var line9 = [
    [62, 0], [65, 0], [70, eighth], [62, 0], [65, 0], [70, eighth], [62, 0], [67, eighth], [62, 0], [65, 0], [70, eighth], [62, 0], [70, eighth+sixteenth], [63, 0], [72, quarter+sixteenth],
        [51, 0], [55, 0], [60, eighth+sixteenth], [63, eighth+sixteenth], [65, eighth+sixteenth], [63, eighth+sixteenth], [65, sixteenth], [63, eighth], [65, eighth+sixteenth],  // eats 1/8 of next bar
        [65, eighth], [70, eighth], [68, eighth], [58, 0], [63, 0], [67, sixteenth], [65, eighth], [58, 0], [63, 0], [67, eighth+sixteenth], [65, eighth],
        [60, 0], [63, 0], [67, eighth+sixteenth], [70, eighth+sixteenth], [72, eighth+sixteenth], [67, eighth+sixteenth], [65, eighth], [63, eighth]
        ];

  var line10 = [
    [58, 0], [67, eighth+sixteenth], [58, 0], [67, eighth+sixteenth], [55, 0], [67, eighth+sixteenth], [58, 0], [67, eighth+sixteenth], [58, 0], [67, quarter], [60, 0], [72, quarter+eighth]
    ];

  let finalSong = line1.concat(line2).concat(line3).concat(line4).concat(line5).concat(line6).concat(line7).concat(line8).concat(line9).concat(line10);

  var originalImage1 = config.image1;
  var originalImage2 = config.image2;

  config.image1 = "images/yip_plug1.png";
  config.image2 = "images/yip_plug2.png";

  function finishFunc() {
    config.image1 = originalImage1;
    config.image2 = originalImage2;
  }

  playSong(finalSong, false, finishFunc);

}

function koboldTownYip() {
    // https://jummbus.bitbucket.io/#j5N0dKobold%20Townn520s6k0l00e03t1Ua7g03j0ar1O_U00000000000000i0o43534T5v0sud3f173q050Oa0d230HVxh90000000000h0E0T5v0hu42f0000qwB16110Oa0d030H_RBHBziiii9998h0E1b7T0v0gu86f0000q0B1900Oa0d350w6h3E1b9T5v0aua1f062ge2ec2f02j01960me00q8740Oa7ld380HT-Iqijriiiih99h0E0T5v0jud2f163q8720Oa70d230HU0000000000000h0E0T4v0guf0f1a0q050Oa0z6666ji8k8k3jSBKSJJAArriiiiii07JCABrzrrrrrrr00YrkqHrsrrrrjr005zrAqzrjzrrqr1jRjrqGGrrzsrsA099ijrABJJJIAzrrtirqrqjqixzsrAjrqjiqaqqysttAJqjikikrizrHtBJJAzArzrIsRCITKSS099ijrAJS____Qg99habbCAYrDzh00E0T4v0eu04f010w400qw02c0z777777777777S-JIAArrrrrqiiii-JIAArrrrrqiiii-JIAArrrrrqiiii-JIAArrrrrqiiii-JIAArrrrrqiiii-JIAArrrrrqiiii-JIAArrrrrqiiii-JIAArrrrrqiiii-JIAArrrrrqiiii-JIAArrrrrqiiii-JIAArrrrrqiiii-JIAArrrrrqiiiiE0b4zgi4N8j4xci4N4i000p2cTFAu09B-5Od38U30RGl79AukQ61V6xAIzlGlqei8Y1Q6iOtfaV39p6NAifbq38VixwmhEQqZtcRZaCbKxp4myb02QiCAbh5F2M8I2kQhq8I2b02U4kQhqgJcmybhaq0JgmGbh5EBdomKbExqgJ4mAbh5F2QhqgJ4mAbj5F2QxqgJgmybx1jmaqhj9yRNkPFZsmmnUpD39B-zhOkpp2zAoOj8Za1V4zp6MFp2cIziOcpraBOAiJIqSjBf8QYzeuOHtOInat2ziFSCbEriCaqsFPd6yyDcFE3xraqp7b9jkBmFj13FcFjEFWSaqGtRzhHORkFINFgQqespd7t-zQkQVjCqd2sVBd2at35w4vb6XIoNskQVjCqd2sVBd2ea6boNz1yQVPCkyOO_3cUpcLQqeizb8ksz6ip7Fgf8Ar8S5b8hBAqmhzbpkKkylJzmOsFV6DApPSlo0FAua17cV71At8zF4t8zF4ta1N48VA8Wp7i8Wh7i8Wh7iFqwzwOe38Wh7i8Wh7i8Wk3opHXfQOFQ8QFRzeDS_dvrYMxxGTCzGVjGVEWKsvElBdjfhZ1Ebjdv63FdCkAGcZeqj9jLpwFB--fb-WjOdcn9yMoI31POeCb0yRaAYzG2QxqliCfJG52xgEiB2xgEka52xgEk9qxgEka02ChyWx8kq52LhEkal6xgFkt1gFkq52BhEka52waCa4q0KgQhBM1BQjbEQqd40FAo0kGd8WuziEQFvhFkqhvhFkqhHWaBhF5Z6BgEBZ2zhFq8zEkGd8LEQGd8LEQJ5iEQGdaziEQGdaxhEkt0hQ2eyhQ2eAhQ3wM0

    /* 200 bpm, 1200 ms per bar */
  var w = 1200;
  var h = w/2;
  var q = h/2;
  var e = q/2;
  var s = e/2;

  var line1 = [
        [61, e], [68, q], [61, e], [61, e], [68, q], [70, e], [73, e], [72, e], [70, e], [72, e], [68, q], [61, e]
    ];
  var line2 = [
        [61, e], [65, q], [61, e], [61, e], [68, q], [61, e], [73, e], [72, e], [70, e], [72, e], [73, q], [75, e]
    ];
  var line3 = [
        [75, e], [72, q], [70, e], [73, e], [68, q], [68, e], [70, q], [68, e], [67, e], [68, q+e], [61, e]
    ];
  var line4 = [
        [61, e], [68, q], [73, e], [73, e], [77, q], [73, e], [77, e], [73, e], [75, e], [72, e], [73, 2*q]
    ];
    /*
                                  x  x  x                                            
                                  48 49 51 53 55 56 58 60 61 63 65 67 68 70 72 73 75 77
                                  c  db eb f  g  ab bb c  db eb f  g  ab bb c  db eb f
    */

    /*

        -  72
           70
        -  68
           67
        -- 65
           63
        -- 62
           60
        -- 58
           56
        -- 55
           53
        -- 51
           50
        -  48
    */

  playSong(line1.concat(line2).concat(line3).concat(line4));

}

function songOfStormsYip() {
    // https://musescore.com/user/8577956/scores/6110030

    /* 105 bpm, 2285 ms per bar */
  var w = 1600;
  var h = w/2;
  var q = h/2;
  var e = q/2;
  var s = e/2;

  var preamble = [
    [50, q], [57, 0], [53, q], [57, 0], [53, q], 
    [52, q], [59, 0], [55, h], 
    [53, q], [60, 0], [57, q], [60, 0], [57, q], 
    [52, q], [59, 0], [55, h], 
  ];

  var line1 = [
        [50, 0], [62, e], [65, e], [74, 0], [57, 0], [53, q], [57, 0], [53, q], 
        [52, 0], [62, e], [65, e], [74, 0], [59, 0], [55, h], 
        [76, 0], [53, q], [60, 0], [57, e], [77, e], [60, 0], [76, 0], [57, e], [77, e],
        [76, 0], [52, e], [72, e], [69, 0], [59, 0], [55, h], 
        [69, 0], [46, q], [53, 0], [50, e], [62, e], [65, 0], [53, 0], [50, e], [67, 0],
        [69, 0], [41, q], [48, 0], [45, q], [48, 0], [45, q],
        [69, 0], [34, q], [62, 0], [41, 0], [38, q], [65, 0], [41, 0], [38, e], [67, e],
        [64, 0], [60, 0], [33, q], [40, 0], [36, q], [33, q]
    ];
  var line2 = [
    [50, 0], [38, e], [53, e], [62, 0], [65, 0], [62, q], [65, 0], [62, q],
    [50, 0], [40, e], [53, e], [62, 0], [47, 0], [43, h],
    [64, 0], [60, 0], [41, q], [48, 0], [45, e], [65, e], [64, 0], [48, 0], [45, e], [65, e],
    [64, 0], [40, e], [60, e], [57, 0], [47, 0], [43, h],
    [57, 0], [34, q], [50, 0], [41, 0], [38, q], [53, e], [55, e], 
    [57, 0], [40, 0], [36, 0], [33, h], [57, q], 
    [50, 0], [38, q], [45, 0], [41, q], [45, 0], [41, q], 
    [40, q], [47, 0], [43, h], 
    [41, q], [48, 0], [45, q], [48, 0], [45, q], 
    [40, q], [47, 0], [43, h]
  ];
  // var line3 = [
  //       [75, e], [72, q], [70, e], [73, e], [68, q], [68, e], [70, q], [68, e], [67, e], [68, q+e], [61, e]
  //   ];
  // var line4 = [
  //       [61, e], [68, q], [73, e], [73, e], [77, q], [73, e], [77, e], [73, e], [75, e], [72, e], [73, 2*q]
  //   ];
    /*
                                  x  x  x                                            
                                  48 50 52 53 55 57 58 60 62 64 65 67 69 70 72 74 76 77
                                  c  d  e  f  g  a  bb c  d  e  f  g  a  bb c  d  e  f
    */

    /*

           77
        -  76 / 
           74
        -  72
           70
        -  69 / 48
           67 / 46
        -- 65 / 45
           64 / 43
        -- 62 / 41
           60 / 40
        -- 58 / 38
           57 / 36
        -- 55 / 34
           53 / 33
        -- 52 / 31
           50
        -  48
           46
        -  45
           43
        -  41

    */

  playSong(preamble.concat(line1).concat(line2)); // .concat(line2).concat(line3).concat(line4));

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

function setupBaseYipAudio(midiPitch) {
  var a = baseYip.cloneNode(true);
  a.load();
  a.volume = .1;
  a.playbackRate = Math.pow(2, (1+((midiPitch-70)/12)));
  a.mozPreservesPitch = false;
  a.webkitPreservesPitch = false;
  a.preservesPitch = false;
  return a;
}

function setupC4YipAudio(midiPitch) {
  var a = c4Yip.cloneNode(true);
  a.load();
  a.volume = .1;
  a.playbackRate = Math.pow(2, (1+((midiPitch-71+11.5)/12)));
  a.mozPreservesPitch = false;
  a.webkitPreservesPitch = false;
  a.preservesPitch = false;
  return a;
}

function setupC3YipAudio(midiPitch) {
  var a = c3Yip.cloneNode(true);
  a.load();
  a.volume = .6;
  a.playbackRate = Math.pow(2, (1+((midiPitch-71+12*2)/12)));
  a.mozPreservesPitch = false;
  a.webkitPreservesPitch = false;
  a.preservesPitch = false;
  return a;
}

function setupSongAudio(midiPitch) {
  var a;
  if (midiPitch < 54) {
    a = setupC4YipAudio(midiPitch);
  } else {
    a = setupBaseYipAudio(midiPitch);
  }
  return a;
}

function playSong(song, forceSong, finishFunc) {
  if (forceSong === undefined && state.isSinging) {
    console.log(":(")
        // var val = $("#debugdiv").val();
        // $("#debugdiv").html(())
    return;
  }
  state.isSinging = true;
    // try {
  var yips = [];
  for (var yipIndex in song) {
    var midiPitch;
    var lengthInMillis;
    if (Array.isArray(song[yipIndex])) {
      midiPitch = song[yipIndex][0];
      lengthInMillis = song[yipIndex][1];
    } else {
      midiPitch = song[yipIndex];
      lengthInMillis = config.defaultYipSongNoteLength;
    }
    var a = setupSongAudio(midiPitch);
    yips.push([a, lengthInMillis]);
  }

  setTimeout(playSongInner, 500 + song.length * 10, yips, 0, finishFunc);
  // playSongInner(yips, 0);
    // } catch (err) {
    //     state.isSinging = false;
    //     throw err;
    // }
}

var stopSong = false;

function playSongInner(song, index, finishFunc) {
    // try {
  var a = song[index][0];
  var lengthInMillis = song[index][1];
  var prePlay = index == 0;

  // while(lengthInMillis == 0 && index < song.length-2) {
  //   animate_yip();
  //   a.play();

  //   index += 1;
  //   a = song[index][0];
  //   lengthInMillis = song[index][1];
  // }

  // for (var i = prePlay ? 0 : 1; i < 2; i++) {
  //   while(lengthInMillis == 0 && index < song.length-2) {
  //     if (i == 1) {
  //       animate_yip();
  //       a.play();
  //     } else {
  //       var volume = a.volume;
  //       a.volume = 0;
  //       a.play();
  //       a.volume = volume;
  //     }

  //     index += 1;
  //     a = song[index][0];
  //     lengthInMillis = song[index][1];
  //   }

  animate_yip();
  a.play();

  if (index < song.length-1 && !stopSong) {
    if (lengthInMillis == 0) {
      playSongInner(song, index+1, finishFunc);
    } else {
      setTimeout(playSongInner, lengthInMillis, song, index+1, finishFunc);   
    }
    
  } else {
    state.isSinging = false;
    stopSong = false;

    if (finishFunc) {
        finishFunc();
    }
  }
    // if (i == 1) {
    //   animate_yip();
    //   a.play();

    //   if (index < song.length-1 && !stopSong) {
    //     setTimeout(playSongInner, lengthInMillis, song, index+1); 
    //   } else {
    //     state.isSinging = false;
    //     stopSong = false;
    //   }
    // } else {
    //   var volume = a.volume;
    //   a.volume = 0;
    //   a.play();
    //   a.volume = volume;
    //   index = 0;
    // }
    // } catch (err) {
    //   state.isSinging = false;
    //   throw err;
    // }
}

function cheer_yip(channel, context, msg, self) {
  yip(yipCount, msPerYip);
}


function animate_yip() {
    static_animate_yip();
}


function hiding_animate_yip() {
  

  var spanElement = yipSpanPool.getElement();
  var span = spanElement.data;
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
        yipSpanPool.releaseElement(spanElement);
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

function static_animate_yip() {
  var spanElement = yipSpanPool.getElement();
  var span = spanElement.data;
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
        yipSpanPool.releaseElement(spanElement);
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
  if (!state.isYipping) { // && getMillisecondsDiff(state.lastYipDate, nextDate) > config.minimumYipGapMilliseconds * 2) {
    state.isYipping = true;
    state.lastYipDate = nextDate;

    $("#yip").attr("src", config.image2);
    setTimeout(reset_yip, 50); // config.minimumYipGapMilliseconds);
  }
}

function yip(yipCount, msPerYip) {
  var midiPitch = 56 + Math.random()*12;
  var audio = setupBaseYipAudio(midiPitch);
  audio.play();
  animate_yip();

  if (yipCount-1 > 0) {
    setTimeout(yip, msPerYip, yipCount-1, msPerYip);
  }
}
