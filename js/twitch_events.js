// 1.  create your own app at https://dev.twitch.tv/console/apps/create -- use http://localhost for the OAuth Redirect URL
// 2.  put your Client ID and secret into secrets.js
// 3.  replace the client_id parameter in the following url with yours: https://id.twitch.tv/oauth2/authorize?client_id=YOUR_CLIENT_ID_HERE&force_verify=false&redirect_uri=http://localhost&scope=channel%3Aread%3Aredemptions+bits%3Aread&response_type=code
// 4.  navigate your browser to the link, authenticate & approve access, then get the code parameter from the new URL
// 5.  open a new, empty tab
// 6.  copy and paste the code for the wwwEncode function into the browser console
// 7.  copy and paste the code for the getTwitchRefreshToken function into the browser console
// 8.  run `getTwitchRefreshToken("client id", "client secret", "code parameter output from step 4")` in your browser (don't copy the ` on either side of the function call)
// 9.  copy the printed refresh token back into secrets.js

// DO NOT SHARE YOUR REFRESH TOKEN

var twitchEventWebsocket = null;
var twitchEventRefreshTimeoutID = null;

var twitchEventAuthRevoked = false;
var twitchEventAuthToken = null;
var twitchEventMessageHandlers = {};

rebuildWebsocket();


const twitchEventScopes = [
  "channel:read:redemptions",
  "bits:read"
].map(encodeURIComponent).join("+");

// https://id.twitch.tv/oauth2/authorize?client_id=34njj6we18nbb8ml4si3q8ux7eqa6m&force_verify=false&redirect_uri=http://localhost&scope=channel%3Aread%3Aredemptions+bits%3Aread&response_type=code

function wwwEncode(paramMap) {
  let data = [];
  for (let i in paramMap) {
    data.push(`${encodeURIComponent(i)}=${encodeURIComponent(paramMap[i])}`);
  }
  return data.join('&');
}

async function getTwitchRefreshToken(clientID, clientSecret, authCode) {
  // helper function for setting up local client authentication
  let resp = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: wwwEncode({
      client_id: clientID,
      client_secret: clientSecret,
      code: authCode,
      grant_type: "authorization_code",
      redirect_uri: "http://localhost"
    })
  });

  let output = await resp.json();
  console.log(`refresh token: ${output.refresh_token}`);
  return output;
}

async function getTwitchAuthToken(auth) {
  // function for authenticating
  // actually used by other code & not for setup
  let resp = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: wwwEncode({
      client_id: encodeURIComponent(auth.clientID),
      client_secret: encodeURIComponent(auth.clientSecret),
      grant_type: "refresh_token",
      refresh_token: encodeURIComponent(auth.refreshToken)
    })
  });
  return await resp.json();
}

function rebuildWebsocket() {
  if (twitchEventAuthToken == null) {
    getTwitchAuthToken(secrets.twitchChannelPoints).then((x) => {
      twitchEventAuthToken = x.access_token;
      rebuildWebsocketInner();
    });
  } else {
    rebuildWebsocketInner();
  }
}

function rebuildWebsocketInner() {
  twitchEventWebsocket = new WebSocket("wss://pubsub-edge.twitch.tv");
  twitchEventWebsocket.onclose = (e) => {
    twitchEventWebsocket = null;
    refreshWebsocket();
  };
  twitchEventWebsocket.onmessage = (e) => {
    let data = JSON.parse(e.data);
    if (data.type == "PONG") {
      console.log("it's happening!");
    } else if (data.type == "RECONNECT") {
      twitchEventWebsocket.close();
      twitchEventWebsocket = null;
    } else if (data.type == "AUTH_REVOKED") {
      if (!twitchEventAuthRevoked) {
        twitchEventAuthRevoked = true;
        client.say(secrets.twitchChannelPoints.username, "UH OH your twitch channel point auth got revoked!");
      }
    } else if (data.type == "RESPONSE") {
      console.log(data);
    } else if (data.type == "MESSAGE") {
      console.log(data);
      let messageData = JSON.parse(data.data.message);
      twitchEventMessageHandlers[data.data.topic](messageData);
    } else {
      console.log(e.data);
    }
  };
  twitchEventWebsocket.onopen = (e) => {
    console.log("pinging onopen");
    twitchEventWebsocket.send(JSON.stringify({type: "PING"}));
    // setup channel point redemptions
    twitchEventListenToTopic(
      `channel-points-channel-v1.${secrets.twitchChannelPoints.channelID}`,
      twitchEventChannelPointHandler
    );
  }
}

function twitchEventChannelPointHandler(data) {
  let reward = data.data.redemption.reward;
  let user = data.data.redemption.user.login;
  console.log(`redemption: ${reward.title}`);
  if (reward.title == "Buy 100 Yips") {
    updateYips(user, 100);
    console.log(fetchUserYips(user));
  } else if (reward.title == "Yipsong: Mario") {
    marioYip();
  } else if (reward.title == "Yipsong: Girl in the Tower") {
    girlInTheTowerYip();
  } else if (reward.title == "Yipsong: Charge!!!") {
    chargeYip();
  } else if (reward.title == "Yipsong: Sans") {
    sansYip();
  } else if (reward.title == "Yipsong: Yakety Yip") {
    yaketyYip();
  } else if (reward.title == "Yipsong: Yip Shanty 2") {
    yipShanty2Yip();
  } else if (reward.title == "Yipsong: Blinded By the Yip") {
    blindedYip();
  } else if (reward.title == "Yipsong: Neon Genesis Yipvangeleon") {
    angelYip();
  } else if (reward.title == "Yipsong: Kobold Town") {
    koboldTownYip();
  } else if (reward.title == "Yipsong: Song of Storms") {
    songOfStormsYip();
  } else if (reward.title == "Yipsong: Sandstorm") {
    sandstormYip();
  }
}

function twitchEventListenToTopic(topic, messageHandlerFunc) {
  // only use messageHandlerFunc if the type we expect to see is "MESSAGE"
  twitchEventWebsocket.send(JSON.stringify({
    type: "LISTEN",
    data: {
      topics: [topic],
      auth_token: twitchEventAuthToken
    }
  }));
  if (messageHandlerFunc != null) {
    twitchEventMessageHandlers[topic] = messageHandlerFunc;
  }
}

function refreshWebsocket() {
  if (twitchEventWebsocket == null) {
    console.log("rebuilding");
    rebuildWebsocket();
    twitchEventListenToTopic(`channel-bits-events-v1.${secrets.twitchChannelPoints.channelID}`);
    if (twitchEventRefreshTimeoutID != null) {
      clearTimeout(twitchEventRefreshTimeoutID);
    }
    twitchEventRefreshTimeoutID = setTimeout(config.websocketConfig.pingTimeout, refreshWebsocket);
  } else {
    console.log("pinging");
    twitchEventWebsocket.send(JSON.stringify({type: "PING"}));
  }
}