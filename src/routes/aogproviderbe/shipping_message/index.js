const router = require("../../../app");
const config = require("../../../config/config");
const validate = require("../../../validation");
const filesvalidate = require("../../../validation/fileValidation");
const { ensureAuthorisedAdmin } = require("../../../auth");
const {
  addShippingMessageSchema,
  editShippingMessageSchema,
  deleteShippingMessageSchema,
} = require("../../../schema/aogproviderbe/shipping_message");
const {
  viewInPaginationLookUp,
} = require("../../../mongo-qury/aggregateFindAllinPagination");
const { findCountry, findAllCountry } = require("../../../modules/csv_modules");
const universal = require("../../../schema/universal");
const { insertManyBulk } = require("../../../mongo-qury/bulkOperation");
const { view } = require("../../../mongo-qury/viewOne");
const { insert } = require("../../../mongo-qury/insertOne");
const { ObjectId } = require("mongodb");
const { update } = require("../../../mongo-qury/updateOne");
const { deleteOne } = require("../../../mongo-qury/deleteOne");
const { updateMany } = require("../../../mongo-qury/updateMany");
const { viewAll } = require("../../../mongo-qury/findAll");
const csvtojson = require("csvtojson");
const { Parser } = require("json2csv");

const { API, COLLECTION, RESPONSE } = config;

const { SHIPPING_MESSAGE } = API.ADMIN;

router.post(
  SHIPPING_MESSAGE.ADD_SHIPPING_MESSAGE,
  validate(addShippingMessageSchema),
  ensureAuthorisedAdmin,
  (req, res) => {
    const {
      code,
      shipping_message,
      shipping_free,
      shipping_days,
      shipping_order,
      country_message,
      country_flag,
      user_id,
    } = req.body;

    const body = {
      shipping_message: shipping_message,
      shipping_days: shipping_days,
      shipping_free: shipping_free,
      country_message: country_message,
      country_flag: country_flag,
      shipping_order: shipping_order,
      code: code,
      status: 0,
      created_at: new Date(),
      created_by: user_id,
      updated_at: new Date(),
    };

    view(
      { code: code, shipping_message: shipping_message },
      COLLECTION.SHIPPING_MESSAGE,
      (status, message, result) => {
        if (status) {
          res.json({ status: false, message: RESPONSE.DATA });
        } else {
          insert(
            body,
            COLLECTION.SHIPPING_MESSAGE,
            (status1, message1, result1) => {
              res.json({
                status: status1,
                message: message1,
                result: result1,
              });
            }
          );
        }
      }
    );
  }
);

