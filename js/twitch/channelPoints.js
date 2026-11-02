import {TwitchWebsocketHelper} from 'twitchWebsocket';
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

var twitchEventDisconnectingWebsocket = null;
var twitchEventWebsocket = null;
var twitchEventSessionID = null;
// var twitchEventConnectedAt = {};
var twitchEventRefreshTimeoutID = null;

var twitchEventAuthRevoked = false;
var twitchEventMessageHandlers = {};


var twitchMessageIdCache = {};


const twitchEventScopes = config.twitchAuthScopes.streamer.map(encodeURIComponent).join("+");

const channelPointWebsocketEventSubscriptions = {
  "channel.channel_points_custom_reward_redemption.add": {
    version: "1",
    condition: {
      "broadcaster_user_id": secrets.twitch.streamer.channelID
    }
  }
};

export class TwitchChannelPoints {
  constructor(auth) {
    this.websocketHelper = TwitchWebsocketHelper(
      secrets.twitch.streamer,
      config.twitchChannelPointConfig,
      this.onOpenFunc,
      this.onNotificationFunc
    );

    this.websocketHelper.rebuildWebsocket();
  }

  async onOpenFunc(e) {
    console.log("Channel points websocket opened!");
  }

  async onNotificationFunc(data) {
    console.log(data);
    let subscriptionType = data.metadata.subscription_type;
    if (subscriptionType === "channel.channel_points_custom_reward_redemption.add") {
      console.log("yay");
    }
  }

}

// https://id.twitch.tv/oauth2/authorize?client_id=34njj6we18nbb8ml4si3q8ux7eqa6m&force_verify=false&redirect_uri=http://localhost&scope=channel%3Aread%3Aredemptions+bits%3Aread&response_type=code


// var DEBUGGY;

// async twitchEventRebuildWebsocket(url) {
//   if (url == null) {
//     url = `${config.twitchChannelPointConfig.websocketURL}?keepalive_timeout_seconds=${config.twitchChannelPointConfig.keepalive_timeout_seconds}`;
//   }
//   getTwitchAuthToken(secrets.twitch.channelPoints).then((accessToken) => {
//     twitchEventRebuildWebsocketInner(url, accessToken);
//   });
// }

// function twitchEventSubscriptionCleanup() {
//   twitchEventGetSubscriptions().then((subscriptions) => {
//     for (let i in subscriptions) {
//       let sub = subscriptions[i];
//       console.log(sub);
//       if (sub.status != 'enabled') {
//         console.log(`deleting subscription ${sub.id}`);
//         twitchEventDeleteSubscription(sub.id);
//       }
//     }
//   });
// }



// async function twitchEventDeleteSubscription(subscriptionID) {

//   return doTwitchAPIRequest(
//     secrets.twitch.channelPoints,
//     async (twitchAuthToken) => {
//       let resp = await fetch(`https://api.twitch.tv/helix/eventsub/subscriptions?id=${subscriptionID}`, {
//         method: 'DELETE',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${twitchAuthToken}`,
//           'Client-Id': secrets.twitch.channelPoints.clientID,
//         }
//       });

//       if (!resp.ok) {
//         console.log(`Failed to delete subscription ${subscriptionID}: ${JSON.stringify(output)}`);
//       }

//       return resp;
//     }
//   );
// }

// async function twitchEventGetSubscriptions() {

//   return doTwitchAPIRequest(
//     secrets.twitch.channelPoints,
//     async (twitchAuthToken) => {
//       let nextPage = 'start';
//       let subscriptions = [];

//       while (nextPage != null) {

//         let resp = await fetch(`https://api.twitch.tv/helix/eventsub/subscriptions`, {
//           method: 'GET',
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${twitchAuthToken}`,
//             'Client-Id': secrets.twitch.channelPoints.clientID,
//           }
//         });

//         let output = await resp.json();
//         console.log(output);
//         subscriptions = subscriptions.concat(output.data);
//         nextPage = output.pagination.cursor;
//       }

//       return subscriptions;
//     }
//   )
// }

// async function twitchEventSubscribe(eventName, version, condition) {
//   return doTwitchAPIRequest(
//     secrets.twitch.channelPoints,
//     async (twitchAuthToken) => {
//       let body = JSON.stringify({
//         'type': eventName,
//         'version': version,
//         'condition': condition,
//         'transport': {
//           'method': 'websocket',
//           'session_id': twitchEventSessionID
//         }
//       });
//       let resp = await fetch(`https://api.twitch.tv/helix/eventsub/subscriptions`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${twitchAuthToken}`,
//           'Client-Id': secrets.twitch.channelPoints.clientID,
//         },
//         body: body
//       });

//       let output = await resp.json();
//       // console.log(`getTwitchUsers output: ${output}`);
//       return output;
//     }
//   );
// }

// function twitchEventRebuildWebsocketInner(url, accessToken) {
//   // 1. Delete old websocket subscriptions
//   // 2. Subscribe 
//   // 3. Build websocket
//   twitchEventSubscriptionCleanup();
//   twitchEventWebsocket = new WebSocket(url);
//   twitchEventWebsocket.onclose = (e) => {
//     twitchEventSubscriptionCleanup();
//   };
//   twitchEventWebsocket.onmessage = (e) => {
//     console.log(e);
//     let data = JSON.parse(e.data);
//     let messageType = data.metadata.message_type;

//     if (messageType === "session_welcome") {
//       if (data.payload.session.status === "connected") {
//         console.log("Connected to Channel Points websocket successfully!");
        
