const server = require("../database/connect");
const config = require("../config/config");

const {
  RESPONSE: { FAILED, ADD, NOT_FOUND },
} = config;

module.exports = {
  insertManyBulk: async (collection, body, callBack) => {
    let bulk = await server.collection(collection).initializeOrderedBulkOp();

    await body.map((item) => bulk.insert(item));

    await bulk.execute((err, doc) => {
      if (err) {
        console.error(err);
        callBack(false, FAILED, err.message);
      } else {
        if (doc) {
          callBack(true, ADD, doc);
        } else {
          callBack(false, NOT_FOUND, null);
        }
      }
    });
  },
};
