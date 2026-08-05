import {TwitchChat} from 'twitchChat';

export class TFMachineChat extends TwitchChat {
  constructor (tfMachineQueue) {
    super();
    this.tfMachineQueue = tfMachineQueue;
  }

  async handleChatMessage(event) {
    let me = this;
    let commandArr = event.message.text.split(/\s+/);
    let isMod = me.twitchUtils.isUserMod(event.chatter_user_login, event.broadcaster_user_id);

    let command = commandArr[0].trim();


    if (commandArr[0] === "!tfmachine" && isMod) {
      console.log(`DEBUG: commandArr: ${JSON.stringify(commandArr)}`);
      me.tfMachineQueue.enqueue(commandArr[1].trim());
    }
    
    if (event.cheer) {
      let bits = event.cheer.bits;
      // ...
    } else {
      // ...
    }
  }

  async handleChatNotification(event) {
  }
}