// Define configuration options
const opts = {
  identity: {
    username: config.twitchUsername,
    password: config.twitchOAuthPassword
  },
  channels: config.twitchChannels
};

// Create a client with our options
const client = new tmi.client(opts);

// Register our event handlers (defined below)
// client.on('raw_message', (message) => {
//   console.log(message.raw);
//   console.log(message);
// });
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);
client.on('cheer', cheer_yip);

// Connect to Twitch:
client.connect();

function poll_channel_points() {

}

function postLink() {
  client.say("kobold_wyx", "https://youtu.be/2vrAc_c9RRI");
  setTimeout(postLink, 600000);
}

function doHelp(channel, context) {
  var user = context["display-name"];
  var userYips = fetchUserYips(user);
  client.say(channel, "@" + user + ": You have " + userYips.yips + " yips! To use them, run `!yip <number of yips> <milliseconds between yips>`");
}

function hello() {
  var audio = new Audio('sounds/hello.mp3');
  audio.loop = false;
  audio.play();
}

// Called every time a message comes in
function onMessageHandler (channel, context, msg, self) {
  if (self) { return; }

  // console.log(context);
  // console.log(msg);
  var user = context["display-name"];
  updateYips(user);
  raffleAddEntryToday(user);

  if (!msg.startsWith('!')) { return; }

  // Remove whitespace from chat message
  const command = msg.trim();
  console.log(command);

  // If the command is known, let's execute it
  var commandArr = command.split(/\s+/);

  if (commandArr[0] === "!yiphelp") {
    doHelp(channel, context);
  } else if (commandArr[0] === "!yipsong") {
      var song = commandArr[1];
      if (song === "mario") {
        marioYip();
      } else if (song === "girl") {
        girlInTheTowerYip();
      } else if (song === "charge") {
        chargeYip();
      } else if (song === "sans") {
        sansYip();
      } else if (song === "yakety") {
        yaketyYip();
      } else if (song === "custom") {
        if (commandArr.length > 18) {
          client.say(channel, "Only 16 notes max!");
        } else {
          var songString = commandArr.slice(2).join(" ");
          var song = detokenizeYipSong(songString);
          var valid = true;
          if (song) {
            playSong(song);
          } else {
            client.say(channel, "Invalid custom song! You can pass a midi pitch number or that number and a note length inside square brackets, ie. [75, 400] will play C5 for .4 seconds");
          }
        }
      } else {
        client.say(channel, "Current songs: custom, mario, girl, charge, sans");
      }
  } else if (commandArr[0] === '!yip') {

    var args = command.split(/ +/, 4);
    if (args[1] === "give" && config.mods.includes(user)) {
      var user = args[2];
      var yips = parseInt(args[3]);

      updateYips(user, yips);

    } else {
      var yips = parseInt(args[1]);
      var msPerYip = parseInt(args[2]);
      if ((isNaN(yips) || isNaN(msPerYip)) && !state.helpInCooldown) {
        doHelp(channel, context);
        return;
      }

      if (msPerYip < config.minimumYipGapMilliseconds) {
        client.say(channel, "@" + user + ": The minimum gap between yips in milliseconds is " + config.minimumYipGapMilliseconds + "!");
        return;
      }

      var userYips = fetchUserYips(user);
      if (userYips.yips <= 0) {
        var user = context["display-name"];
        client.say(channel, "@" + user + ": You only have " + userYips.yips + " yips!");
        return;
      }
      
      yip(yips, msPerYip);
      updateYips(user, -yips);
    }
  } else if (commandArr[0] === "!hello") {
    var isMod = config.mods.includes(user);
    if (isMod && command.slice(7, 10) === "off") {
      state.helloEnabled = false;
    } else if (isMod && command.slice(7, 10) === "on") {
      state.helloEnabled = true;
    } else if (state.helloEnabled || isMod) {
      hello();
    }
  } else if (commandArr[0] === "!artist") {
    client.say(channel, "The current vtuber artist today is @WilcoWeb!");
  } else if (commandArr[0] === "!raffle") {
    var isMod = config.mods.includes(user);
    var cmd = commandArr[1];
    if (isMod) {
      // meta commands
      if (cmd === "enable") {
        raffleSetIsEnabled(true);
      } else if (cmd === "disable") {
        raffleSetIsEnabled(false);
      } else if (cmd === "raffleOn") {
        raffleSetAcceptEntries(true);
      } else if (cmd === "raffleOff") {
        raffleSetAcceptEntries(false);
      }
      // commands
      else if (raffleIsEnabled) {
        if (cmd === "draw") {
          raffleDrawCommand(client, channel);
        } else if (cmd === "add" && commandArr[2] && commandArr[3]) {
          var day = commandArr[2];
          var user = commandArr[3];
          raffleAddEntry(day, user);
        } else if (cmd === "clear") {
          raffleClearEntries();
        } else if (cmd === "checkEntries") {
          var user = commandArr[2];
          raffleAdminQueryCommand(client, channel, user);
        } else if (cmd === "debug") {
          raffleDebug(client, channel);
        }
      }
    } else if (raffleIsEnabled) {
      raffleQueryCommand(client, channel, user);
    }
  }
}

// Function called when the "dice" command is issued
// function rollDice () {
//   const sides = 6;
//   return Math.floor(Math.random() * sides) + 1;
// }

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
  // postLink();
}

$.when( $.ready ).then(function() {
    $(document).click(yip);
});
