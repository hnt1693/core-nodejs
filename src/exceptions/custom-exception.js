
class CustomException extends Error {
   name
   msg
   thrown

   constructor(msg, name) {
       super(msg);
       this.name = name;
   }

  bind = (data) => {
      this.thrown = data;
      return this;
  };
}

const EXCEPTION_TYPES = {
    AUTH        : 'AuthException',
    NOT_FOUND   : 'NotFoundException',
    CORS        : 'CORSException',
    FILE        : 'FileException',
    DATA_INVALID: 'DataException'
};

module.exports = {Exception: CustomException, EXCEPTION_TYPES};
