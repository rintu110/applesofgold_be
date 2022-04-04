const server = require("../database/connect");
const config = require("../config/config");

const {
  RESPONSE: { FAILED, DELETE, NOT_FOUND },
} = config;

module.exports = {
  deleteOne: (filter, collection, callBack) => {
    server.collection(collection).deleteOne(filter, (err, doc) => {
      if (err) {
        console.log(err);
        callBack(false, FAILED, err.message);
      } else {
        if (doc) {
          callBack(true, DELETE, doc);
        } else {
          callBack(false, NOT_FOUND, null);
        }
      }
    });
  },
};
