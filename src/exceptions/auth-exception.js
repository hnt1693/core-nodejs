class AuthException extends Error {
    constructor(msg) {
        super(msg)
        this.name = "AuthException";
    }
}

module.exports= AuthException
