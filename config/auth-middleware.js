const {HttpConfig} = require("../config/http-config");
const {verify} = require("../services/jwt")
const ROLE = {
    IS_AUTHENTICATED: 0,
    ADMIN: 2,
    USER: 1,
}
HttpConfig.matches(["/user"]).hasRole(ROLE.ADMIN);
const AuthException = require("../exceptions/auth-exception")


function getcookie(req) {
    let cookie = req.headers.cookie;
    let map = new Map;
    if (cookie) {
        cookie = cookie.split('; ')
        cookie.forEach(c => {
            let temp = c.split("=");
            map.set(temp[0], (temp[1]));
        })
    }
    return map;
}

const verifyCookie = (req, roles) => {

    if (roles.length > 0) {
        const jwt = getcookie(req).get("SSID");
        try {
            if (!jwt) {
                throw new AuthException("Not allowed to access this source")
            }
            let user = verify(jwt);
            if (!roles.includes(ROLE.IS_AUTHENTICATED) && !roles.includes(user.type)) {
                throw new AuthException("Not allowed to access this source")
            }
            req.res.locals.user = user;
        } catch (e) {
            throw e
        }
    }

}

const authWithAsync = (callbackFunction, roles = []) => async (req, res, next) => {
    try {
        if (roles.length > 0) {
            try {
                verifyCookie(req, roles);
                await callbackFunction(req, res, next);
            } catch (e) {
                next(new AuthException(e.message));
            }
        } else {
            await callbackFunction(req, res, next);
        }

    } catch (e) {
        next(e)
    }


};

module.exports = {authWithAsync, ROLE}
