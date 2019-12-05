import {
  select,
  classNames,
  templates
} from '../settings.js';

import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';


const activeProducts = [];

class Product {
  constructor(id, data) {
    const thisProduct = this;

    thisProduct.id = id;
    thisProduct.data = data;

    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();

    //console.log('new Product:', thisProduct);
  }

  renderInMenu() {
    const thisProduct = this;

    /* generate HTML based on tamplate */
    const generatedHTML = templates.menuProduct(thisProduct.data);

    /* create element using utils.createElementFromHTML */
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);

    /* find menu container */
    const menuContainer = document.querySelector(select.containerOf.menu);

    /* add element to menu */
    menuContainer.appendChild(thisProduct.element);
  }

  getElements() {
    const thisProduct = this;

    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    //console.log('thisProduct.amountWidgetElem', thisProduct.amountWidgetElem);
  }

  initAccordion() {
    const thisProduct = this;

    /*[DONE] find the clickable trigger (the element that should react to clicking) */

    const clickableTriger = thisProduct.accordionTrigger;

    /*[DONE] START: click event listener to trigger */
    clickableTriger.addEventListener('click', function (event) {

      /*[DONE] prevent default action for event */
      event.preventDefault();

      /*[DONE] toggle active class on element of thisProduct */
      thisProduct.element.classList.toggle('active');

      /* find all active products */


      if (thisProduct.element.classList.contains('active')) {
        activeProducts.push(thisProduct.element);
      }
      // console.log(activeProducts);

      /* START LOOP: for each active product */
      for (let product of activeProducts) {

        /* START: if the active product isn't the element of thisProduct */
        if (product != thisProduct.element) {
          /* remove class active for the active product */
          product.classList.remove('active');
          /* END: if the active product isn't the element of thisProduct */
        }
        /* END LOOP: for each active product */
      }
      /* END: click event listener to trigger */
    });
  }

  initOrderForm() {
    const thisProduct = this;

    thisProduct.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
    });

    for (let input of thisProduct.formInputs) {
      input.addEventListener('change', function () {
        thisProduct.processOrder();
      });
    }

    thisProduct.cartButton.addEventListener('click', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });

    // console.log('initOrderForm');
  }

  processOrder() {
    const thisProduct = this;

    const formData = utils.serializeFormToObject(thisProduct.form);
    //console.log('formData', formData);

    thisProduct.params = {};

    let price = thisProduct.data.price;
    // console.log('price', price);



    //console.log('thisProduct.data.params', thisProduct.data.params);
    for (let paramId in thisProduct.data.params) {
      const param = thisProduct.data.params[paramId];
      //console.log('parmId:', paramId);
      for (let optionId in param.options) {
        const option = param.options[optionId];
        // console.log('optionId:', optionId);

        //checking if element is selected(hope so)(I didn't know how to do that)
        let selectedOption = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;
        //console.log(selectedOption);
        if (selectedOption == true && !option.default) {
          price += option.price;
          // console.log(price);
        } else if (selectedOption == false && option.default) {
          price -= option.price;
          // console.log(price);
        }

        const images = thisProduct.imageWrapper.querySelectorAll('.' + paramId + '-' + optionId);
        //console.log(images);

        if (selectedOption) {
          if (!thisProduct.params[paramId]) {
            thisProduct.params[paramId] = {
              label: param.label,
              options: {},
            };
          }
          thisProduct.params[paramId].options[optionId] = option.label;


          for (let image of images) {
            image.classList.add(classNames.menuProduct.imageVisible);
          }
        } else {
          for (let image of images) {
            image.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
      }
    }

    thisProduct.priceSingle = price;
    thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;
    thisProduct.priceElem.innerHTML = thisProduct.price;

    // console.log('thisProduct.params', thisProduct.params);
  }

  initAmountWidget() {
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('updated', function () {
      thisProduct.processOrder();
    });

    //console.log('thisProduct.amountWidget', thisProduct.amountWidget);
  }

  addToCart() {
    const thisProduct = this;

    thisProduct.name = thisProduct.data.name;
    //console.log('name', thisProduct.name);
    thisProduct.amount = thisProduct.amountWidget.value;
    //console.log('amount', thisProduct.amount);

    //app.cart.add(thisProduct);
    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      },
    });

    thisProduct.element.dispatchEvent(event);

  }

}

export default Product;
