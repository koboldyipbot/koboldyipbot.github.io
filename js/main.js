import {TwitchUtils} from './twitch/utils.js';
import {TwitchChat} from 'twitchChat';

export class MainChat extends TwitchChat {
  constructor () {
    super();
  }

  async handleChatMessage(event) {
    let me = this;
    console.log(event);
    let commandArr = event.message.text.split(/\s+/);
    let username = event.chatter_user_login;
    let isMod = me.twitchUtils.isUserMod(event.chatter_user_login, event.broadcaster_user_id);

    onMessageHandler(event);

    // let command = commandArr[0].trim();


    // if (commandArr[0] === "!tfmachine" && isMod) {
    //   console.log(`DEBUG: commandArr: ${JSON.stringify(commandArr)}`);
    //   // me.tfMachineQueue.enqueue(commandArr[1].trim());
    // }
    
    // if (event.cheer) {
    //   let bits = event.cheer.bits;
    //   // ...
    // } else {
    //   // ...
    // }
  }

  async onOpenFunc(e) {
    setTimeout(charityChat, 15 * 60 * 1000);
  }

  async handleChatNotification(event) {
  }
}

const twitchChat = new MainChat();
twitchChat.connect();

// Define configuration options
var lastChatDates = loadLastChatDates();

function loadLastChatDates() {
  return JSON.parse(localStorage.getItem("lastChatDates")) || {};
}

function periodicallyCacheLastChats() {
  localStorage.setItem("lastChatDates", JSON.stringify(lastChatDates));
  setTimeout(periodicallyCacheLastChats, config.cacheLastChatsTimeout);
}

let twitchUtils = new TwitchUtils(secrets.twitch.chatBot);

// const opts = {
//   identity: {
//     username: config.twitchUsername,
//     password: null
//   },
//   channels: config.twitchChannels // tODO
// };

// twitchUtils.getTwitchAuthToken(secrets.twitch.chatBot).then((x) => {
//   opts.identity.password = `oauth:${x.access_token}`;
//   client = new tmi.client(opts);

//   client.on('message', onMessageHandler);
//   client.on('connected', onConnectedHandler);
//   client.connect();
// });

// Create a client with our options
// const client = new tmi.client(opts);

// Register our event handlers (defined below)
// client.on('raw_message', (message) => {
//   console.log(message.raw);
//   console.log(message);
// });
// client.on('message', onMessageHandler);
// client.on('connected', onConnectedHandler);

// Connect to Twitch:
// client.connect();

// var websocket = new WebSocket('wss://pubsub-edge.twitch.tv')

function poll_channel_points() {

}

function postWorkshop() {
  // client.say("kobold_wyx", "https://youtu.be/2vrAc_c9RRI");
  for (var i = 0; i < opts.channels.length; i++) {
    let channel = opts.channels[i];
    twitchChat.sendMessage("!workshop");
  }
  // setTimeout(postWorkshop, 900000);
}

function postStartYips() {
  // client.say("kobold_wyx", "https://youtu.be/2vrAc_c9RRI");
  for (var i = 0; i < opts.channels.length; i++) {
    let channel = opts.channels[i];
    // client.say(channel, "!yip 10000 10000");
    // client.say(channel, "!yip 13333 13333");
  }
  // yip(10000, 10000);  actual yip start
  // yip(13333, 13333);
  // setTimeout(StartYips, 900000);
}

function postLink() {
  // client.say("kobold_wyx", "https://youtu.be/2vrAc_c9RRI");
  for (var i = 0; i < opts.channels.length; i++) {
    let channel = opts.channels[i];
    twitchChat.sendMessage("type !raffle to win art by @ovaettr! drawing at 7:30pm PST! you can gain an extra entry, check !charity for details!");
  }
  setTimeout(postLink, 900000);
}

function doHelp(channel, context) {
  var user = context["display-name"];
  var userYips = fetchUserYips(user);
  twitchChat.sendMessage("@" + user + ": You have " + userYips.yips + " yips! Help here: https://wyx.gay/yipbot");
}

