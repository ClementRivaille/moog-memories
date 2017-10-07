import Metronom from './metronom';
import EventEmitter from './event-emitter';
import Conductor from './conductor';
import Orchestra from './orchestra';
import UIConsole from './ui-console';
import jQuery from 'jquery';
window.$ = jQuery;
require('what-input');

if (!(window.AudioContext || window.webkitAudioContext)) {
  failMessage();
  throw new Error('not compatible');
}

// List of all the sounds to load, and their properties
let sounds = [
  {
    name: 'intro',
    url: './assets/intro.ogg',
    type: 'transition',
  },
  {
    name: 'intro-noise',
    url: './assets/intro-noise.ogg',
    type: 'globalLoop',
    nbBeats: 8
  },
  {
    name: 'beginning-chord',
    url: './assets/beginning-chords.ogg',
    type: 'globalLoop',
    nbBeats: 16
  },
  {
    name: 'beg-bass',
    url: './assets/beg-bass.ogg',
    type: 'relativeLoop',
    nbBeats: 8
  },
  {
    name: 'beg-sun',
    url: './assets/beg-sun.ogg',
    type: 'relativeLoop',
    nbBeats: 3
  },
  {
    name: 'beginning-space',
    url: './assets/beginning-space.ogg',
    type: 'globalLoop',
    nbBeats: 32
  },
  {
    name: 'beg-guitar',
    url: './assets/beg-guitar.ogg',
    type: 'globalLoop',
    nbBeats: 8,
    effects: {
      'filter': {
        type: 'lowpassFilter',
        min: 800,
        max: 2000,
        property: 'frequency',
        init: {
          frequency: 800,
          Q: 5,
        }
      }
    }
  },
  {
    name: 'beg-drums',
    url: './assets/beg-drums.ogg',
    type: 'globalLoop',
    nbBeats: 4
  },
  {
    name: 'beg-boing',
    url: './assets/beg-boing.ogg',
    type: 'sound',
    detune: true
  },
  {
    name: 'orbit-transition',
    url: './assets/orbit-transition.ogg',
    type: 'transition'
  },
  {
    name: 'orbit-bass',
    url: './assets/orbit-bass.ogg',
    type: 'globalLoop',
    nbBeats: 12
  },
  {
    name: 'orbit-major',
    url: './assets/orbit-major.ogg',
    type: 'globalLoop',
    nbBeats: 4
  },
  {
    name: 'orbit-minor',
    url: './assets/orbit-minor.ogg',
    type: 'globalLoop',
    nbBeats: 4
  },
  {
    name: 'orbit-solo',
    url: './assets/orbit-solo.ogg',
    type: 'relativeLoop',
    nbBeats: 40
  },
  {
    name: 'orbit-alien',
    url: './assets/orbit-alien.ogg',
    type: 'relativeLoop',
    nbBeats: 8
  },
  {
    name: 'orbit-noise',
    url: './assets/orbit-noise.ogg',
    type: 'relativeLoop',
    nbBeats: 8
  },
  {
    name: 'orbit-bells',
    url: './assets/orbit-bells.ogg',
    type: 'sound',
    detune: false
  },
  {
    name: 'orbit-echo',
    url: './assets/orbit-echo.ogg',
    type: 'relativeLoop',
    nbBeats: 16
  },
  {
    name: 'orbit-waves',
    url: './assets/orbit-waves.ogg',
    type: 'globalLoop',
    nbBeats: 16,
    effects: {
      'filter': {
        type: 'highpassFilter',
        min: 0,
        max: 1300,
        property: 'frequency',
        init: {
          frequency: 0,
          Q: 12,
        }
      }
    }
  },
  {
    name: 'end',
    url: './assets/end.ogg',
    type: 'transition'
  },
];

// Song structure and list of its sections
let sheet = {
  measureLength: 4,
  sections: [
    {
      globalLoops: [
        { name: 'beginning-chord', volume: 1},
        { name: 'intro-noise', volume: 1},
        { name: 'beginning-space', volume: 0},
        { name: 'beg-drums', volume: 0},
        { name: 'beg-guitar', volume: 0},
      ],
      relativeLoops: ['beg-bass', 'beg-sun'],
      transition: { name: 'intro', nbMeasures: 6},
      nbMeasures: 4,
      name: 'beginning'
    },
    {
      globalLoops: [
        {name: 'orbit-bass', volume: 1},
        {name: 'orbit-major', volume: 1},
        {name: 'orbit-minor', volume: 0},
        {name: 'orbit-waves', volume: 0}
      ],
      relativeLoops: ['orbit-solo', 'orbit-alien', 'orbit-noise', 'orbit-echo'],
      transition: { name: 'orbit-transition', nbMeasures: 3},
      nbMeasures: 1,
      name: 'orbit'
    },
    {
      end: true,
      transition: { name: 'end', nbMeasures: 8},
      name: 'end'
    }
  ]
};

try {
  // Create and connect components
  let context = new (window.AudioContext || window.webkitAudioContext)();
  let eventEmitter = new EventEmitter();
  let uiConsole = new UIConsole();

  let orchestra = new Orchestra(sounds, context)
  let metronom = new Metronom(115, context, eventEmitter);

  // Load the sounds
  orchestra.loadSounds(eventEmitter).then(() => {
    // Start metronom
    let startTime = context.currentTime + 0.1;
    metronom.start(startTime);

    // Remove loading from the screen, and show Begin button
    $('#navigation .start').removeClass('hidden');
    $('#navigation .start').attr('aria-hidden', 'false');
    $('#navigation .start button').removeAttr('disabled');
    $('#loading').addClass('hidden');
    $('#loading').attr('aria-hidden', 'true');

    // Create conductor
    window.conductor = new Conductor(sheet, orchestra, metronom, eventEmitter, uiConsole);
  }).catch(() => {
    failMessage();
  });
}
catch (error) {
  failMessage();  
}

/**
* If browser is not compatible with Web Audio API, show an error message
*/
function failMessage() {
  $(document).ready(() => {
    $('#loading').addClass('disabled');
    $('#loading').attr('aria-hidden', 'true');
    $('#error').removeClass('disabled');
    $('#error').attr('aria-hidden', 'false');
  });
}
