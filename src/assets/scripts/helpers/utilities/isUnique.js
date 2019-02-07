/*
 * isUnique()
 *
 * Checks if element is unique if not return false and stop de function.
*/
const isUnique = (element) => {
    if (element.length !== 1) {
        return false;
    }
    return true;
};

export default isUnique;
