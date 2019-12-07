import BaseWidget from './BaseWidget.js';
import utils from '../utils.js';

import {
  select,
  settings
} from '../settings.js';

class DatePicker extends BaseWidget {
  constructor(wrapper) {
    super(wrapper, utils.dateToStr(new Date()));

    const thisWidget = this;

    thisWidget.dom.input = wrapper.querySelector(select.widgets.datePicker.input);
    console.log('thisWidget.dom.input', thisWidget.dom.input);

    thisWidget.initPlugin();

  }

  initPlugin() {
    const thisWidget = this;

    /* creating min and max property and converting them to string  */
    thisWidget.minDate = utils.dateToStr(new Date(thisWidget.value));
    thisWidget.maxDate = utils.dateToStr(utils.addDays(thisWidget.minDate, settings.datePicker.maxDaysInFuture));

    // eslint-disable-next-line no-undef
    flatpickr(thisWidget.dom.input, {
      defaultDate: thisWidget.minDate,
      minDate: thisWidget.minDate,
      maxDate: thisWidget.maxDate,
      'disable': [
        function (date) {
          // return true to disable
          return (date.getDay() === 1);
        }
      ],
      'locale': {
        'firstDayOfWeek': 1 // start week on Monday
      },
      onChange: function (dateStr) {
        thisWidget.value = dateStr;
      },
    });
    console.log('thisWidget.value', typeof (thisWidget.value));
  }

  parseValue(value) {
    return value;
  }

  isValid() {
    return true;
  }

  renderValue() {}

}

export default DatePicker;
