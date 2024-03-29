// Define configuration options
var lastChatDates = loadLastChatDates();

function loadLastChatDates() {
  return JSON.parse(localStorage.getItem("lastChatDates")) || {};
}

function periodicallyCacheLastChats() {
  localStorage.setItem("lastChatDates", JSON.stringify(lastChatDates));
  setTimeout(periodicallyCacheLastChats, config.cacheLastChatsTimeout);
}

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

// Connect to Twitch:
client.connect();

// var websocket = new WebSocket('wss://pubsub-edge.twitch.tv')

function poll_channel_points() {

}

function postWorkshop() {
  // client.say("kobold_wyx", "https://youtu.be/2vrAc_c9RRI");
  for (var i = 0; i < opts.channels.length; i++) {
    let channel = opts.channels[i];
    client.say(channel, "!workshop");
  }
  setTimeout(postWorkshop, 900000);
}

function postStartYips() {
  // client.say("kobold_wyx", "https://youtu.be/2vrAc_c9RRI");
  for (var i = 0; i < opts.channels.length; i++) {
    let channel = opts.channels[i];
    // client.say(channel, "!yip 10000 10000");
    // client.say(channel, "!yip 13333 13333");
  }
  yip(10000, 10000);
  yip(13333, 13333);
  // setTimeout(StartYips, 900000);
}

function postLink() {
  // client.say("kobold_wyx", "https://youtu.be/2vrAc_c9RRI");
  for (var i = 0; i < opts.channels.length; i++) {
    let channel = opts.channels[i];
    client.say(channel, "type !raffle to win art by @ovaettr! drawing at 7:30pm PST! you can gain an extra entry, check !charity for details!");
  }
  setTimeout(postLink, 900000);
}

function doHelp(channel, context) {
  var user = context["display-name"];
  var userYips = fetchUserYips(user);
  client.say(channel, "@" + user + ": You have " + userYips.yips + " yips! Help here: https://wyx.gay/yipbot");
}

function hello() {
  var audio = new Audio('sounds/hello.mp3');
  audio.loop = false;
  audio.volume = .6;
  audio.play();
}

