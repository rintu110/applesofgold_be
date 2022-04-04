const { ObjectId } = require("mongodb");
const config = require("../config/config");
const { view } = require("../mongo-qury/viewOne");
const { RESPONSE, COLLECTION } = config;

module.exports = {
  ensureAuthorisedAdmin: async (req, res, next) => {
    try {
      const { user_token } = req.body;

      if (
        (!user_token || user_token === null || user_token === "",
        user_token === undefined)
      ) {
        res.json({ status: false, message: RESPONSE.USER_TOKEN_NOT_FOUND });
      } else {
        view(
          { user_token: user_token, status: true },
          COLLECTION.USER,
          (status, message, result) => {
            if (status) {
              if (result.user_type === "SA" || result.user_type === "A") {
                req.body.user_id = new ObjectId(result._id);
                next();
              } else {
                res.json({ status: false, message: RESPONSE.ACCESS_DENIED });
              }
            } else {
              res.json({
                status: status,
                message: RESPONSE.NO_USER_EXISTS,
                result: result,
              });
            }
          }
        );
      }
    } catch {
      console.log(error);
      res.json({ status: false, message: RESPONSE.ERROR_VALIDATING_USER });
    }
  },
};
