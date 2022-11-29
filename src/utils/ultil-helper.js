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
module.exports = {getRequestParams}
