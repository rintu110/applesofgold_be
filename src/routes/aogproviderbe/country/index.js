const router = require("../../../app");
const config = require("../../../config/config");
const validate = require("../../../validation");
const filesvalidate = require("../../../validation/fileValidation");
const { ensureAuthorisedAdmin } = require("../../../auth");
const {
  addCountrySchema,
  editCountrySchema,
  deleteCountrySchema,
} = require("../../../schema/aogproviderbe/country");
const universal = require("../../../schema/universal");
const { insertManyBulk } = require("../../../mongo-qury/bulkOperation");
const { view } = require("../../../mongo-qury/viewOne");
const { insert } = require("../../../mongo-qury/insertOne");
const { viewInPagination } = require("../../../mongo-qury/viewInPagination");
const { ObjectId } = require("mongodb");
const { update } = require("../../../mongo-qury/updateOne");
const { deleteOne } = require("../../../mongo-qury/deleteOne");
const { updateMany } = require("../../../mongo-qury/updateMany");
const { viewAll } = require("../../../mongo-qury/findAll");
const csvtojson = require("csvtojson");
const { Parser } = require("json2csv");

const { API, COLLECTION, RESPONSE } = config;

router.post(
  API.ADMIN.COUNTRY.ADD_COUNTRY,
  validate(addCountrySchema),
  ensureAuthorisedAdmin,
  (req, res) => {
    const { country_nm, code, country_message, country_flag, user_id } =
      req.body;

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
          res.json({ status: false, message: RESPONSE.DATA });
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
  validate(universal.viewAdminSchema),
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
          if (result.length) {
            if (result[0].result.length) {
              res.json({
                status: status,
                message: message,
                result: result[0].result,
                total: result[0].total[0].total,
              });
            } else {
              res.json({
                status: status,
                message: message,
                result: [],
                total: 0,
              });
            }
          } else {
            res.json({
              status: status,
              message: message,
              result: [],
              total: 0,
            });
          }
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
          if (result.length) {
            if (result[0].result.length) {
              res.json({
                status: status,
                message: message,
                result: result[0].result,
                total: result[0].total[0].total,
              });
            } else {
              res.json({
                status: status,
                message: message,
                result: [],
                total: 0,
              });
            }
          } else {
            res.json({
              status: status,
              message: message,
              result: [],
              total: 0,
            });
          }
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

    update(
      { _id: new ObjectId(country_id) },
      body,
      COLLECTION.COUNRTY,
      (status, message, result) => {
        res.json({ status: status, message: message, result: result });
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

    deleteOne(
      { _id: new ObjectId(country_id) },
      COLLECTION.COUNRTY,
      (status1, message1, result1) => {
        res.json({ status: status1, message: message1, result: result1 });
      }
    );
  }
);

router.post(
  API.ADMIN.COUNTRY.ASSIGNED_COUNTRY,
  validate(universal.assigneUnassignedSchema),
  ensureAuthorisedAdmin,
  async (req, res) => {
    const { _id } = req.body;

    const country_id = await _id.map((item) => new ObjectId(item));

    let filter = { _id: { $in: country_id } };

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
  validate(universal.assigneUnassignedSchema),
  ensureAuthorisedAdmin,
  async (req, res) => {
    const { _id } = req.body;

    const country_id = await _id.map((item) => new ObjectId(item));

    let filter = { _id: { $in: country_id } };

    let body = {
      $set: { status: 0 },
    };

    updateMany(filter, body, COLLECTION.COUNRTY, (status, message, result) => {
      res.json({ status: status, message: message, result: result });
    });
  }
);

router.post(
  API.ADMIN.COUNTRY.ADD_COUNTRY_FROM_CSV,
  filesvalidate(universal.importAndExportCsv),
  ensureAuthorisedAdmin,
  async (req, res) => {
    const { user_id } = req.body;
    const { csv } = req.files;

    await csvtojson()
      .fromString(csv.data.toString("utf8"))
      .then((csvrow) => {
        if (csvrow.length > 0) {
          if (
            csvrow[0].hasOwnProperty("country_nm") &&
            csvrow[0].hasOwnProperty("code")
          ) {
            const valid = csvrow.find(
              (item) => item.country_nm === "" || item.code === ""
            );

            const validIndex =
              csvrow.findIndex(
                (item) => item.country_nm === "" || item.code === ""
              ) + 2;

            if (
              valid !== undefined &&
              valid !== null &&
              valid !== "" &&
              (valid.country_nm === "" || valid.code === "")
            ) {
              res.json({
                status: false,
                message: `In line ${validIndex} some paramter is missing`,
                result: [],
              });
            } else {
              let row = [];
              let filter = {
                country_nm: {
                  $in: csvrow.map((item) => item.country_nm),
                },
              };

              viewAll(filter, COLLECTION.COUNRTY, (status, message, result) => {
                if (status && result.length > 0) {
                  row = csvrow.filter(
                    (item) =>
                      !result.find(
                        (item2) => item.country_nm === item2.country_nm
                      )
                  );

                  if (
                    row !== undefined &&
                    row !== null &&
                    row !== "" &&
                    row.length > 0
                  ) {
                    let body = row.map((items) => ({
                      ...items,
                      status: 0,
                      created_at: new Date(),
                      created_by: user_id,
                      updated_at: new Date(),
                    }));

                    insertManyBulk(
                      COLLECTION.COUNRTY,
                      body,
                      (status, message, result) => {
                        res.json({
                          status: status,
                          message: message,
                          result: result,
                        });
                      }
                    );
                  } else {
                    res.json({
                      status: false,
                      message: RESPONSE.DATA,
                      result: [],
                    });
                  }
                } else {
                  let body = csvrow.map((items) => ({
                    ...items,
                    status: 0,
                    created_at: new Date(),
                    created_by: user_id,
                    updated_at: new Date(),
                  }));

                  insertManyBulk(
                    COLLECTION.COUNRTY,
                    body,
                    (status, message, result) => {
                      res.json({
                        status: status,
                        message: message,
                        result: result,
                      });
                    }
                  );
                }
              });
            }
          } else {
            res.json({
              status: false,
              message: RESPONSE.UPLOAD_ERROR,
              result: [],
            });
          }
        } else {
          res.json({ status: false, message: RESPONSE.NOT_FOUND, result: [] });
        }
      });
  }
);

router.post(
  API.ADMIN.COUNTRY.SEND_COUNTRY_TO_CSV,
  ensureAuthorisedAdmin,
  async (req, res) => {
    viewAll({}, COLLECTION.COUNRTY, async (status, message, result) => {
      if (status && result.length > 0) {
        const json2csv = new Parser({
          fields: ["country_nm", "code"],
        });
        const csv = json2csv.parse(result);
        res.send(csv);
      } else {
        res.send(RESPONSE.NOT_FOUND);
      }
    });
  }
);

router.post(
  API.ADMIN.COUNTRY.VIEW_ALL_COUNTRY,
  ensureAuthorisedAdmin,
  (req, res) => {
    viewAll({ status: 1 }, COLLECTION.COUNRTY, (status, message, result) => {
      res.json({
        status: status,
        message: message,
        result: result,
      });
    });
  }
);

module.exports = router;
