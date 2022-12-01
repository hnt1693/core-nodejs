const contextService = require('request-context');
const {verify} = require("../services/jwt")
const ROLE = {
    IS_AUTHENTICATED: 0,
    ADMIN: 2,
    USER: 1,
}
const {EXCEPTION_TYPES, Exception} = require("../exceptions/custom-exception")


function getToken(req) {
    return req.headers.authorization;
}

const verifyCookie = (req, roles) => {

    if (roles.length > 0) {
        let jwt = getToken(req);
        try {
            if (!jwt) {
                throw new Exception("Token not found", EXCEPTION_TYPES.AUTH).bind("verifyCookie=>checkJwt")
            }
            jwt =jwt.replace("Bearer ","")
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
