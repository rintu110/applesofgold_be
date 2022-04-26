const { ObjectId } = require("mongodb");
const config = require("../config/config");
const { view } = require("../mongo-qury/viewOne");
const { RESPONSE, COLLECTION } = config;
const yup = require("yup");

module.exports = {
  ensureAuthorisedAdmin: async (req, res, next) => {
    try {
      const { user_token } = req.body;

      const schema = yup.object({
        user_token: yup.string().trim().required(RESPONSE.USER_TOKEN_NOT_FOUND),
      });

      schema
        .validate({ user_token })
        .then(() => {
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
        })
        .catch((e) => {
          res.json({ status: false, message: RESPONSE.USER_TOKEN_NOT_FOUND });
        });
    } catch {
      console.log(error);
      res.json({ status: false, message: RESPONSE.ERROR_VALIDATING_USER });
    }
  },
};
