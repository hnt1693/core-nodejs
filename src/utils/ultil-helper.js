const getRequestParams = (req) => {
    return req.query;
}
const getIntParam = (req, key, defaultValue) => {
    try {
        return parseInt(req.query.get(key))
    } catch (e) {
        return defaultValue
    }
}

class StringBuilder {
    value = '';

    constructor() {
    }

    append = (str)=> {
        this.value += str;
        return this;
    }

    toString() {
        return this.value;
    }


}

module.exports = {getRequestParams, StringBuilder}
