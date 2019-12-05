import {
  templates,
  select
} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Booking {
  constructor(widgetOrderSite) {
    const thisBooking = this;

    thisBooking.render(widgetOrderSite);
    thisBooking.initWidgets();
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
    console.log('thisBooking.dom.wrapper', thisBooking.dom.wrapper);

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
  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

  }
}

export default Booking;
