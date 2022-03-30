const server = require("../database/connect");
const config = require("../config/config");

const {
  RESPONSE: { FAILED, EDIT, ERROR_VALIDATING_USER },
} = config;

module.exports = {
  update: (filter, body, collection, callBack) => {
    server
      .collection(collection)
      .updateOne(filter, body, { returnNewDocument: true })
      .then((response) => {
        server.collection(collection).findOne(filter, body, (err, doc) => {
          if (err) {
            callBack(false, FAILED, err.message);
          } else {
            if (doc) {
              callBack(true, EDIT, doc);
            } else {
              callBack(false, ERROR_VALIDATING_USER, null);
            }
          }
        });
      })
      .catch((err) => {
        console.log(err);
        callBack(false, FAILED, err.message);
      });
  },
};
