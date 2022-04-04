const router = require("../../../app");
const config = require("../../../config/config");
const validate = require("../../../validation");
const { ensureAuthorisedAdmin } = require("../../../auth");
const {
  addCountrySchema,
  viewCountrySchema,
  editCountrySchema,
  deleteCountrySchema,
  assigneUnassignedSchema,
} = require("../../../schema/aogproviderbe/country");
const { view } = require("../../../mongo-qury/viewOne");
const { insert } = require("../../../mongo-qury/insertOne");
const { viewInPagination } = require("../../../mongo-qury/viewInPagination");
const { ObjectId } = require("mongodb");
const { update } = require("../../../mongo-qury/updateOne");
const { deleteOne } = require("../../../mongo-qury/deleteOne");
const { updateMany } = require("../../../mongo-qury/updateMany");

const { API, COLLECTION } = config;

router.post(
  API.ADMIN.COUNTRY.ADD_COUNTRY,
  validate(addCountrySchema),
  ensureAuthorisedAdmin,
  (req, res) => {
    const { country_nm, code, user_id } = req.body;

    const body = {
      country_nm: country_nm,
      code: code,
      status: 0,
      created_at: new Date(),
      created_by: user_id,
      updated_at: new Date(),
    };

    view(
      { country_nm: country_nm },
      COLLECTION.COUNRTY,
      (status, message, result) => {
        if (status) {
          res.json({ status: false, message: "Country already exists." });
        } else {
          insert(body, COLLECTION.COUNRTY, (status1, message1, result1) => {
            res.json({
              status: status1,
              message: message1,
              result: result1,
            });
          });
        }
      }
    );
  }
);

router.post(
  API.ADMIN.COUNTRY.VIEW_COUNTRY,
  validate(viewCountrySchema),
  ensureAuthorisedAdmin,
  (req, res) => {
    const { limit, startingAfter, searchKeyWord } = req.body;
    if (
      searchKeyWord === undefined ||
      searchKeyWord === null ||
      searchKeyWord === ""
    ) {
      viewInPagination(
        {},
        startingAfter,
        limit,
        COLLECTION.COUNRTY,
        (status, message, result) => {
          res.json({
            status: status,
            message: message,
            result: result[0].result,
            total: result[0].total[0].total,
          });
        }
      );
    } else {
      viewInPagination(
        {
          $or: [
            {
              country_nm: {
                $regex: searchKeyWord,
                $options: "i",
              },
            },
            {
              code: {
                $regex: searchKeyWord,
                $options: "i",
              },
            },
          ],
        },
        startingAfter,
        limit,
        COLLECTION.COUNRTY,
        (status, message, result) => {
          res.json({
            status: status,
            message: message,
            result: result[0].result,
            total: result[0].total[0].total,
          });
        }
      );
    }
  }
);

router.post(
  API.ADMIN.COUNTRY.EDIT_COUNTRY,
  validate(editCountrySchema),
  ensureAuthorisedAdmin,
  (req, res) => {
    const { country_nm, code, country_id } = req.body;

    const body = {
      $set: {
        country_nm: country_nm,
        code: code,
        updated_at: new Date(),
      },
    };

    view(
      { _id: new ObjectId(country_id) },
      COLLECTION.COUNRTY,
      (status, message, result) => {
        if (status) {
          update(
            { _id: new ObjectId(country_id) },
            body,
            COLLECTION.COUNRTY,
            (status1, message1, result1) => {
              res.json({ status: status1, message: message1, result: result1 });
            }
          );
        } else {
          res.json({ status: status, message: message, result: result });
        }
      }
    );
  }
);

router.post(
  API.ADMIN.COUNTRY.DELETE_COUNTRY,
  validate(deleteCountrySchema),
  ensureAuthorisedAdmin,
  (req, res) => {
    const { country_id } = req.body;

    view(
      { _id: new ObjectId(country_id) },
      COLLECTION.COUNRTY,
      (status, message, result) => {
        if (status) {
          deleteOne(
            { _id: new ObjectId(country_id) },
            COLLECTION.COUNRTY,
            (status1, message1, result1) => {
              res.json({ status: status1, message: message1, result: result1 });
            }
          );
        } else {
          res.json({ status: status, message: message, result: result });
        }
      }
    );
  }
);

router.post(
  API.ADMIN.COUNTRY.ASSIGNED_COUNTRY,
  validate(assigneUnassignedSchema),
  ensureAuthorisedAdmin,
  async (req, res) => {
    const { country_id } = req.body;

    const _id = await country_id.map((item) => new ObjectId(item));

    let filter = { _id: { $in: _id } };

    let body = {
      $set: { status: 1 },
    };

    updateMany(filter, body, COLLECTION.COUNRTY, (status, message, result) => {
      res.json({ status: status, message: message, result: result });
    });
  }
);

router.post(
  API.ADMIN.COUNTRY.UNASSIGNED_COUNTRY,
  validate(assigneUnassignedSchema),
  ensureAuthorisedAdmin,
  async (req, res) => {
    const { country_id } = req.body;

    const _id = await country_id.map((item) => new ObjectId(item));

    let filter = { _id: { $in: _id } };

    let body = {
      $set: { status: 0 },
    };

    updateMany(filter, body, COLLECTION.COUNRTY, (status, message, result) => {
      res.json({ status: status, message: message, result: result });
    });
  }
);

module.exports = router;
