const server = require("../database/connect");
const config = require("../config/config");

const {
  RESPONSE: { FAILED, ADD },
} = config;

module.exports = {
  insert: (body, collection, callBack) => {
    server.collection(collection).insertOne(body, (err, doc) => {
      if (err) {
        console.log(err);
        callBack(false, FAILED, err.message);
      } else {
        if (doc) {
          callBack(true, ADD, doc);
        } else {
          callBack(false, FAILED, null);
        }
      }
    });
  },
};
