import { select, settings, classNames } from '../settings.js';

class Carousel {
  constructor(){
    const thisCarousel = this;

    thisCarousel.time = settings.intervalTime.time;
    thisCarousel.active = 0;

    thisCarousel.getElements();
    thisCarousel.interval(thisCarousel.time);
    thisCarousel.carouselInterval = null;
  }

  getElements() {
    const thisCarousel = this;

    /*find all reviews*/
    thisCarousel.reviews = [...document.querySelectorAll(select.carousel.textReview)];

    /*find all marks */
    thisCarousel.marks = [...document.querySelectorAll(select.carousel.reviewMark)];
  }

  siteMarks() {
    const thisCarousel = this;
    thisCarousel.active++;
    if (thisCarousel.active === 3) {
      thisCarousel.active = 0;
    }

    for (let review of thisCarousel.reviews) {
      review.classList.remove(classNames.activeCarousel.activeText);
    }

    for (let mark of thisCarousel.marks) {
      mark.classList.remove(classNames.activeCarousel.activeMark);
    }

    thisCarousel.reviews[thisCarousel.active].classList.add(classNames.activeCarousel.activeText);
    thisCarousel.marks[thisCarousel.active].classList.add(classNames.activeCarousel.activeMark);
  }

  interval(time) {
    const thisCarousel = this;

    setInterval(function () {
      thisCarousel.siteMarks();
    }, time);
  }

}

export default Carousel;
