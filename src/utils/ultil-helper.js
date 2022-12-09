const getRequestParams = (req) => {
  return req.query;
};
const getIntParam = (req, key, defaultValue) => {
  try {
    return parseInt(req.query.get(key));
  } catch (e) {
    return defaultValue;
  }
};

class StringBuilder {
  value = '';

  constructor() {
    this.value = '';
  }

  append = (str) => {
    this.value += str;
    return this;
  };

  toString() {
    return this.value;
  }

}

class ResponseBuilder {

  static map = {};

  static getInstance() {
    this.map = {};
    return this;
  }

  static code(code) {
    this.map['code'] = code;
    return this;
  }

  static data(data) {
    this.map['data'] = data;
    return this;
  }

  static msg(msg) {
    this.map['msg'] = msg;
    return this;
  }

  static other(key, value) {
    this.map[key] = value;
    return this;
  }

  static build() {
    return this.map;
  }

}

module.exports = {getRequestParams, StringBuilder, ResponseBuilder};
