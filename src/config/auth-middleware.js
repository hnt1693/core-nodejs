const contextService = require('request-context');
const {verify} = require("../services/jwt")
const ROLE = {
    IS_AUTHENTICATED: 0,
    ADMIN: 2,
    USER: 1,
}

const AuthException = require("../exceptions/auth-exception")
const {EXCEPTION_TYPES, Exception} = require("../exceptions/custom-exception")


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
                throw new Exception("Not allowed to access this source", EXCEPTION_TYPES.AUTH).bind("verifyCookie=>checkJwt")
            }
            let user = verify(jwt);
            if (!roles.includes(ROLE.IS_AUTHENTICATED) && !roles.includes(user.type)) {
                throw new Exception("Not allowed to access this source", EXCEPTION_TYPES.AUTH).bind("verifyCookie=>checkRoles")
            }
            if (user) {
                contextService.set('request:user', user);
            } else {
                contextService.set('request:user', {username: "AnonymousUser", type: -1});
            }

        } catch (e) {
            throw new Exception(e.message, EXCEPTION_TYPES.AUTH).bind("verifyCookie=>jwtValidate")
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
                next(e);
            }
        } else {
            contextService.set('request:user', {username: "AnonymousUser", type: -1});
            await callbackFunction(req, res, next);
        }

    } catch (e) {
        next(e)
    }


};

module.exports = {authWithAsync, ROLE}
