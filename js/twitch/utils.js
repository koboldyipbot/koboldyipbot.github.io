class TwitchUtils {
  /*
    Use login name for distinguishing users
  */
  constructor(auth) {
    this.auth = auth;
    this.twitchAuthToken = null;
    this.userIDCache = {};
    this.moderatorCache = {
      timestamp: null, users: new Set()
    };
  }

  async getTwitchAuthToken(authAttempts = 0) {
    let me = this;
    if (me.twitchAuthToken != null && authAttempts == 0) {
      return me.twitchAuthToken;
    }

    // function for authenticating
    // actually used by other code & not for setup
    let resp = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: wwwEncode({
        client_id: encodeURIComponent(me.auth.clientID),
        client_secret: encodeURIComponent(me.auth.clientSecret),
        grant_type: "refresh_token",
        refresh_token: encodeURIComponent(me.auth.refreshToken)
      })
    });
    let output = await resp.json();
    me.twitchAuthToken = output.access_token;
    return me.twitchAuthToken;
  }

  /**
   *  Accepts a function that performs the entirety of the API invocation.
   *  Function accepts the access token, and should return the raw `fetch` response.
   *  Handles the 401 Unauthorized loop in case token is expired.
   */
  async doTwitchAPIRequest(async_fn) {
    let me = this;

    if (me.twitchAuthToken == null) {
      await me.getTwitchAuthToken();
    }
    let resp = await async_fn(me.twitchAuthToken);
    if (resp.status == 401) {
      await me.getTwitchAuthToken();
      resp = await async_fn(me.twitchAuthToken);
    }

    return resp;
  }

  async getTwitchUsers(users) {
    // maps login name to user id
    let me = this;

    return me.doTwitchAPIRequest(
      async (twitchAuthToken) => {
        let userParams = new URLSearchParams();
        for (let i in users) {
          userParams.append('login', users[i]);
        }
        let resp = await fetch(`https://api.twitch.tv/helix/users?${userParams.toString()}`, {
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

  async getTwitchProfilePictureURL(user) {
    let me = this;

    let userData = await me.getTwitchUsers([user]);
    // console.log(user);
    // console.log(userData);
    return userData.data[0].profile_image_url;
  }

  async getTwitchUserID(user) {
    let me = this;

    if (me.userIDCache[user] == null) {
      let users = await me.getTwitchUsers([user]);
      me.userIDCache[user] = users.data[0].id;
    }

    return me.userIDCache[user];
  }

  async isUserMod(user) {
    /*
      Requires that the OAuth token belongs to the streamer.
      See: https://dev.twitch.tv/docs/api/reference/#get-moderators
    */
    let me = this;

    if (user === secrets.twitch.streamer.username) {
      return true;
    }

    if (me.auth.channelID != secrets.twitch.streamer.channelID) {
      return await getTwitchUtils(secrets.twitch.streamer).isUserMod(user);
    } else {
      let now = new Date();
      if (me.moderatorCache.timestamp == null || now - me.moderatorCache.timestamp >= 3 * 60 * 1000) { // 3 minute cache
        // to prevent active moderator disruption & multiple call spam, immediately update timestamp
        me.moderatorCache.timestamp = now;

        await me.doTwitchAPIRequest(
          async (twitchAuthToken) => {
            let params = new URLSearchParams();
            params.append('broadcaster_id', me.auth.channelID);
            params.append('first', '100'); // page size - max is 100 - TODO: implement pagination, but why have more than 100 mods?
            
            let resp = await fetch(`https://api.twitch.tv/helix/moderation/moderators?${params.toString()}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Bearer ${twitchAuthToken}`,
                'Client-Id': me.auth.clientID,
              } 
            });

            let output = await resp.json();
            let replacementModUsers = new Set();
            for (let i in output.data) {
              replacementModUsers.add(output.data[i].user_login);
            }
            me.moderatorCache.users = replacementModUsers;
            return output;
          }
        );
      }

      return me.moderatorCache.users.has(user);
    }
  }

  async isValidUser(user) {
    let me = this;

    let userData = await me.getTwitchUsers([user]);
    return userData.data.length > 0;
  }
}

let utilsCache = {};

export function getTwitchUtils(auth) {
  if (auth.clientID in utilsCache) {
    return utilsCache[auth.clientID];
  } else {
    let utils = new TwitchUtils(auth);
    utilsCache[auth.clientID] = utils;
    return utils;
  }
}