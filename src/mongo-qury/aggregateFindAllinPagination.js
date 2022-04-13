const server = require("../database/connect");
const config = require("../config/config");

const {
  RESPONSE: { FAILED, FOUND },
} = config;

module.exports = {
  viewInPaginationLookUp: async (
    filter,
    lookup,
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
              { $lookup: lookup },
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
