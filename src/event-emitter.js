/**
* Utilitary to emit event and subscribe to them
*/
class EventEmitter {
  constructor() {
    this.listeners = {};
  }

  subscribe(event, callback) {
    let subId = Math.round(Math.random() * 100000);
    this.listeners[event] = this.listeners[event] || [];
    this.listeners[event].push({
      id: subId,
      callback: callback
    });

    return subId;
  }

  unsubscribe(event, subId) {
    if (this.listeners[event]) {
      let index = this.listeners[event].findIndex((listener) => {
        return subId === listener.id;
      });
      if (index > -1) {
        this.listeners[event].splice(index, 1);
      }
    }
  }

  emit(event, ...args) {
    if (this.listeners[event]) {
      for (let listener of this.listeners[event]) {
        new Promise((resolve, reject) => {
          try {
            listener.callback(...args);
            resolve();
          }
          catch (e) {
            reject(e);
          }
        });
      }
    }
  }
}

export default EventEmitter;