router.post(
  SHIPPING_MESSAGE.VIEW_SHIPPING_MESSAGE,
  validate(universal.viewAdminSchema),
  ensureAuthorisedAdmin,
  (req, res) => {
    const { limit, startingAfter, searchKeyWord } = req.body;

    if (
      searchKeyWord === undefined ||
      searchKeyWord === null ||
      searchKeyWord === ""
    ) {
      viewInPaginationLookUp(
        [
          { $sort: { _id: -1 } },
          {
            $facet: {
              result: [
                { $skip: parseInt(startingAfter) },
                { $limit: parseInt(limit) },
              ],
              total: [{ $count: "total" }],
            },
          },
        ],
        COLLECTION.SHIPPING_MESSAGE,
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
      viewInPaginationLookUp(
        [
          { $sort: { _id: -1 } },
          {
            $match: {
              $or: [
                {
                  shipping_message: {
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
                {
                  shipping_free: {
                    $regex: searchKeyWord,
                    $options: "i",
                  },
                },
                {
                  shipping_days: {
                    $regex: searchKeyWord,
                    $options: "i",
                  },
                },
                {
                  shipping_order: {
                    $regex: searchKeyWord,
                    $options: "i",
                  },
                },
                {
                  "country.country_nm": {
                    $regex: searchKeyWord,
                    $options: "i",
                  },
                },
              ],
            },
          },
          {
            $facet: {
              result: [
                { $skip: parseInt(startingAfter) },
                { $limit: parseInt(limit) },
              ],
              total: [{ $count: "total" }],
            },
          },
        ],
        COLLECTION.SHIPPING_MESSAGE,
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
  SHIPPING_MESSAGE.EDIT_SHIPPING_MESSAGE,
  validate(editShippingMessageSchema),
  ensureAuthorisedAdmin,
  (req, res) => {
    const {
      code,
      shipping_message,
      shipping_free,
      shipping_days,
      shipping_id,
      shipping_order,
      country_message,
      country_flag,
    } = req.body;

    const body = {
      $set: {
        shipping_message: shipping_message,
        shipping_days: shipping_days,
        shipping_free: shipping_free,
        country_message: country_message,
        country_flag: country_flag,
        code: code,
        shipping_order: shipping_order,
        updated_at: new Date(),
      },
    };

    update(
      { _id: new ObjectId(shipping_id) },
      body,
      COLLECTION.SHIPPING_MESSAGE,
      (status, message, result) => {
        res.json({ status: status, message: message, result: result });
      }
    );
  }
);

router.post(
  SHIPPING_MESSAGE.DELETE_SHIPPING_MESSAGE,
  validate(deleteShippingMessageSchema),
  ensureAuthorisedAdmin,
  (req, res) => {
    const { shipping_id } = req.body;

    deleteOne(
      { _id: new ObjectId(shipping_id) },
      COLLECTION.SHIPPING_MESSAGE,
      (status, message, result) => {
        res.json({ status: status, message: message, result: result });
      }
    );
  }
);

router.post(
  SHIPPING_MESSAGE.ASSIGNED_SHIPPING_MESSAGE,
  validate(universal.assigneUnassignedSchema),
  ensureAuthorisedAdmin,
  async (req, res) => {
    const { _id } = req.body;

    const shipping_id = await _id.map((item) => new ObjectId(item));

    let filter = { _id: { $in: shipping_id } };

    let body = {
      $set: { status: 1 },
    };

    updateMany(
      filter,
      body,
      COLLECTION.SHIPPING_MESSAGE,
      (status, message, result) => {
        res.json({ status: status, message: message, result: result });
      }
    );
  }
);

router.post(
  SHIPPING_MESSAGE.UNASSIGNED_SHIPPING_MESSAGE,
  validate(universal.assigneUnassignedSchema),
  ensureAuthorisedAdmin,
  async (req, res) => {
    const { _id } = req.body;

    const shipping_id = await _id.map((item) => new ObjectId(item));

    let filter = { _id: { $in: shipping_id } };

    let body = {
      $set: { status: 0 },
    };

    updateMany(
      filter,
      body,
      COLLECTION.SHIPPING_MESSAGE,
      (status, message, result) => {
        res.json({ status: status, message: message, result: result });
      }
    );
  }
);

router.post(
  SHIPPING_MESSAGE.ADD_SHIPPING_MESSAGE_FROM_CSV,
  filesvalidate(universal.importAndExportCsv),
  ensureAuthorisedAdmin,
  async (req, res) => {
    const { user_id } = req.body;
    const { csv } = req.files;

    await csvtojson()
      .fromString(csv.data.toString("utf8"))
      .then((csvrow) => {
        if (csvrow.length) {
          if (
            csvrow[0].hasOwnProperty("shipping_days") &&
            csvrow[0].hasOwnProperty("code") &&
            csvrow[0].hasOwnProperty("shipping_free") &&
            csvrow[0].hasOwnProperty("shipping_message") &&
            csvrow[0].hasOwnProperty("shipping_order") &&
            csvrow[0].hasOwnProperty("country_nm")
          ) {
            const valid = csvrow.find(
              (item) =>
                item.shipping_message === "" ||
                item.code === "" ||
                item.shipping_days === "" ||
                item.shipping_free === "" ||
                item.shipping_order === "" ||
                item.country_nm === ""
            );

            const validIndex =
              csvrow.findIndex(
                (item) =>
                  item.shipping_message === "" ||
                  item.code === "" ||
                  item.shipping_days === "" ||
                  item.shipping_free === "" ||
                  item.shipping_order === "" ||
                  item.country_nm === ""
              ) + 2;

            if (
              valid !== undefined &&
              valid !== null &&
              valid !== "" &&
              (valid.shipping_message === "" ||
                valid.shipping_days === "" ||
                valid.shipping_free === "" ||
                valid.code === "" ||
                valid.shipping_order === "" ||
                valid.country_nm === "")
            ) {
              res.json({
                status: false,
                message: `In line ${validIndex} some paramter is missing`,
                result: [],
              });
            } else {
              let row = [];
              let filter = {
                shipping_message: {
                  $in: csvrow.map((item) => item.shipping_message),
                },
              };

              viewAll(
                filter,
                COLLECTION.SHIPPING_MESSAGE,
                (status, message, result) => {
                  if (status && result.length) {
                    row = csvrow.filter(
                      (item) =>
                        !result.find(
                          (item2) =>
                            item.shipping_message === item2.shipping_message
                        )
                    );

                    if (
                      row !== undefined &&
                      row !== null &&
                      row !== "" &&
                      row.length > 0
                    ) {
                      let filter = {
                        country_nm: {
                          $in: row.map((item) => item.country_nm),
                        },
                      };

                      findCountry(COLLECTION.COUNRTY, filter, row, (rows) => {
                        insetEverything(rows);
                      });
                    } else {
                      res.json({
                        status: false,
                        message: RESPONSE.DATA,
                        result: [],
                      });
                    }
                  } else {
                    let filter = {
                      country_nm: {
                        $in: csvrow.map((item) => item.country_nm),
                      },
                    };

                    findCountry(COLLECTION.COUNRTY, filter, csvrow, (rows) => {
                      insetEverything(rows);
                    });
                  }
                }
              );

              async function insetEverything(rows) {
                let body = rows.map((item) => ({
                  shipping_message: item.shipping_message,
                  code: item.code,
                  shipping_days: item.shipping_days,
                  shipping_free: item.shipping_free,
                  shipping_order: item.shipping_order,
                  country_id: item.country_id,
                  status: 0,
                  created_at: new Date(),
                  created_by: user_id,
                  updated_at: new Date(),
                }));

                await insertManyBulk(
                  COLLECTION.SHIPPING_MESSAGE,
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
  SHIPPING_MESSAGE.SEND_SHIPPING_MESSAGE_TO_CSV,
  ensureAuthorisedAdmin,
  async (req, res) => {
    viewAll(
      {},
      COLLECTION.SHIPPING_MESSAGE,
      async (status, message, result) => {
        if (status && result.length) {
          let filter = {
            _id: {
              $in: result.map((item) => new ObjectId(item.country_id)),
            },
          };

          findAllCountry(COLLECTION.COUNRTY, filter, result, (rows) => {
            if (rows && rows !== null && rows.length) {
              const json2csv = new Parser({
                fields: [
                  "code",
                  "shipping_message",
                  "shipping_free",
                  "shipping_days",
                  "shipping_order",
                  "country_nm",
                ],
              });
              const csv = json2csv.parse(rows);
              res.send(csv);
            } else {
              res.send(RESPONSE.NOT_FOUND);
            }
          });
        } else {
          res.send(RESPONSE.NOT_FOUND);
        }
      }
    );
  }
);

router.post(
  API.ADMIN.SHIPPING_MESSAGE.VIEW_ALL_SHIPPING_MESSAGE,
  ensureAuthorisedAdmin,
  (req, res) => {
    viewAll(
      { status: 1 },
      COLLECTION.SHIPPING_MESSAGE,
      (status, message, result) => {
        res.json({
          status: status,
          message: message,
          result: result,
        });
      }
    );
  }
);

module.exports = router;
