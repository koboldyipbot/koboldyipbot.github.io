export class TFMachineQueue {
  constructor(configuredModule, twitchUtils, processNextUserFn, onEmptyCb, autoProcessNext = true) {
    this.twitchUtils = twitchUtils;
    this.configuredModule = configuredModule;
    this.processNextUserFn = processNextUserFn;
    this.onEmptyCb = onEmptyCb;
    this.autoProcessNext = autoProcessNext;
    this.queue = [];
    this.processingQueue = false;
  }

  get dequeueDelay() {
    return config[this.configuredModule].dequeueDelay;
  }

  enqueue(username) {
    let me = this;
    me.queue.unshift(username);
    if (!me.processingQueue) {
      me.startProcessingQueue();
    } 
  }

  startProcessingQueue() {
    let me = this;
    if (me.processingQueue || me.queue.length == 0) {
      return;
    }
    me.processingQueue = true;
    if (me.dequeueDelay > 0) {
      setTimeout(me.processNext.bind(me), me.dequeueDelay);
    } else {
      me.processNext();
    }
  }

  processNext() {
    let me = this;

    if (!me.processingQueue) {
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