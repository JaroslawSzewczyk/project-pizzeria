/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart: {
      wrapperActive: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
    cart: {
      defaultDeliveryFee: 20,
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML)
  };

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

      /* create elemenr using utils.createElementFromHTML */
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
      app.cart.add(thisProduct);
    }

  }

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

  class Cart {
    constructor(element) {
      const thisCart = this;

      thisCart.products = [];

      thisCart.deliveryFee = settings.cart.defaultDeliveryFee;

      thisCart.getElements(element);

      thisCart.initActions();

      //console.log('new Cart', thisCart);
    }

    getElements(element) {
      const thisCart = this;

      thisCart.dom = {};

      thisCart.dom.wrapper = element;

      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);

      thisCart.renderTotalsKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];

      for (let key of thisCart.renderTotalsKeys) {
        thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);
      }

    }

    initActions() {
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function () {
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });

      thisCart.dom.productList.addEventListener('update', function () {
        thisCart.update();
      });

      thisCart.dom.productList.addEventListener('remove', function () {
        thisCart.remove(event.detail.cartProduct);
      });

    }


    add(menuProduct) {
      const thisCart = this;

      const generatedHTML = templates.cartProduct(menuProduct);

      const generateDOM = utils.createDOMFromHTML(generatedHTML);

      thisCart.dom.productList.appendChild(generateDOM);

      thisCart.products.push(new CartProduct(menuProduct, generateDOM));

      thisCart.update();

      //console.log('thisCart.products', thisCart.products);

      //console.log('adding product', menuProduct);
    }

    update() {
      const thisCart = this;

      let totalNumber = 0;
      let subtotalPrice = 0;

      for (let product of thisCart.products) {
        subtotalPrice += product.price;
        totalNumber += product.amount;
      }

      thisCart.totalPrice = subtotalPrice + thisCart.deliveryFee;

      for (let key of thisCart.renderTotalsKeys) {
        for (let elem of thisCart.dom[key]) {
          elem.innerHTML = thisCart[key];
        }
      }

      console.log('sp', subtotalPrice);
      console.log('tn', totalNumber);
      console.log('total', thisCart.totalPrice);
    }

    remove(cartProduct) {
      const thisCart = this;

      console.log('thisCart.products', thisCart.products);

      const index = thisCart.products.indexOf(cartProduct);

      thisCart.products.splice(index, 1);

      cartProduct.dom.wrapper.remove();

      thisCart.update();
    }

  }

  class CartProduct {
    constructor(menuProduct, element) {
      const thisCartProduct = this;

      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.amount = menuProduct.amount;

      thisCartProduct.params = JSON.parse(JSON.stringify(menuProduct.params));

      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();

      //console.log('thisCartProduct');
    }

    getElements(element) {
      const thisCartProduct = this;

      thisCartProduct.dom = {};

      thisCartProduct.dom.wrapper = element;

      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
    }

    initAmountWidget() {
      const thisCartProduct = this;

      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);

      thisCartProduct.dom.amountWidget.addEventListener('click', function () {
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      });
    }

    remove() {
      const thisCartProduct = this;

      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },
      });

      thisCartProduct.dom.wrapper.dispatchEvent(event);

      //console.log('remove');
    }

    initActions() {

      const thisCartProduct = this;

      thisCartProduct.dom.edit.addEventListener('click', function () {
        console.log('to ja');
      });

      thisCartProduct.dom.remove.addEventListener('click', function () {
        thisCartProduct.remove();
      });

    }

  }

  const app = {
    initMenu: function () {
      const thisApp = this;

      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function () {
      const thisApp = this;

      thisApp.data = dataSource;
      // console.log('thisApp.data', thisApp.data);
    },

    initCart: function () {
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);

    },

    init: function () {
      const thisApp = this;
      //console.log('*** App starting ***');
      //console.log('thisApp:', thisApp);
      //console.log('classNames:', classNames);
      //console.log('settings:', settings);
      //console.log('templates:', templates);
      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },
  };

  app.init();
}
