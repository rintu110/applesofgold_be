const router = require("../../app");
const config = require("../../config/config");
const validate = require("../../validation");
const {
  user_register_schema,
  user_login_schema,
} = require("../../schema/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { COLLECTION, API, RESPONSE, JWT_SECRET } = config;

const { view } = require("../../mongo-qury/viewOne");
const { insert } = require("../../mongo-qury/insertOne");
const { update } = require("../../mongo-qury/updateOne");
const { ensureAuthorisedAdmin } = require("../../auth");

router.post(
  API.USER.REGISTER_USER,
  validate(user_register_schema),
  async (req, res) => {
    const { username, email, mobile, password, user_type } = req.body;

    let user = {
      username: username,
      email: email,
      mobile: mobile,
      password: await bcrypt.hash(password, 12),
      user_token: "",
      created_on: new Date(),
      user_type: user_type,
      status: true,
    };

    view({ email: email }, COLLECTION.USER, (status, message, result) => {
      if (!status) {
        insert(user, COLLECTION.USER, (status2, message2, result2) => {
          res.json({
            status: status2,
            message: message2,
            result: result2,
          });
        });
      } else {
        res.json({
          status: false,
          message: RESPONSE.EMAIL_EXISTS,
        });
      }
    });
  }
);

router.post(
  API.USER.LOGIN_USER,
  validate(user_login_schema),
  async (req, res) => {
    const { email, password } = req.body;

    view({ email: email }, COLLECTION.USER, (status, message, result) => {
      if (status) {
        if (bcrypt.compareSync(password, result.password)) {
          update(
            { email: email },
            { $set: { user_token: jwt.sign({ email }, JWT_SECRET) } },
            COLLECTION.USER,
            (status2, message2, result2) => {
              if (status2) {
                res.json({
                  status: status2,
                  message: RESPONSE.LOGIN_SUCCESS,
                  result: result2,
                });
              } else {
                res.json({
                  status: status2,
                  message: message2,
                  result: result2,
                });
              }
            }
          );
        } else {
          res.json({
            status: false,
            message: RESPONSE.PASSWORDS_DONT_MATCH,
          });
        }
      } else {
        res.json({
          status: status,
          message: RESPONSE.FAILED,
        });
      }
    });
  }
);

router.post(
  API.USER.GET_USER_DETAILS,
  ensureAuthorisedAdmin,
  async (req, res) => {
    const { user_id } = req.body;

    view({ _id: user_id }, COLLECTION.USER, (status, message, result) => {
      res.json({
        status: status,
        message: message,
        result: result,
      });
    });
  }
);

module.exports = router;
