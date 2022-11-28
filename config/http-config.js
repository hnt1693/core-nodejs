const ROLE = {
    ALL: "ALL",
    ADMIN: "ADMIN",
    USER: "USER",
}

class HttpConfig {
    current;
    map;

    static getInstance() {
        if (!this.map) {
            this.map = new Map()
        }
        return this
    }

    static matches(arr) {
        this.map.set(ROLE.ALL, arr);
        this.current = arr;
        return this;
    }

    static hasRole(role) {
        this.map.set(role, this.current);
        this.current = null;
        return this;
    }

}

module.exports = {HttpConfig: HttpConfig.getInstance(), ROLE};