// Called every time a message comes in
function onMessageHandler (channel, context, msg, self) {
  var user = context["display-name"];

  prevChatDate = lastChatDates[user];
  lastChatDates[user] = new Date();
  addRPGChatXP(user, prevChatDate);
  rpgSpringTrap(user, client, channel);

  if (self && !(msg.startsWith("!yip")||msg.startsWith("!workshop"))) { return; }

  if (context.bits) {

    var out = "wow, " + context.bits + " bits- " + context.bits + " yips for @" + user + "!";
    var outs = ["yip?", "yip!"];
    var nextOut = outs[Math.floor(Math.random() * outs.length)];
    var yipCount = 0;
    while (out.length + nextOut.length < 500 && yipCount < context.bits) {
      yipCount += 1;
      out += nextOut;
      nextOut = outs[Math.floor(Math.random() * outs.length)];
    }
    client.say(channel, out);
    client.say(channel, "!yip " + context.bits + " 50");
    return;
  }

  // console.log(context);
  // console.log(msg);
  
  updateYips(user);


  // raffleAddEntryToday(user);

  if (!msg.startsWith('!')) { return; }

  // Remove whitespace from chat message
  const command = msg.trim();
  console.log(command);

  // If the command is known, let's execute it
  var commandArr = command.split(/\s+/);
  var isMod = config.mods.includes(user);

  var cmd1 = commandArr[0].toLowerCase();

  if (cmd1 === "!commands") {
    client.say(channel, "https://wyx.gay/yipbot");
  } else if (cmd1 === "!yiphelp") {
    doHelp(channel, context);
  } else if (commandArr[0] === "!yipsong") {
      var song = commandArr[1].toLowerCase();
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
      } else if (song === "yipshanty2") {
        yipShanty2Yip();
      } else if (song === "blinded") {
        blindedYip();
      } else if (song === "angel" && isMod) {
        angelYip();
      } else if (song === "koboldtown") {
        koboldTownYip();
      } else if (song === "zeldastorms") {
        songOfStormsYip();
      } else if (song === "sandstorm") {
        sandstormYip();
      } else if (song === "custom") {
        var songString = commandArr.slice(2).join(" ");
        var song = detokenizeYipSong(songString);
        if (song.length > 16 && !isMod) {
          client.say(channel, "Only 16 notes max!");
        } else {
          var valid = true;
          if (song) {
            playSong(song);
          } else {
            client.say(channel, "Invalid custom song! You can pass a midi pitch number or that number and a note length inside square brackets, ie. [75, 400] will play C5 for .4 seconds");
          }
        }
      } else {
        client.say(channel, "Current songs: custom, mario, girl, charge, sans, yakety, yipshanty2, blinded, koboldtown, zeldastorms");
      }
  } else if (cmd1 === '!yip') {

    var args = command.split(/ +/, 4);
    if (args.length == 1 || args[1] == "help") {
      doHelp(channel, context);
      return;
    } else if (args[1].toLowerCase() === "give" && config.mods.includes(user)) {
      var user = args[2];
      var yips = parseInt(args[3]);

      updateYips(user, yips);

    } else {
      var yips = parseInt(args[1]) + 1;
      var msPerYip = parseInt(args[2]);
      if (((isNaN(yips) || isNaN(msPerYip))) && !state.helpInCooldown) {
        doHelp(channel, context);
        return;
      }

      if (msPerYip < config.minimumYipGapMilliseconds) {
        client.say(channel, "@" + user + ": The minimum gap between yips in milliseconds is " + config.minimumYipGapMilliseconds + "!");
        return;
      }

      var userYips = fetchUserYips(user);
      if (userYips.yips + userYips.bonusYips - yips < 0) {
        var user = context["display-name"];
        client.say(channel, "@" + user + ": You only have " + (userYips.yips + userYips.bonusYips) + " yips!");
        return;
      }
      
      yip(yips, msPerYip);
      updateYips(user, -yips);
    }
  } else if (cmd1 === "!hello") {
    if (isMod && command.slice(7, 10) === "off") {
      state.helloEnabled = false;
    } else if (isMod && command.slice(7, 10) === "on") {
      state.helloEnabled = true;
    } else if (state.helloEnabled || isMod) {
      hello();
    }
  } else if (cmd1 === "!rpg") {
    var cmd2 = commandArr[1] ? commandArr[1].toLowerCase() : null;
    if (cmd2 === "scavenge") {
      rpgScavenge(user, client, channel);
    } else if (cmd2 === "start") {
      startRPGCharacter(user);
    } else if (cmd2 === "fight") {
      var targetUser = commandArr[2] ? commandArr[2].toLowerCase() : null;
      if (targetUser != null) {
        rpgFight(user, targetUser, client, channel);
      } else {
        rpgFightRandomOpponent(user, client, channel);
      }
    } else if (cmd2 === "trap") {
      let targetUser = commandArr[2];
      rpgSetTrap(user, targetUser, client, channel);
    } else {
      client.say(channel, "Valid subcommands: scavenge, start, fight, fight [user], trap [user].  see: https://wyx.gay/yipbot")
    }
  } else if (cmd1 === "!help") {
    client.say(channel, "Full command list here: https://wyx.gay/yipbot");
  } else if (cmd1 === "!raid") {
    // client.say(channel, "Today we're gonna raid @ultchimi!!!! be sure to yip at him!!!!");
  } else if (cmd1 === "!artist") {
    client.say(channel, "The current vtuber artist today is @ovaettr!");
  } else if (cmd1 === "!music") {
    client.say(channel, "Intro music by @kobold_wyx - https://wyx.gay/music");
  } else if (cmd1 === "!discord") {
    client.say(channel, "Join the Kobold Town Discord! https://discord.gg/Ca6SAwVA");
  } else if (cmd1 === "!forum") {
    client.say(channel, "Join the Kobold Town Forum! https://kobold.town");
  } else if (cmd1 === "!charity") {
    client.say(channel, "wyx is donating $5 to the Palestinian Children's Relief Fund for every time they eat a child!  If you donate at least $1 and send a receipt to wyx@koboldinteractive.com, you'll gain an extra !raffle entry!");
  } else if (cmd1 === "!workshop") {
    // client.say(channel, "wyx is holding a ttrpg workshop for their custom game on Saturday 9/23, 10am-12pm pacific! https://forums.kobold.town/t/next-workshop-sept-23rd-10am-pacific/110/3");
  } else if (cmd1 === "!charity") {
    // client.say(channel, "wyx is donating 100% of their bits and subs through and including March 26th, when they're going to have an all-day stream to support the Lavender Clinic! see https://wyx.gay");
  } else if (cmd1 === "!raffle") {
    var isMod = config.mods.includes(user);
    var cmd2 = commandArr[1] ? commandArr[1].toLowerCase() : null;
    if (isMod) {
      // meta commands
      if (cmd2 === "enable") {
        raffleSetIsEnabled(true);
      } else if (cmd2 === "disable") {
        raffleSetIsEnabled(false);
      } else if (cmd2 === "raffleOn") {
        raffleSetAcceptEntries(true);
      } else if (cmd2 === "raffleOff") {
        raffleSetAcceptEntries(false);
      }
      // commands
      else if (raffleIsEnabled) {
        if (cmd2 === "draw") {
          raffleDrawCommand(client, channel);
        } else if (cmd2 === "add" && commandArr[2] && commandArr[3]) {
          var day = commandArr[2];
          var user = commandArr[3];
          raffleAddEntry(day, user);
        } else if (cmd2 === "clear") {
          raffleClearEntries();
        } else if (cmd2 === "checkEntries") {
          var user = commandArr[2];
          raffleAdminQueryCommand(client, channel, user);
        } else if (cmd2 === "debug") {
          raffleDebug(client, channel);
        } else {
          client.say(channel, "type !raffle to join to win art by @ovaettr! drawing at 7:30pm PST! gain an extra entry by emailing a photo of your minimum $1 dono to the PCRF (https://pcrf1.app.neoncrm.com/forms/gaza-relief) and your twitch username to wyx@koboldinteractive.com !");
            // "  you can gain one entry per stream, OR gain an extra entry by emailing a photo of your dono and your username to wyx [[at]] koboldinteractive [[dot]] com ! https://twitter.com/kobold_wyx/status/1623493284143448064");
        }
      }
    } else if (raffleIsEnabled) {
      raffleAddEntryToday(user);
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
  // postWorkshop();
  setTimeout(postStartYips, 1000);
  // setTimeout(postLink, 900000);
}

$.when( $.ready ).then(function() {
    $(document).click(yip);
});

// websocket.onmessage = (event) => {

//   client.say(event.data);
// }