//         if (twitchEventDisconnectingWebsocket != null) {
//           twitchEventDisconnectingWebsocket.close();
//           twitchEventDisconnectingWebsocket = null;
//         }

//         twitchEventSessionID = data.payload.session.id;
//         for (let i in twitchEventSubscriptions) {
//           twitchEventSubscribe(
//             twitchEventSubscriptions[i], 
//             "1",
//             {
//               "broadcaster_user_id": secrets.twitch.channelPoints.channelID
//             }
//           );
//         }

//       } else {
//         console.log(`Channel Points websocket failure: ${data}`);
//       }
//     } else if (messageType === "session_reconnect") {
//       twitchEventDisconnectingWebsocket = twitchEventWebsocket;
//       twitchEventRebuildWebsocket(data.payload.reconnect_url);
//     } else if (messageType === "session_keepalive") {
//       lastKeepalive = new Date(data.metadata.message_timestamp);
//       // TODO: add keepalive checker
//     } else if (messageType === "notification") {
//       console.log(data);
//       let subscriptionType = data.metadata.subscription_type;
//       if (subscriptionType === "channel.channel_points_custom_reward_redemption.add") {
//         console.log("yay");
//       }
//     }
//     // if (data.type == "PONG") {
//     //   console.log("it's happening!");
//     // } else if (data.type == "RECONNECT") {
//     //   twitchEventWebsocket.close();
//     //   twitchEventWebsocket = null;
//     // } else if (data.type == "AUTH_REVOKED") {
//     //   if (!twitchEventAuthRevoked) {
//     //     twitchEventAuthRevoked = true;
//     //     client.say(secrets.twitch.channelPoints.username, "UH OH your twitch channel point auth got revoked!");
//     //   }
//     // } else if (data.type == "RESPONSE") {
//     //   if (data.error == "ERR_BADAUTH") {
//     //     console.log("clearing token");
//     //     twitchEventAuthToken = null;
//     //   }
//     //   console.log(data);
//     // } else if (data.type == "MESSAGE") {
//     //   // TODO: Handle message_id field cache
//     //   // TOOD: discard message_timestamp > 10m old
//     //   console.log(data);
//     //   let messageData = JSON.parse(data.data.message);
//     //   twitchEventMessageHandlers[data.data.topic](messageData);
//     // } else {
//     //   console.log(e.data);
//     // }
//   };
//   twitchEventWebsocket.onopen = (e) => {
//     console.log("pinging onopen");
//     // twitchEventWebsocket.send(JSON.stringify({type: "PING"}));
//     // setup channel point redemptions
//     // twitchEventListenToTopic(
//     //   `channel-points-channel-v1.${secrets.twitch.channelPoints.channelID}`,
//     //   twitchEventChannelPointHandler
//     // );
//   }
// }

// function twitchEventChannelPointHandler(data) {
//   let reward = data.data.redemption.reward;
//   let user = data.data.redemption.user.login;
//   console.log(`redemption: ${reward.title}`); 
//   if (reward.title == "Buy 100 Yips") {
//     updateYips(user, 100);
//     client.say("#kobold_wyx", `${user} just bought 100 yips with Channel Points!`);
//     console.log(fetchUserYips(user));
//   } else if (reward.title == "Yipsong: Mario") {
//     marioYip();
//   } else if (reward.title == "Yipsong: Girl in the Tower") {
//     girlInTheTowerYip();
//   } else if (reward.title == "Yipsong: Charge!!!") {
//     chargeYip();
//   } else if (reward.title == "Yipsong: Sans") {
//     sansYip();
//   } else if (reward.title == "Yipsong: Yakety Yip") {
//     yaketyYip();
//   } else if (reward.title == "Yipsong: Yip Shanty 2") {
//     yipShanty2Yip();
//   } else if (reward.title == "Yipsong: Blinded By the Yip") {
//     blindedYip();
//   } else if (reward.title == "Yipsong: Neon Genesis Yipvangeleon") {
//     angelYip();
//   } else if (reward.title == "Yipsong: Kobold Town") {
//     koboldTownYip();
//   } else if (reward.title == "Yipsong: Song of Storms") {
//     songOfStormsYip();
//   } else if (reward.title == "Yipsong: Sandstorm") {
//     sandstormYip();
//   }
// }

// function twitchEventListenToTopic(topic, messageHandlerFunc) {
//   // only use messageHandlerFunc if the type we expect to see is "MESSAGE"
//   twitchEventWebsocket.send(JSON.stringify({
//     type: "LISTEN",
//     data: {
//       topics: [topic],
//       auth_token: twitchEventAuthToken
//     }
//   }));
//   if (messageHandlerFunc != null) {
//     twitchEventMessageHandlers[topic] = messageHandlerFunc;
//   }
// }

// function twitchEventRefreshWebsocket() {
//   if (twitchEventWebsocket == null) {
//     console.log("rebuilding");
//     twitchEventRebuildWebsocket();
//     // twitchEventListenToTopic(`channel-bits-events-v1.${secrets.twitch.channelPoints.channelID}`);
//     if (twitchEventRefreshTimeoutID != null) {
//       clearTimeout(twitchEventRefreshTimeoutID);
//     }
//     twitchEventRefreshTimeoutID = setTimeout(config.websocketConfig.pingTimeout, refreshWebsocket);
//   } else {
//     console.log("pinging");
//     twitchEventWebsocket.send(JSON.stringify({type: "PING"}));
//   }
// }