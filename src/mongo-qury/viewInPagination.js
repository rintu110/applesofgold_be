const server = require("../database/connect");
const config = require("../config/config");

const {
  RESPONSE: { FAILED, FOUND },
} = config;

module.exports = {
  viewInPagination: async (
    filter,
    startingAfter,
    limit,
    collection,
    callBack
  ) => {
    server
      .collection(collection)
      .aggregate([
        {
          $facet: {
            result: [
              { $match: filter },
              { $sort: { _id: -1 } },
              { $skip: parseInt(startingAfter) },
              { $limit: parseInt(limit) },
            ],
            total: [{ $count: "total" }],
          },
        },
      ])
      .toArray()
      .then((doc) => {
        if (doc) {
          callBack(true, FOUND, doc);
        } else {
          callBack(false, FAILED, null);
        }
      })
      .catch((err) => {
        console.log(err);
        callBack(false, FAILED, err.message);
      });
  },
};
