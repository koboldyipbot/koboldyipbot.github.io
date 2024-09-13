const config = {
    cacheLastChatsTimeout: 30, // seconds
    defaultYipSongNoteLength: 400,
    secondsPerYip: 15,
    minimumYipGapMilliseconds: 1,
    // image1: "images/yip_plug1.png",
    // image2: "images/yip_plug2.png",
    image1: "images/yip1.png",
    image2: "images/yip2.png",
    twitchUsername: "yip_bot",
    twitchOAuthPassword: secrets.twitchOAuthPassword, // Official OAuth token generator: https://twitchapps.com/tmi/
    twitchChannelPoints: secrets.twitchChannelPoints,
    twitchChannels: [
        "kobold_wyx"
    ],
    yipOffsetLeft: 80,
    yipOffsetTop: 0,
    mods: [
        "KoboldUnderlord",
        "kobold_wyx",
        "yip_bot"
    ],
    rpg: {
        fightCooldown: 1 * 60, // seconds
        maxXPPerLevel: 100000,
        scavengeCooldown: 5 * 60,  // seconds
        trapExpiration: 30 // seconds
    },
    websocketConfig: {
        pingTimeout: 2 * 60 * 1000 // 2 minutes
    },
    enabledModules: {
        warframe: {
            relics: true
        },
    },
    twitchAuthScopes: [
      "channel:read:redemptions",
      "bits:read",
      "user:read:email"
    ]
};