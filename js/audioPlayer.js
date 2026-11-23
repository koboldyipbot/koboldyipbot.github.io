/**
 *  Plays audio intended to be fired and forgotten about.
 */
export class AudioPlayer {
  // key = path, value = Decoded ArrayBuffer read via fetch
  static audioDataCache = {};

  constructor(path) {
    this.audioCtx = new AudioContext();
    this.path = path;
  }

  async loadAudio() {
    let cache = AudioPlayer.audioDataCache;
    if (!(this.path in cache)) {
      // cache data
      let audioResp = await fetch(this.path);
      let audioData = await audioResp.arrayBuffer();
      let decodedData = await this.audioCtx.decodeAudioData(audioData);

      cache[this.path] = decodedData;
    }

    return cache[this.path];
  }

  // https://dev.to/kaleem_ullah_6698699/building-a-real-time-pitch-shifter-with-the-web-audio-api-21k2
  async shiftPitch() {
    
  }

  async play(options = {}) {
    /**
     *  Valid options:
     *  - volume: 0-1 representing fraction of volume to use
     */
    let audioData = await this.loadAudio();

    // // duplicate array buffer & play
    // let data = cache[path];
    // var bufferCopy = new ArrayBuffer(data.byteLength);
    // new Uint8Array(bufferCopy).set(new Uint8Array(data));

    // let buffer = await this.audioCtx.decodeAudioData(bufferCopy);
    let source = this.audioCtx.createBufferSource();

    if (options.volume) {
      let gainNode = this.audioCtx.createGain();
      gainNode.gain.value = options.volume;
      source.connect(gainNode);
      gainNode.connect(this.audioCtx.destination);
    } else {
      source.connect(this.audioCtx.destination);
    }

    source.buffer = audioData;
    source.start();
  }
}

window.AudioPlayer = AudioPlayer;