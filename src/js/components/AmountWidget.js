import {
  settings,
  select
} from '../settings.js';

class AmountWidget {
  constructor(element) {
    const thisWidget = this;

    thisWidget.getElements(element);

    thisWidget.value = settings.amountWidget.defaultValue;

    thisWidget.setValue(thisWidget.input.value);

    thisWidget.initActions();

    // console.log('AmountWidget:', thisWidget);
    //console.log('constructor arguments:', element);
  }

  getElements(element) {
    const thisWidget = this;

    thisWidget.element = element;
    // console.log(' thisWidget.element', thisWidget.element);
    thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
    //console.log(' thisWidget.input', thisWidget.input);
    thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
    // console.log('thisWidget.linkDecrease', thisWidget.linkDecrease);
    thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
  }

  setValue(value) {
    const thisWidget = this;

    const newValue = parseInt(value);

    if (thisWidget.input.value >= settings.amountWidget.defaultMin && thisWidget.input.value <= settings.amountWidget.defaultMax) {
      thisWidget.value = newValue;
      thisWidget.announce();
    }
    thisWidget.input.value = thisWidget.value;

    //console.log(thisWidget.value);
  }

  initActions() {
    const thisWidget = this;

    thisWidget.input.addEventListener('change', function () {
      thisWidget.setValue(thisWidget.input.value);
    });

    thisWidget.linkDecrease.addEventListener('click', function (event) {
      event.preventDefault();
      if (thisWidget.value >= 10) {
        thisWidget.input.value = 9;
      }
      thisWidget.setValue(thisWidget.value - 1);
    });

    thisWidget.linkIncrease.addEventListener('click', function (event) {
      event.preventDefault();
      if (thisWidget.value <= 0) {
        thisWidget.input.value = 1;
      }
      thisWidget.setValue(thisWidget.value + 1);
    });

  }

  announce() {
    const thisWidget = this;

    const event = new CustomEvent('updated', {
      bubbles: true
    });
    thisWidget.element.dispatchEvent(event);
  }
}

export default AmountWidget;
