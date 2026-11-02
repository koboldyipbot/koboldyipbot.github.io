export class TFMachineQueue {
  constructor(configuredModule, twitchUtils, processNextUserFn, onEmptyCb, autoProcessNext = true, enabled = true) {
    this.twitchUtils = twitchUtils;
    this.configuredModule = configuredModule;
    this.processNextUserFn = processNextUserFn;
    this.onEmptyCb = onEmptyCb;
    this.autoProcessNext = autoProcessNext;
    this.queue = [];
    this.processingQueue = false;
    this._enabled = enabled;
  }

  set enabled(newEnabled) {
    let me = this;
    me._enabled = newEnabled;
    if (me.enabled && me.processingQueue) {
      console.log('yippee!! 3')
      me.processNext();
    }
  }

  get enabled() {
    return this._enabled;
  }

  get dequeueDelay() {
    return config[this.configuredModule].dequeueDelay;
  }

  enqueue(username) {
    let me = this;
    me.queue.unshift(username);
    if (!me.processingQueue && me.enabled) {
      me.startProcessingQueue();
    } 
  }

  startProcessingQueue() {
    let me = this;
    if (me.processingQueue || me.queue.length == 0) {
      return;
    }
    me.processingQueue = true;
    if (me.enabled) {
      if (me.dequeueDelay > 0) {
        setTimeout(me.processNext.bind(me), me.dequeueDelay);
      } else {
        me.processNext();
      }
    }
  }

  processNext() {
    let me = this;

    if (!me.processingQueue || !me.enabled) {
      // invalid state; just ignore for now
      return;
    } 

    if (me.queue.length == 0) {
      if (me.onEmptyCb) {
        me.onEmptyCb();
      }
      me.processingQueue = false;
    } else {
      let nextUser = me.queue.pop();

      me.processNextUserFn(nextUser).then(() => {
        if (me.autoProcessNext) {
          if (me.dequeueDelay > 0) {
            setTimeout(me.processNext.bind(me), me.dequeueDelay);
          } else {
            me.processNext();
          }
        }
      });
    }
  }
}