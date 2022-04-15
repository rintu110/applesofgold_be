const router = require("../../../app");
const config = require("../../../config/config");
const validate = require("../../../validation");
const filesvalidate = require("../../../validation/fileValidation");
const { ensureAuthorisedAdmin } = require("../../../auth");
const {
  addStateSchema,
  editStateSchema,
  deleteStateSchema,
  assigneUnassignedSchema,
} = require("../../../schema/aogproviderbe/state");
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
  API.ADMIN.STATE.ADD_STATE,
  validate(addStateSchema),
  ensureAuthorisedAdmin,
  (req, res) => {
    const { state_nm, code, user_id } = req.body;

    const body = {
      state_nm: state_nm,
      code: code,
      status: 0,
      created_at: new Date(),
      created_by: user_id,
      updated_at: new Date(),
    };

    view(
      { state_nm: state_nm },
      COLLECTION.STATE,
      (status, message, result) => {
        if (status) {
          res.json({ status: false, message: "State already exists." });
        } else {
          insert(body, COLLECTION.STATE, (status1, message1, result1) => {
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
  API.ADMIN.STATE.VIEW_STATE,
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
        COLLECTION.STATE,
        (status, message, result) => {
          if (result[0].result.length > 0) {
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
        }
      );
    } else {
      viewInPagination(
        {
          $or: [
            {
              state_nm: {
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
        COLLECTION.STATE,
        (status, message, result) => {
          if (result[0].result.length > 0) {
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
        }
      );
    }
  }
);

router.post(
  API.ADMIN.STATE.EDIT_STATE,
  validate(editStateSchema),
  ensureAuthorisedAdmin,
  (req, res) => {
    const { state_nm, code, state_id } = req.body;

    const body = {
      $set: {
        state_nm: state_nm,
        code: code,
        updated_at: new Date(),
      },
    };

    view(
      { _id: new ObjectId(state_id) },
      COLLECTION.STATE,
      (status, message, result) => {
        if (status) {
          update(
            { _id: new ObjectId(state_id) },
            body,
            COLLECTION.STATE,
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
  API.ADMIN.STATE.DELETE_STATE,
  validate(deleteStateSchema),
  ensureAuthorisedAdmin,
  (req, res) => {
    const { state_id } = req.body;

    view(
      { _id: new ObjectId(state_id) },
      COLLECTION.STATE,
      (status, message, result) => {
        if (status) {
          deleteOne(
            { _id: new ObjectId(state_id) },
            COLLECTION.STATE,
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
  API.ADMIN.STATE.ASSIGNED_STATE,
  validate(assigneUnassignedSchema),
  ensureAuthorisedAdmin,
  async (req, res) => {
    const { state_id } = req.body;

    const _id = await state_id.map((item) => new ObjectId(item));

    let filter = { _id: { $in: _id } };

    let body = {
      $set: { status: 1 },
    };

    updateMany(filter, body, COLLECTION.STATE, (status, message, result) => {
      res.json({ status: status, message: message, result: result });
    });
  }
);

router.post(
  API.ADMIN.STATE.UNASSIGNED_STATE,
  validate(assigneUnassignedSchema),
  ensureAuthorisedAdmin,
  async (req, res) => {
    const { state_id } = req.body;

    const _id = await state_id.map((item) => new ObjectId(item));

    let filter = { _id: { $in: _id } };

    let body = {
      $set: { status: 0 },
    };

    updateMany(filter, body, COLLECTION.STATE, (status, message, result) => {
      res.json({ status: status, message: message, result: result });
    });
  }
);

router.post(
  API.ADMIN.STATE.ADD_STATE_FROM_CSV,
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
            csvrow[0].hasOwnProperty("state_nm") &&
            csvrow[0].hasOwnProperty("code")
          ) {
            const valid = csvrow.find(
              (item) => item.state_nm === "" || item.code === ""
            );

            const validIndex =
              csvrow.findIndex(
                (item) => item.state_nm === "" || item.code === ""
              ) + 2;

            if (
              valid !== undefined &&
              valid !== null &&
              valid !== "" &&
              (valid.state_nm === "" || valid.code === "")
            ) {
              res.json({
                status: false,
                message: `In line ${validIndex} some paramter is missing`,
                result: [],
              });
            } else {
              let row = [];
              let filter = {
                state_nm: {
                  $not: {
                    $in: csvrow.map((item) => ({
                      state_nm: item.state_nm,
                    })),
                  },
                },
              };

              viewAll(filter, COLLECTION.STATE, (status, message, result) => {
                if (status && result.length > 0) {
                  row = csvrow.filter(
                    (item) =>
                      !result.find((item2) => item.state_nm === item2.state_nm)
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
                      COLLECTION.STATE,
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
                    COLLECTION.STATE,
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
  API.ADMIN.STATE.SEND_STATE_TO_CSV,
  ensureAuthorisedAdmin,
  async (req, res) => {
    viewAll({}, COLLECTION.STATE, async (status, message, result) => {
      if (status && result.length > 0) {
        const json2csv = new Parser({ fields: ["state_nm", "code"] });
        const csv = json2csv.parse(result);
        res.send(csv);
      } else {
        res.send(RESPONSE.NOT_FOUND);
      }
    });
  }
);

module.exports = router;
