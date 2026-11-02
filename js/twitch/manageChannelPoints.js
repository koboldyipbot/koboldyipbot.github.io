import {getTwitchUtils} from 'twitchUtils';

// default values for managed channel point rewards
export const MANAGED_CHANNEL_POINT_REWARDS = {
  tf_machine: [
    {
      title: "Customize Catgirl",
      cost: 1,
      prompt: "Enter the code from the Picrew!",
      is_enabled: true,
      background_color: "#FF00B5"
    },
    {
      title: "Drop Catgirl",
      cost: 100000,
      is_enabled: false,
      background_color: "#FF00B5"
    }
  ]
};

// 1. Load channel points from server
// 2. Capture all that match managed IDs & display in #managedChannelPoints
// 3. Display all that don't match in #existingChannelPoints

async function createCustomReward(broadcaster_id, ) {
  let me = this;

  return me.doTwitchAPIRequest(
    async (twitchAuthToken) => {
      let rewardParams = new URLSearchParams();
      rewardParams.append('broadcaster_id', broadcaster_id);
      
      let resp = await fetch(`https://api.twitch.tv/helix/channel_points/custom_rewards?${rewardParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${twitchAuthToken}`,
          'Client-Id': me.auth.clientID,
        } 
      });

      let output = await resp.json();
      // console.log(`getTwitchUsers output: ${JSON.stringify(output)}`);
      return output;
    }
  );
}