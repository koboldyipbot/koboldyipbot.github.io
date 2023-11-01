const config = {
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
    ]
};