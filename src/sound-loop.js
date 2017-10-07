/**
* Sound loop that stays in sync with the beats
*/
class SoundLoop {
  constructor(context, buffer, gain, eventEmitter, nbBeats) {
    this.context = context;
    this.buffer = buffer;
    this.gain = gain;
    this.eventEmitter = eventEmitter;
    this.nbBeats = nbBeats;

    this.beatSchedule = this.beatSchedule.bind(this);
  }

  /** Play the sound from the beginning */
  playSound(startTime) {
    if (this.source && this.source.playing) {
      this.source.stop(startTime);
    }
    this.source = this.context.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.connect(this.gain);
    this.source.start(startTime);
  }

  /** Start the loop */
  start(startTime) {
    this.nextMeasure = this.nbBeats;
    this.startTime = startTime;
    this.playSound(startTime);
    this.playing = true;
    // Subscribe to beat events
    this.subId = this.eventEmitter.subscribe('beat', this.beatSchedule);
  }

  beatSchedule(nextBeat) {
    // Decrease beats remaining, unless we're at the very first beat
    this.nextMeasure = nextBeat > this.startTime && Math.abs(nextBeat - this.startTime) > 0.0001 ? this.nextMeasure - 1 : this.nextMeasure;

    // Restart the loop
    if (this.nextMeasure <= 0 && this.playing) {
      this.playSound(nextBeat);
      this.nextMeasure = this.nbBeats;
    }

    // Stop the sound when asked to
    if (this.stopTime && (nextBeat >= this.stopTime || Math.abs(nextBeat - this.stopTime) <= 0.0001)) {
      this.source.stop(this.stopTime);
      this.playing = false;
      this.eventEmitter.unsubscribe('beat', this.subId);
      this.stopTime = 0;
    }
  }

  /** Schedule a stop */
  stop(stopTime) {
    this.stopTime = stopTime;
  }
}

export default SoundLoop;
