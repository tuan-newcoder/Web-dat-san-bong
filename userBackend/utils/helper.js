/**
 * @param {Array<Object>} array
 * @returns {nummber}
 */

const generateId = (array) => {
    if (array.length === 0) return 1;

    const maxID = Math.max(...array.map(item => item.id));
    return maxID + 1;
};

module.exports = {
    generateId
};