const server = require("../database/connect");
const config = require("../config/config");

const {
  RESPONSE: { FAILED, EDIT, ERROR_VALIDATING_USER },
} = config;

module.exports = {
  updateMany: (filter, body, collection, callBack) => {
    server
      .collection(collection)
      .updateMany(filter, body)
      .then((response) => {
        if (response) {
          callBack(true, EDIT, response);
        } else {
          callBack(false, ERROR_VALIDATING_USER, null);
        }
      })
      .catch((err) => {
        console.log(err);
        callBack(false, FAILED, err.message);
      });
  },
};
