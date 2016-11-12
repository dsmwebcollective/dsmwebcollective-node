{
    // Assumes the two objects share the same properties
    objectsAreEqual = (obj1, obj2) => {
        return Object.keys(obj1).every((key) => obj1[key] === obj2[key]);
    };

    module.exports = {
        objectsAreEqual: objectsAreEqual
    };
}