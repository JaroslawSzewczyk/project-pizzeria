import {
  templates,
  select,
  settings,
  classNames,
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
    console.log('startDateParam', startDateParam);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

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

    // console.log('params',params)

    const urls = {
      booking: settings.db.url + '/' + settings.db.booking
                               + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event
                               + '?' + params.eventsCurrent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.event
                               + '?' + params.eventsRepeat.join('&'),
    };

    //console.log('urls', urls);

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
        //console.log('bo', bookings);
        // console.log(eventsCurrent);
        //console.log('ev',eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};

    //console.log('bookings', bookings);

    for (let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    console.log('thisBooking.datePicker.minDate', thisBooking.datePicker.minDate);
    const maxDate = thisBooking.datePicker.maxDate;

    for (let item of eventsRepeat) {
      if (item.repeat == 'daily') {
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }
    // console.log(eventsRepeat);

    console.log('thisBooking.booked', thisBooking.booked);

    thisBooking.updateDom();
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if (typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
      if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }
      thisBooking.booked[date][hourBlock].push(table);
    }

  }

  updateDom() {
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);
    console.log('thisBooking.hour', thisBooking.hour);

    let allAvailable = false;

    if (
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ) {
      allAvailable = true;
    }

    for (let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
        //console.log('tableId', tableId);
      }

      if (
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
      console.log('thisBooking.date', thisBooking.date);
      console.log('thisBooking.hour', thisBooking.hour);
      console.log('thisBooking.booked[thisBooking.date][thisBooking.hour]', thisBooking.booked[thisBooking.date][thisBooking.hour]);
    }
    //console.log('thisBooking.booked[thisBooking.date][thisBooking.hour]', thisBooking.booked[thisBooking.date][thisBooking.hour]);
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

    /* find tables element */
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function () {
      thisBooking.updateDom();
    });
  }
}

export default Booking;
