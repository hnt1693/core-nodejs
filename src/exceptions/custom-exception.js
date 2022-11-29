class CustomException extends Error {
    name;
    msg
    constructor(msg, name) {
        super(msg);
        this.name = name;
    }
}

module.exports = CustomException
