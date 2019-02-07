// Import Class component
import Carousel from './components/class-carousel';

// Import es6 function and normal funciton. Already initialized in their corresponding files
import es6Carousel from './components/function-carousel';
import functionCarousel from './components/es6-carousel';

// Initialize class component
new Carousel(); // eslint-disable-line no-new

// Initialize function imports
es6Carousel();
functionCarousel();

// Vendors will be compiled in their own map | Should be in the imported via package and let webpack handle it