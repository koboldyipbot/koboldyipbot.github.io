# yipbot
A twitch bot for yipping kobolds.

To use, load yip.html into your browser, ie. by clicking and dragging the file in.

Can be used to interactively yip without configuring the Twitch integration.  Just click on the screen!

## Licensing ##
You may use this code however you see fit as long as you attribute creation to Ames (@KoboldUnderlord on Twitter)

Do not repackage this and sell it, I mainly wish it just to be used for fun by people who download it

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
