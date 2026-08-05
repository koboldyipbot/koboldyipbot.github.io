import {getTwitchUtils} from 'twitchUtils';

// const twitchEventScopes = config.twitchAuthScopes.map(encodeURIComponent).join("+");

export class TwitchWebsocketHelper {
  constructor(auth, websocketConfig, owner) { // onNotificationFunc, onOpenFunc = (e)=>{}) {
  	// config
    this.auth = auth;
    this.twitchUtils = getTwitchUtils(auth);
    this.websocketConfig = websocketConfig;
    this.websocketName = websocketConfig.name; // "Channel Points"
    this.websocketURL = websocketConfig.websocketURL; // "wss://eventsub.wss.twitch.tv/ws"
    this.websocketKeepaliveTimeout = websocketConfig.keepalive_timeout_seconds; // 600
    this.websocketEventSubscriptions = websocketConfig.websocketEventSubscriptions; // [ "channel.channel_points_custom_reward_redemption.add" ]
    this.owner = owner;
    // this.onNotificationFunc = onNotificationFunc; -- moved to this.owner
    // this.onOpenFunc = onOpenFunc; -- moved to this.owner

    // state
    this.websocket = null;
    this.disconnectingWebsocket = null;
    this.websocketSessionID = null;
    this.lastKeepalive = null;
  }

  async rebuildWebsocket(url = null) {
  	let me = this;
    me.websocket = new WebSocket(`${me.websocketURL}?keepalive_timeout_seconds=${me.websocketKeepaliveTimeout}`); // config.twitchChannelPointConfig.websocketURL
	  me.websocket.onclose = (e) => {
    	me.rebuildWebsocket();	  		
	  };
	  me.websocket.onmessage = (e) => {
	    let data = JSON.parse(e.data);
	    let messageType = data.metadata.message_type;

	    if (messageType === "session_welcome") {
	      if (data.payload.session.status === "connected") {
	        console.log(`Connected to ${me.websocketName} websocket successfully!`);
	        
	        if (me.disconnectingWebsocket != null) {
	          me.disconnectingWebsocket.close();
	        }

	        me.websocketSessionID = data.payload.session.id;
	        for (let subscriptionName in me.websocketEventSubscriptions) {
	        	let subscriptionConfig = me.websocketEventSubscriptions[subscriptionName];
	        	me.createSubscription(subscriptionName, subscriptionConfig.version, subscriptionConfig.condition);
	        }

	      } else {
	        console.error(`${me.websocketName} websocket failure: ${data}`);
	      }
	    } else if (messageType === "session_reconnect") {
	      me.disconnectingWebsocket = me.websocket;
	      me.disconnectingWebsocket.onclose = (e) => {
	      	console.debug('cleaning up disconnecting websocket!');
	      	me.disconnectingWebsocket = null;
	      }
	      let newUrl = data.payload.session.reconnect_url;
	      if (!newUrl.includes("keepalive_timeout_seconds")) {
	      	let connectorSymbol = newUrl.includes("?") ? "&" : "?";
	      	newUrl = `${newUrl}${connectorSymbol}keepalive_timeout_seconds=${me.websocketKeepaliveTimeout}`;
	      }
	      me.rebuildWebsocket(newUrl);
	    } else if (messageType === "session_keepalive") {
	      me.lastKeepalive = new Date(data.metadata.message_timestamp);
	      // TODO: add keepalive checker
	    } else if (messageType === "notification") {
	    	me.owner.onNotificationFunc(data);
		  }
		}
	  me.websocket.onopen = (e) => {
	  	me.owner.onOpenFunc(e);
	  }
	  me.cleanupSubscriptions();
  }

  async createSubscription(eventName, version, condition) {
    let me = this;
    return this.twitchUtils.doTwitchAPIRequest(
      // me.auth, // secrets.twitch.channelPoints,
      async (twitchAuthToken) => {
        let body = JSON.stringify({
          'type': eventName,
          'version': version,
          'condition': condition,
          'transport': {
            'method': 'websocket',
            'session_id': me.websocketSessionID
          }
        });
        let resp = await fetch(`https://api.twitch.tv/helix/eventsub/subscriptions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${twitchAuthToken}`,
            'Client-Id': me.auth.clientID // secrets.twitch.channelPoints.clientID,
          },
          body: body
        });

        let output = await resp.json();
        return output;
      }
    );
  }

  async deleteSubscription(subscriptionID) {
  	let me = this;
	  return me.twitchUtils.doTwitchAPIRequest(
	    // me.auth, // secrets.twitch.channelPoints,
	    async (twitchAuthToken) => {
	      let resp = await fetch(`https://api.twitch.tv/helix/eventsub/subscriptions?id=${subscriptionID}`, {
	        method: 'DELETE',
	        headers: {
	          'Content-Type': 'application/json',
	          'Authorization': `Bearer ${twitchAuthToken}`,
	          'Client-Id': me.auth.clientID, // secrets.twitch.channelPoints.clientID,
	        }
	      });

	      if (!resp.ok) {
	        console.error(`Failed to delete subscription ${subscriptionID}: ${JSON.stringify(resp)}`);
	      }

	      return resp;
	    }
	  );
	}

  async getWebsocketSubscriptions() {
    let me = this;

    return this.twitchUtils.doTwitchAPIRequest(
      // me.auth, // secrets.twitch.channelPoints,
      async (twitchAuthToken) => {
        let nextPage = 'start';
        let subscriptions = [];

        while (nextPage != null) {

          let resp = await fetch(`https://api.twitch.tv/helix/eventsub/subscriptions`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${twitchAuthToken}`,
              'Client-Id': me.auth.clientID, // secrets.twitch.channelPoints.clientID,
            }
          });

          let output = await resp.json();
          subscriptions = subscriptions.concat(output.data);
          nextPage = output.pagination.cursor;
        }

        return subscriptions;
      }
    )
  }

  async cleanupSubscriptions() {
  	let me = this;
    me.getWebsocketSubscriptions().then((subscriptions) => {
    	// console.debug(`getWebsocketSubscriptions output: ${JSON.stringify(subscriptions)}`);
      for (let i in subscriptions) {
        let sub = subscriptions[i];
        if (sub.status != 'enabled') {
          // console.debug(`deleting subscription ${sub.id}`);
          me.deleteSubscription(sub.id);
        }
      }
    });
  }
}