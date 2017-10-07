/**
* Count beats, and give the time of next beat occurence
*/
class Metronom {
  constructor(bpm, context, eventEmitter) {
    this.context = context;
    this.eventEmitter = eventEmitter;

    this.beatTime = 60 / bpm;
  }

  start(startTime) {
    this.startTime = startTime;
    this.nextBeat = this.beatTime;

    // Emit the first beat
    this.schedule();
    // Start the loop
    this.loopId = requestAnimationFrame(() => {
      this.clock();
    });

  }

  /** 
  * Loop checking time each frame
  * The metronom is always one beat ahead, and calculate the time of the upcoming beat
  */
  clock() {
    // Get current time (relative to start time)
    let currentTime = this.context.currentTime - this.startTime;
    // When next beat is reached, update its value
    if (currentTime >= this.nextBeat || Math.abs(currentTime - this.nextBeat) < 0.00001) {
      this.nextBeat += this.beatTime;
      this.schedule();
    }
    // Continue the loop
    this.loopId = requestAnimationFrame(() => {
      this.clock();
    });
  }

  /** Emit beat event, and give the global time of next beat */
  schedule() {
    this.eventEmitter.emit('beat', this.startTime + this.nextBeat);
  }

  /** Public method use to obtain global next beat time */
  getNextBeatTime() {
    this.fixBeat();
    return this.startTime + this.nextBeat;
  }

  /**
   * Public method use to obtain global nth next beat time
   * @param nbBeats {int} nth beat, 1 being the next
   */
  getNextNthBeatTime(nbBeats) {
    this.fixBeat();
    return this.startTime + this.nextBeat + (nbBeats - 1) * this.beatTime;
  }

  stop() {
    cancelAnimationFrame(this.loopId);
  }

  /**
  * If the getter methods are called just on a beat, check if the next beat value is still valid
  * This is to avoid giving a next beat value that is actually in the past
  */
  fixBeat() {
    let currentTime = this.context.currentTime - this.startTime;
    if (currentTime >= this.nextBeat || Math.abs(this.nextBeat - currentTime) < 0.00001) {
      this.nextBeat += this.beatTime;
      this.schedule();
    }
  }
}

export default Metronom;
