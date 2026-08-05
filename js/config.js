const config = {
    cacheLastChatsTimeout: 30, // seconds
    defaultYipSongNoteLength: 400,
    secondsPerYip: 15,
    minimumYipGapMilliseconds: 1,
    // image1: "images/yip_plug1.png",
    // image2: "images/yip_plug2.png",
    image1: "images/yip1.png",
    image2: "images/yip2.png",
    // twitchUsername: "kobold_wyx",
    // twitchOAuthPassword: secrets.twitchOAuthPassword, // Official OAuth token generator: https://twitchapps.com/tmi/
    // twitchChannelPoints: secrets.twitchChannelPoints,
    // twitchChannelPointConfig: {
        // websocketURL: "wss://eventsub.wss.twitch.tv/ws",
        // keepalive_timeout_seconds: 600
    // },
    twitchStreamer: "kobold_wyx",
    yipOffsetLeft: 80,
    yipOffsetTop: 0,
    // mods: [
    //     "kobold_wyx", "yip_bot"
    // ],
    rpg: {
        fightCooldown: 1 * 60, // seconds
        maxXPPerLevel: 100000,
        scavengeCooldown: 5 * 60,  // seconds
        trapExpiration: 30 // seconds
    },
    websocketConfig: {
        defaultWebsocketURL: "wss://eventsub.wss.twitch.tv/ws",
        pingTimeout: 2 * 60 * 1000 // 2 minutes
    },
    enabledModules: {
        warframe: {
            relics: true
        },
    },
    twitchAuthScopes: [
      "bits:read",
      "moderation:read",
      "moderator:read:chatters",
      "moderator:read:followers",
      "moderator:read:moderators",
      "user:read:chat",
      "user:read:email",
      "user:write:chat",
      "channel:bot",
      "user:bot",
      "channel:read:redemptions",
      "channel:read:subscriptions"
    ]
};