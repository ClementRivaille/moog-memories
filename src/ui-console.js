/**
* Hide and show messages and control panels
*/
class UIConsole {
  // Display a section
  showSection(name) {
    // Display controls
    $(`#navigation .${name}`).removeClass('hidden');
    $(`#navigation .${name}`).attr('aria-hidden', 'false');
    $(`#controls .${name}`).removeClass('hidden');
    $(`#controls .${name}`).attr('aria-hidden', 'false');
    // Enable buttons
    this.enableButtons('navigation', name, true);
    this.enableButtons('controls', name, true);

    // Change color
    $('#app').addClass(name);
    if (this.currentSection) {
      $('#app').removeClass(this.currentSection);
    }

    this.currentSection = name;
    this.animations = {};
  }

  // Remove a section
  hideSection(name) {
    // Hide controls
    $(`#navigation .${name}`).addClass('hidden');
    $(`#navigation .${name}`).attr('aria-hidden', 'true');
    $(`#controls .${name}`).addClass('hidden');
    $(`#controls .${name}`).attr('aria-hidden', 'true');
    // Disable buttons
    this.enableButtons('navigation', name, false);
    this.enableButtons('controls', name, false);
    // Wait before removing completely the section
    setTimeout(() => {
      $(`#navigation .${name}`).addClass('disabled');
      $(`#controls .${name}`).addClass('disabled');
    }, 1500)
  }

  // Put a section elements into the page, still hidden
  prepareSection(name) {
    $(`#navigation .${name}`).removeClass('disabled');
    $(`#controls .${name}`).removeClass('disabled');
  }

  showEnd() {
    $('#end').removeClass('hidden');
    $('#end').attr('aria-hidden', 'false');
  }

  // Enable or disable a group of buttons
  enableButtons(group, name, value) {
    let buttons = $(`#${group} .${name} button`);
    for (let button of buttons) {
      if (value) {
        button.removeAttribute('disabled');
      }
      else {
        button.setAttribute('disabled', 'true');
      }
    }
  }

  // Toggle a button
  switchButton(instrument, value) {
    let controlElement = $(`.sound-control.${instrument}`);
    // Activate or desactivate switch
    if (!controlElement.hasClass('trigger')) {
      if (value) {
        controlElement.addClass('active');
      }
      else {
        controlElement.removeClass('active');
      }
      controlElement.children('button').attr('aria-pressed', value);
    }
    // If trigger, play an animation
    else {
      // Use it to know if an animation is stil going on
      this.animations[instrument] = this.animations[instrument] || 0;
      // Remove then add class to trigger animation
      controlElement.removeClass('active');
      setTimeout(() => {
        controlElement.addClass('active');
        this.animations[instrument]++;
      }, 10);

      setTimeout(() => {
        // Remove active class when all animations are done
        this.animations[instrument]--;
        if (this.animations[instrument] <= 0) {
          controlElement.removeClass('active');
        }
      }, 500);
    }
  }
}

export default UIConsole;
