// Define configuration options
const opts = {
  identity: {
    username: config.twitchUsername,
    password: config.twitchOAuthPassword
  },
  channels: [
    config.twitchChannel
  ]
};

// Create a client with our options
const client = new tmi.client(opts);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();

function doHelp(channel, context) {
  state.helpInCooldown
  var user = context["display-name"];
  var userYips = fetchUserYips(user);
  client.say(channel, "@" + user + ": You have " + userYips.yips + " yips! To use them, run `!yip <number of yips> <milliseconds between yips>`");
}

// Called every time a message comes in
function onMessageHandler (channel, context, msg, self) {
  if (self) { return; }

  var user = context["display-name"];
  updateYips(user);

  if (!msg.startsWith('!')) { return; }

  // Remove whitespace from chat message
  const command = msg.trim();

  // If the command is known, let's execute it
  if (command.slice(0,8) === "!yiphelp") {
    doHelp(channel, context);
  } else if (command.slice(0,4) === '!yip') {
    var args = command.split(" ", 3);
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

    if (userYips.yips <= 0) {
      var user = context["display-name"];
      client.say(channel, "@" + user + ": You only have " + userYips.yips + " yips!");
      return;
    }

    var userYips = fetchUserYips(user);
    yip(client, channel, yips, msPerYip);
    updateYips(user, -yips);
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
}

$.when( $.ready ).then(function() {
    $(document).click(yip);
});