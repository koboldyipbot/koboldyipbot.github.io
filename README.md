# yipbot
A twitch bot for yipping kobolds.

To use, load yip.html into your browser, ie. by clicking and dragging the file in.

Can be used to interactively yip without configuring the Twitch integration.  Just click on the screen!

Chatbot command help can be found on https://wyx.gay/yipbot

## Licensing ##
As an individual Twitch streamer:

- You may edit and use this code however you see fit as long as you attribute creation to Kobold Interactive ([@KoboldInteractive on Cohost](https://koboldinteractive.cohost.org))

As a commercial entity:

- We need a licensing contract before anything is OK, as this is intended as a tool for small-scale streamers or developers
- You may not repackage or sell this or make money off the use or modification of this code without a contract

If you are operating at a scale beyond a single streamer or are a streamer making 6 digits, you should consider yourself a commercial entity for the purposes of this license.

## Lazy setup ##

1. download: https://github.com/koboldyipbot/koboldyipbot.github.io/archive/refs/heads/main.zip
2. extract locally
3. in the `images` folder, replace `yip1.png` and `yip2.png` with your kobold
4. go to here: https://twitchapps.com/tmi/ and get an oauth token
5. open `js/config.js` and edit the appropriate spots

the things you want to edit in config would be to put that token into `twitchOAuthPassword`, replace my channel with yours in `twitchChannels`,  and then put the twitch username of you and anyone else you want with mod permissions under `mods`

once you do that, open `index.html` in a browser and fool around with the `yipOffsetLeft` and `yipOffsetTop` until the yips are coming out at the right spot for where your kobold's mouth is and you're done with code!

I use OBS' Browser source to point at the local file for index.html, with width 2000 and height 1200.

I also use some simple custom CSS to hide the background:

```
body { background-color: rgba(0, 0, 0, 0); margin: 0px auto; overflow: hidden; color: black; }
```
