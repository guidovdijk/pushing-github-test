/*
 * Carousel
 *
 * Description: 
 * -
 *
 * Dependencies:
 *  - BaseClass
 *  - Jquery
 */

import $ from '../vendors/Jquery';
import BaseClass from '../helpers/classes/BaseClass';

class Carousel extends BaseClass {
    constructor() {
        super();
        this.config = {
            classSelector: '.js-carousel',
            message: {
                init: 'Class carousel in init function',
                passedInit: 'Class carousel passed init function',
            }
        };
        this.state = {

        };
        this.init();
    }

    init() {
        const selector = $(this.config.classSelector);
        if (!this.exists(selector)) return;
        this.setState({
            message: this.config.message.passedInit,
        }, () => this.nextFunction());
        console.log(this.config.message.init);
    }

    nextFunction(){
        const { passedInit } = this.state.message;
        console.log(passedInit);
    }
}

export default Carousel;
