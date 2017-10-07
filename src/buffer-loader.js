class BufferLoader {
  /**
  * context {object} Audio context
  * soundsUrls {array} List of objects contening name and urls of sounds
  */
  constructor(context, soundsUrls) {
    this.context = context;
    this.soundsUrls = soundsUrls;
    this.buffers = {};

    if (typeof window.Itch !== 'undefined') {
      this.itchKey = window.Itch.env.ITCHIO_API_KEY;
    }
  }

  /**
  * Load a sound from url
  */
  load(name, url) {
    // Prepare request
    let request = new XMLHttpRequest();
    request.open('get', url, true);
    request.responseType = 'arraybuffer';
    if (this.itchKey) {
      request.setRequestHeader('Authorization', this.itchKey);
    }

    // Send
    request.send();

    // return promise once request is complete
    return new Promise((resolve, reject) => {
      request.onload = () => {
        // Decode buffer and add it to list
        this.context.decodeAudioData(request.response, (buffer) => {
          this.buffers[name] = buffer;
          resolve();
        });
      };
      request.onerror = reject;
    });

  }

  /**
  * Load all sounds
  */
  loadAll() {
    let promises = [];
    for (let soundUrl of this.soundsUrls) {
      promises.push(this.load(soundUrl.name, soundUrl.url));
    }

    // Return buffers in an object
    return Promise.all(promises).then(() => this.buffers);
  }
}

export default BufferLoader;
