/*
 * exists()
 *
 * Checks if element exists if not return false and stop de function.
*/

const exists = element => {
    if (element.length === 0) {
        return false;
    }
    return true;
};

export default exists;
