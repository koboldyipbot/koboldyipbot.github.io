import {TwitchWebsocketHelper} from 'twitchWebsocket';
import {getTwitchUtils} from 'twitchUtils';

const subNoticeTypes = new Set(['sub', 'resub']);

export class TwitchChat {
  constructor (auth = null) {
    let chosenAuth = auth || secrets.twitch.chatBot;  // certain Twitch APIs may override this as they MUST use the streamer's OAuth
    let websocketConfig = {
      name: "TwitchChat",
      websocketURL: config.websocketConfig.defaultWebsocketURL,
      keepalive_timeout_seconds: 600,
      websocketEventSubscriptions: {
        // TODO: fix config to indicate broadercaster channel vs authenticated user channel
        "channel.chat.message": {version: "1", condition: {broadcaster_user_id: secrets.twitch.streamer.channelID, user_id: chosenAuth.channelID}},
        "channel.chat.notification": {version: "1", condition: {broadcaster_user_id: secrets.twitch.streamer.channelID, user_id: chosenAuth.channelID}}
      }
    };

    this.auth = chosenAuth;
    this.websocketHelper = new TwitchWebsocketHelper(chosenAuth, websocketConfig, this);
    this.twitchUtils = getTwitchUtils(chosenAuth);
  }

  async connect() {
    return await this.websocketHelper.rebuildWebsocket();
  }

  async sendMessage(msg) {
    let me = this;
    return me.twitchUtils.doTwitchAPIRequest(
      async (twitchAuthToken) => {
        let body = {
          broadcaster_id: await me.twitchUtils.getTwitchUserID(config.twitchStreamer),
          sender_id: await me.twitchUtils.getTwitchUserID(me.auth.username),
          message: msg
        };
        let resp = await fetch(`https://api.twitch.tv/helix/chat/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${twitchAuthToken}`,
            'Client-Id': me.auth.clientID,
          },
          body: JSON.stringify(body)
        });

        if (!resp.ok) {
          console.error(`Failed to send message: ${JSON.stringify(resp)}`);
        }

        return resp;
      }
    );
  }

  isMod(username) {

  }

  async onOpenFunc(e) {
    console.log('Chat connected!');
    // this.sendMessage("main screen turn on");
  }

  async onNotificationFunc(data) {
    let me = this;
    let subscriptionType = data.metadata.subscription_type;
    let event = data.payload.event;
    if (subscriptionType === "channel.chat.message") {
      // https://dev.twitch.tv/docs/eventsub/eventsub-reference/#channel-chat-message-event
      // console.log(`${event.chatter_user_name}: ${event.message.text}`);
      me.handleChatMessage(event);
    } else if (subscriptionType === "channel.chat.notification") {
      me.handleChatNotification(event);
    }
  }

  async handleChatMessage(event) {
    /* event.message_type list: 
        - channel_points_highlighted
        - channel_points_sub_only
        - user_intro
        - power_ups_message_effect
        - power_ups_gigantified_emote
    */
    if (event.cheer) {
      let bits = event.cheer.bits;
      // ...
    } else {
      // ...
    }
  }

  async handleChatNotification(event) {
    // https://dev.twitch.tv/docs/eventsub/eventsub-reference/#channel-chat-notification-event
    // console.debug(`Chat Notification notice_type: ${event.notice_type}`);
    /* event.notice_type list:
        - sub
        - resub
        - sub_gift
        - community_sub_gift
        - gift_paid_upgrade
        - prime_paid_upgrade
        - raid
        - unraid
        - pay_it_forward
        - announcement
        - bits_badge_tier
        - charity_donation
        - shared_chat_* of any of the previous
    */
  }
}