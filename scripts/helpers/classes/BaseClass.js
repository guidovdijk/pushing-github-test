// if import doesn't work change to: "import _exists from '../utilities/exists';"
import { exists as _exists} from '../utilities/exists';
import { isUnique as _isUnique} from '../utilities/isUnique';

/*
 * BaseClass
 * 
 * Is used to set the state of properties and making a deep copy
 * 
 * Dependicies:
 *  - exists();
 *  - isUnique();
*/
class BaseClass {
  // Simple functions that do not use 'this'
  exists(element) {
    return _exists(element);
  }
  isUnique(element) {
    return _isUnique(element);
  }

  // More complicated functions that use 'this'
  setState(state, callback) {
    this.state = {
      ...this.state,
      ...state,
    };
    if (callback) callback();
  }
}

export default BaseClass;