function hello() {
  var audio = new Audio('sounds/hello.mp3');
  audio.loop = false;
  audio.volume = .6;
  audio.play();
}

// Called every time a message comes in
// function onMessageHandler (channel, context, msg, self) {
function onMessageHandler(event) {
  let channel = event.broadcaster_user_id;

  // console.log(context);
  let username = event.chatter_user_login;
  let msg = event.message.text;


  let prevChatDate = lastChatDates[username];
  lastChatDates[username] = new Date();
  // addRPGChatXP(username, prevChatDate);
  // rpgSpringTrap(username, client, channel);

  // if (self && !(msg.startsWith("!yip"))) { return; }

  if (event.cheer && event.cheer.bits) {
    var out = "wow, " + event.cheer.bits + " bits- " + event.cheer.bits + " yips for @" + username + "!";
    var outs = ["yip?", "yip!"];
    var nextOut = outs[Math.floor(Math.random() * outs.length)];
    var yipCount = 0;
    while (out.length + nextOut.length < 500 && yipCount < event.cheer.bits) {
      yipCount += 1;
      out += nextOut;
      nextOut = outs[Math.floor(Math.random() * outs.length)];
    }
    twitchChat.sendMessage(out);
    twitchChat.sendMessage("!yip " + context.bits + " 50");
    return;
  }

  // console.log(context);
  // console.log(msg);
  
  updateYips(username);


  // raffleAddEntryToday(user);

  if (!msg.startsWith('!')) { return; }

  // Remove whitespace from chat message
  const command = msg.trim();
  console.log(command);

  // If the command is known, let's execute it
  var commandArr = command.split(/\s+/);
  var isMod = config.mods.includes(username);

  var cmd1 = commandArr[0].toLowerCase();
  console.log(channel);

  if (cmd1 === "!commands") {
    twitchChat.sendMessage("https://wyx.gay/yipbot");
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
          twitchChat.sendMessage("Only 16 notes max!");
        } else {
          var valid = true;
          if (song) {
            playSong(song);
          } else {
            twitchChat.sendMessage("Invalid custom song! You can pass a midi pitch number or that number and a note length inside square brackets, ie. [75, 400] will play C5 for .4 seconds");
          }
        }
      } else {
        twitchChat.sendMessage("Current songs: custom, mario, girl, charge, sans, yakety, yipshanty2, blinded, koboldtown, zeldastorms");
      }
  } else if (cmd1 === '!yip') {

    var args = command.split(/ +/, 4);
    if (args.length == 1 || args[1] == "help") {
      doHelp(channel, context);
      return;
    } else if (args[1].toLowerCase() === "give" && config.mods.includes(username)) {
      var toUser = args[2];
      var yips = parseInt(args[3]);

      updateYips(toUser, yips);

    } else {
      var yips = parseInt(args[1]);
      var msPerYip = parseInt(args[2]);
      if (((isNaN(yips) || isNaN(msPerYip))) && !state.helpInCooldown) {
        doHelp(channel, context);
        return;
      }

      if (msPerYip < config.minimumYipGapMilliseconds) {
        twitchChat.sendMessage("@" + username + ": The minimum gap between yips in milliseconds is " + config.minimumYipGapMilliseconds + "!");
        return;
      }

      var userYips = fetchUserYips(username);
      if (userYips.yips + userYips.bonusYips - yips < 0) {
        twitchChat.sendMessage("@" + username + ": You only have " + (userYips.yips + userYips.bonusYips) + " yips!");
        return;
      }
      
      yip(yips+1, msPerYip);
      updateYips(username, -yips);
    }
  } else if (cmd1 === "!hello") {
    if (isMod && command.slice(7, 10) === "off") {
      state.helloEnabled = false;
    } else if (isMod && command.slice(7, 10) === "on") {
      state.helloEnabled = true;
    } else if (state.helloEnabled || isMod) {
      hello();
    }
  // } else if (cmd1 === "!rpg") {
  //   var cmd2 = commandArr[1] ? commandArr[1].toLowerCase() : null;
  //   if (cmd2 === "scavenge") {
  //     rpgScavenge(username, client, channel);
  //   } else if (cmd2 === "start") {
  //     startRPGCharacter(username);
  //   } else if (cmd2 === "fight") {
  //     var targetUser = commandArr[2] ? commandArr[2].toLowerCase() : null;
  //     if (targetUser != null) {
  //       rpgFight(username, targetUser, client, channel);
  //     } else {
  //       rpgFightRandomOpponent(username, client, channel);
  //     }
  //   } else if (cmd2 === "trap") {
  //     let targetUser = commandArr[2];
  //     rpgSetTrap(user, targetUser, client, channel);
  //   } else {
  //     twitchChat.sendMessage("Valid subcommands: scavenge, start, fight, fight [user], trap [user].  see: https://wyx.gay/yipbot")
  //   }
  // } else if (cmd1 === "!warframe") {
  //   var cmd2 = commandArr[1] ? commandArr[1].toLowerCase() : null;
  //   if (cmd2 === "search") {
  //     var cmd3 = commandArr[2] ? commandArr[2].toLowerCase() : null;
  //     console.log(cmd3);
  //     var searchText = commandArr.slice(3).join(" ");
  //     if (cmd3 === "relic") {
  //       warframeChatRelicSearch(user, client, channel, searchText);
  //     } else if (cmd3 === "item" || cmd3 === "vaulted") {
  //       let vaulted = cmd3 === "vaulted";
  //       let searchText = commandArr.slice(vaulted ? 4 : 3).join(" ");
  //       warframeChatItemSearch(user, client, channel, vaulted, searchText);
  //     } else {
  //       twitchChat.sendMessage(`${user}: Unknown item type. Command: !warframe search [relic|item] [search text]`);
  //     }
  //   } else if (cmd2 === "raffle") {
  //     twitchChat.sendMessage(`wyx has the following relics: Axi A2, A5, C8, D5, I3, K12, P6, S15, T9, T11, V8; Lith C7, G9, G11, H10, K11, N13, P8, P9, R5, S13, T10, T12, V10; Meso A5, C7, C10, M4, N16, P12, S13, W2, W3; Neo A10, E3, F3, G5, K6, K7, O1, P5, W1, Z9`);
  //   } else if (config.mods.includes(user)) {
  //     if (cmd2 ===  "relic") {
  //       let relics = ["Axi A2", "Axi A5", "Axi C8", "Axi D5", "Axi I3", "Axi K12", "Axi P6", "Axi S15", "Axi T9", "Axi T11", "Axi V8", "Lith C7", "Lith G9", "Lith G11", "Lith H10", "Lith K11", "Lith N13", "Lith P8", "Lith P9", "Lith R5", "Lith S13", "Lith T10", "Lith T12", "Lith V10", "Meso A5", "Meso C7", "Meso C10", "Meso M4", "Meso N16", "Meso P12", "Meso S13", "Meso W2", "Meso W3", "Neo A10", "Neo E3", "Neo F3", "Neo G5", "Neo K6", "Neo K7", "Neo O1", "Neo P5", "Neo W1", "Neo Z9"];
  //       let relic = relics[Math.floor(Math.random()*relics.length)];
  //       twitchChat.sendMessage(`Next relic: ${relic}`);
  //     }
  //   }
  //   // client.say(channel, "Available vaulted relics: Axi: B7, D5, I3, K12, P6, T9, V11 - Lith: G9, G11, N13, S13, T10, V10 - Meso: A5, C7, C10, H6, M4, P12, W2, W3 - Neo: A10, E3, F3, K6, K7, P5, S2, W1, Z9");
  } else if (cmd1 === "!help") {
    twitchChat.sendMessage("Full command list here: https://wyx.gay/yipbot");
  // } else if (cmd1 === "!raid") {
    // twitchChat.sendMessage("Today we're gonna raid @ultchimi!!!! be sure to yip at him!!!!");
  // } else if (cmd1 === "!artist") {
  //   twitchChat.sendMessage("The current vtuber artist today is @ovaettr!");
  } else if (cmd1 === "!music") {
    twitchChat.sendMessage("Intro music by @kobold_wyx - https://wyx.gay/music");
  } else if (cmd1 === "!patreon") {
    twitchChat.sendMessage("Making & streamin' games - now on Patreon! - https://patreon.com/KoboldInteractive");
  } else if (cmd1 === "!kofi" || cmd1 === "!ko-fi") {
    twitchChat.sendMessage("Making & streamin' games - now on Ko-fi! - https://ko-fi.com/kobold_interactive");
  // } else if (cmd1 === "!discord") {
  //   twitchChat.sendMessage("Join the Kobold Town Discord! https://discord.gg/b8C9nPyP");
  // } else if (cmd1 === "!forum") {
  //   twitchChat.sendMessage("Join the Kobold Town Forum! https://kobold.town");
  // } else if (cmd1 === "!charity") {
  //   client.say(channel, "wyx is donating $5 to the Palestinian Children's Relief Fund for every time they eat a child!  If you donate at least $1 and send a receipt to wyx@koboldinteractive.com, you'll gain an extra !raffle entry!");
  // } else if (cmd1 === "!workshop") {
    // client.say(channel, "wyx is holding a ttrpg workshop for their custom game on Saturday 9/23, 10am-12pm pacific! https://forums.kobold.town/t/next-workshop-sept-23rd-10am-pacific/110/3");
  // } else if (cmd1 === "!charity") {
    // client.say(channel, "wyx is donating 100% of their bits and subs through and including March 26th, when they're going to have an all-day stream to support the Lavender Clinic! see https://wyx.gay");
  } else if (cmd1 === "!raffle") {
    var isMod = config.mods.includes(username);
    var cmd2 = commandArr[1] ? commandArr[1].toLowerCase() : null;
    console.log(`!raffle - ${username} - ${cmd2}`);
    if (isMod) {
      // meta commands
      if (cmd2 === "enable") {
        raffleSetIsEnabled(true);
      } else if (cmd2 === "disable") {
        raffleSetIsEnabled(false);
      } else if (cmd2 === "raffleon") {
        raffleSetAcceptEntries(true);
      } else if (cmd2 === "raffleoff") {
        raffleSetAcceptEntries(false);
      }
      // commands
      else if (raffleIsEnabled) {
        if (cmd2 === "draw") {
          var times = parseInt(commandArr[2]);
          if (isNaN(times)) {
            times = 1;
          }
          raffleDrawCommand(client, channel, times);
        } else if (cmd2 === "add" && commandArr[2] && commandArr[3]) {
          var day = commandArr[2];
          var targetUser = commandArr[3];
          raffleAddEntry(day, targetUser);
        } else if (cmd2 === "clear") {
          raffleClearEntries();
        } else if (cmd2 === "checkentries") {
          var targetUser = commandArr[2];
          raffleAdminQueryCommand(client, channel, targetUser);
        } else if (cmd2 === "debug") {
          raffleDebug(client, channel);
        } else {
          twitchChat.sendMessage("type !raffle to join the drawing for the next Void Relic!");
            // "  you can gain one entry per stream, OR gain an extra entry by emailing a photo of your dono and your username to wyx [[at]] koboldinteractive [[dot]] com ! https://twitter.com/kobold_wyx/status/1623493284143448064");
        } 
      }
    } else if (raffleIsEnabled) {
      console.log(`adding ${username} to raffle`);
      raffleAddEntryToday(username);
      // raffleQueryCommand(client, channel, user);
    }
  }
}

// Function called when the "dice" command is issued
// function rollDice () {
//   const sides = 6;
//   return Math.floor(Math.random() * sides) + 1;
// }

function charityChat() {
  twitchChat.sendMessage("Today's charity: The Portland Sisters of Perpetual Indugence! https://portlandsisters.org/donate/");
  setTimeout(charityChat, 15 * 60 * 1000);
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
  // postWorkshop();
  // setTimeout(postStartYips, 1000);
  setTimeout(charityChat, 30000);
  // let initiatorData = getRPGCharacter('yip_bot');
  
  // setTimeout(postLink, 900000);
}

$.when( $.ready ).then(function() {
    $(document).click(yip);
});

// websocket.onmessage = (event) => {

//   client.say(event.data);
// }