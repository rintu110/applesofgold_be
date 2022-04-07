const server = require("../database/connect");
const config = require("../config/config");

const {
  RESPONSE: { FAILED, FOUND, NOT_FOUND },
} = config;

module.exports = {
  viewAll: (filter, collection, callBack) => {
    server
      .collection(collection)
      .find(filter)
      .toArray()
      .then((doc) => {
        if (doc) {
          callBack(true, FOUND, doc);
        } else {
          callBack(false, NOT_FOUND, null);
        }
      })
      .catch((err) => {
        console.log(err);
        callBack(false, FAILED, err.message);
      });
  },
};
