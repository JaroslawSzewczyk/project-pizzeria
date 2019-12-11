import {
  templates,
  select,
  settings,
} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(widgetOrderSite) {
    const thisBooking = this;

    thisBooking.render(widgetOrderSite);
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  getData() {
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + thisBooking.datePicker.minDate;
    const endDateParam = settings.db.dateEndParamKey + '=' + thisBooking.datePicker.maxDate;

    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    const urls = {
      booking: settings.db.url + '/' + settings.db.booking
                               + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event
                               + '?' + params.eventsCurrent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.event
                               + '?' + params.eventsRepeat.join('&'),
    };

    console.log('urls', urls);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function (allResponses) {
        const bookingsResponse = allResponses[0];
        const eventCurrentResponse = allResponses[1];
        const eventRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventCurrentResponse.json(),
          eventRepeatResponse .json()
        ]);
      })
      .then(function ([bookings, eventsCurrent, eventsRepeat]) {
        console.log(bookings);
        console.log(eventsCurrent);
        console.log(eventsRepeat);
      });
  }

  render(widgetOrderSite) {
    const thisBooking = this;

    /* generate HTML based on templates */
    const generatedHTML = templates.bookingWidget();
    //console.log('generatedHTML', generatedHTML);

    /* creating empty dom object*/
    thisBooking.dom = {};

    /* add wrapper property to dom object */
    thisBooking.dom.wrapper = widgetOrderSite;
    //console.log('thisBooking.dom.wrapper', thisBooking.dom.wrapper);

    /* create element using utils.createElementFromHTML */
    thisBooking.element = utils.createDOMFromHTML(generatedHTML);
    //console.log('thisBooking.element', thisBooking.element);

    /* add thisBooking.element to thisBooking.dom.wrapper */
    thisBooking.dom.wrapper.appendChild(thisBooking.element);


    /* find peopleAmount element */
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    // console.log('thisBooking.dom.peopleAmount', thisBooking.dom.peopleAmount);

    /* find hoursAmount element */
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    //console.log('thisBooking.dom.hoursAmount', thisBooking.dom.hoursAmount);

    /* find date-picker element */
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    //console.log('thisBooking.dom.datePicker', thisBooking.dom.datePicker);

    /* find hour-picker element */
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

  }
}

export default Booking;
