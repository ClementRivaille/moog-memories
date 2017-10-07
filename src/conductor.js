/**
* Conduct the song structure and activate instruments
*/
class Conductor {
  constructor(sheet, orchestra, metronom, eventEmitter, uiConsole) {
    this.sheet = sheet;
    this.orchestra = orchestra;
    this.metronom = metronom;
    this.eventEmitter = eventEmitter;

    // Schedule is an object use to trigger events on beats or measure
    this.schedule = {
      beat: [],
      measure: []
    };
    this.onBeat = this.onBeat.bind(this);

    this.uiConsole = uiConsole;
    this.showSectionSchedule = 0;
  }

  /**
  * Start the song from the first measure
  */
  start() {
    // Next section is in 1 beat
    this.nextMeasure = 1;
    this.sectionEnd = 1;
    // Subscribe to beats
    this.subId = this.eventEmitter.subscribe('beat', this.onBeat);

    this.changeSection(0);
  }

  /**
  * Method triggered each beat
  * Launch next section if required
  */
  onBeat() {
    // Decrease beat remaining before next measure
    this.nextMeasure--;
    // If next measure is reached
    if (this.nextMeasure <= 0) {
      // Decrease measures remaining before end of section
      this.sectionEnd--;
      // If end of section, reinit measures left
      if (this.sectionEnd <= 0) {
        this.sectionEnd = this.currentSection.nbMeasures;
      }
      // Reinit measures left before next measure
      this.nextMeasure = this.sheet.measureLength;

      // Scheduled events

      // Showing next section
      if (this.showSectionSchedule > 0) {
        // Decrease value of 1 measure
        this.showSectionSchedule--;
        if (this.showSectionSchedule == 0) {
          // When 0 is reached, show the next section
          this.uiConsole.showSection(this.currentSection.name);
        }
      }
      // Showing end
      if (this.endSchedule > 0) {
        // Decrease 1 measure
        this.endSchedule--;
        if (this.showSectionSchedule == 0) {
          // Show end and stop when 0 is reached
          this.uiConsole.showEnd();
          this.stop();
        }
      }
    }
  }

  /** Trigger an instrument */
  trigger(instrument) {
    // Call to an orchestra class
    let activeSound = this.orchestra.triggerSound(instrument, this.metronom.getNextBeatTime());

    // Change button state
    this.uiConsole.switchButton(instrument, activeSound);
  }

  /** Modify an effect value */
  setEffect(instrument, effect, value) {
    this.orchestra.setEffect(instrument, effect, value, this.metronom.getNextBeatTime());
  }

  /**
  * Go to another section
  * @param index {int} index in the sheet's section array
  */
  changeSection(index) {
    let section = this.sheet.sections[index];
    // How many measures before the end of section (-1 is for current measure)
    let measuresLeft = Math.max(0, (this.sectionEnd - 1));

    // Schedule when this section will end, and when the other will start (counting intro)
    let sectionEndTime = this.metronom.getNextNthBeatTime(this.nextMeasure + measuresLeft * this.sheet.measureLength);
    let sectionStartTime = this.metronom.getNextNthBeatTime(this.nextMeasure + measuresLeft * this.sheet.measureLength + this.sheet.measureLength * section.transition.nbMeasures);

    // Schedule transition
    this.orchestra.triggerSound(section.transition.name, sectionEndTime);
    if (!section.end) {
      // Schedule globalLoops activation
      for (let instrument of section.globalLoops) {
        // Offset is the number of beats before it actually start
        // let offset = Math.max(0, this.nextMeasure + (measuresLeft + section.transition.nbMeasures) * this.sheet.measureLength - 1);
        this.orchestra.activateLoop(instrument.name, instrument.volume, sectionStartTime);
      }
    }

    // Deactivate current loops
    if (this.currentSection) {
      for (let instrument of this.currentSection.globalLoops) {
        this.orchestra.deactivateLoop(instrument.name, sectionEndTime);
      }
      for (let instrumentName of this.currentSection.relativeLoops) {
        this.orchestra.deactivateLoop(instrumentName, sectionEndTime);
      }
    }

    // Hide section controls
    this.uiConsole.hideSection(this.currentSection ? this.currentSection.name : 'start');
    this.showSectionSchedule = measuresLeft + section.transition.nbMeasures + 1;
    
    // Wait fading before perparing next section
    setTimeout(() => {
      this.uiConsole.prepareSection(section.name);
    }, 1500);

    if (section.end) {
      this.endSchedule = this.showSectionSchedule;
    }

    this.currentSection = section;
    // Next section end is current section end + transition + next section end
    this.sectionEnd = measuresLeft + this.currentSection.transition.nbMeasures + this.currentSection.nbMeasures + 1;
  }

  stop() {
    this.eventEmitter.unsubscribe('beat', this.subId);
  }
}

export default Conductor;
