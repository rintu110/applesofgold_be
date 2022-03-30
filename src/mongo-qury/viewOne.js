const server = require("../database/connect");
const config = require("../config/config");

const {
  RESPONSE: { FAILED, FOUND, NOT_FOUND },
} = config;

module.exports = {
  view: (filter, collection, callBack) => {
    server.collection(collection).findOne(filter, (err, doc) => {
      if (err) {
        console.log(err);
        callBack(false, FAILED, err.message);
      } else {
        if (doc) {
          callBack(true, FOUND, doc);
        } else {
          callBack(false, NOT_FOUND, null);
        }
      }
    });
  },
};
