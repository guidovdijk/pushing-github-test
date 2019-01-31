// Import Class component
import Carousel from './components/class-carousel';

// Import es6 function and normal funciton. Already initialized in their corresponding files
require('./components/function-carousel');
require('./components/es6-carousel');

// Initialize class component
new Carousel(); // eslint-disable-line no-new

// Vendors will be compiled in their own map | Should be in the imported via package and let webpack handle it