import BaseWidget from './BaseWidget.js';
import {
  settings,
  select,
} from '../settings.js';
import utils from '../utils.js';

class HourPicker extends BaseWidget {
  constructor(wrapper) {
    super(wrapper, settings.hours.open);

    const thisWidget = this;

    thisWidget.dom.input = wrapper.querySelector(select.widgets.hourPicker.input);
    thisWidget.dom.output = wrapper.querySelector(select.widgets.hourPicker.output);

  }

  parseValue(value) {
    return utils.numberToHour(value);
  }

}

export default HourPicker;
