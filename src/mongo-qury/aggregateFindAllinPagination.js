const server = require("../database/connect");
const config = require("../config/config");

const {
  RESPONSE: { FAILED, FOUND },
} = config;

module.exports = {
  viewInPaginationLookUp: async (filter, collection, callBack) => {
    server
      .collection(collection)
      .aggregate(filter)
      .toArray()
      .then((doc) => {
        if (doc) {
          callBack(true, FOUND, doc);
        } else {
          callBack(false, FAILED, []);
        }
      })
      .catch((err) => {
        console.log(err);
        callBack(false, FAILED, []);
      });
  },
};
