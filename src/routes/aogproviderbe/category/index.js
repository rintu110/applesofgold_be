const router = require("../../../app");
const config = require("../../../config/config");
const validate = require("../../../validation");
const filesvalidate = require("../../../validation/fileValidation");
const { ObjectId } = require("mongodb");
const { ensureAuthorisedAdmin } = require("../../../auth");
const {
  addCategorySchema,
  editCategorySchema,
  deleteCategorySchema,
} = require("../../../schema/aogproviderbe/category");
const universal = require("../../../schema/universal");
const { insertManyBulk } = require("../../../mongo-qury/bulkOperation");
const {
  viewInPaginationLookUp,
} = require("../../../mongo-qury/aggregateFindAllinPagination");
const { view } = require("../../../mongo-qury/viewOne");
const { insert } = require("../../../mongo-qury/insertOne");
const { update } = require("../../../mongo-qury/updateOne");
const { deleteOne } = require("../../../mongo-qury/deleteOne");
const { updateMany } = require("../../../mongo-qury/updateMany");
const { viewAll } = require("../../../mongo-qury/findAll");
const csvtojson = require("csvtojson");
const { Parser } = require("json2csv");

const { API, COLLECTION, RESPONSE } = config;

router.post(
  API.ADMIN.CATEGORY.ADD_CATEGORY,
  validate(addCategorySchema),
  ensureAuthorisedAdmin,
  (req, res) => {
    const { category_nm, code, user_id } = req.body;

    const body = {
      category_nm: category_nm,
      category_header: [],
      category_footer: [],
      category_path: (category_nm + "-" + code + ".html")
        .split(/[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/)
        .join("-"),
      code: code,
      status: 0,
      created_at: new Date(),
      created_by: user_id,
      updated_at: new Date(),
    };

    view(
      { category_nm: category_nm },
      COLLECTION.CATEGORY,
      (status, message, result) => {
        if (status) {
          res.json({ status: false, message: RESPONSE.DATA });
        } else {
          insert(body, COLLECTION.CATEGORY, (status1, message1, result1) => {
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
  API.ADMIN.CATEGORY.VIEW_CATEGORY,
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
        COLLECTION.CATEGORY,
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
          {
            $match: {
              $or: [
                {
                  category_nm: {
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
          },
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
        COLLECTION.CATEGORY,
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
  API.ADMIN.CATEGORY.EDIT_CATEGORY,
  validate(editCategorySchema),
  ensureAuthorisedAdmin,
  (req, res) => {
    const { category_nm, code, category_id } = req.body;

    const body = {
      $set: {
        category_nm: category_nm,
        code: code,
        category_path: (category_nm + "-" + code + ".html")
          .split(/[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/)
          .join("-"),
        updated_at: new Date(),
      },
    };
    update(
      { _id: new ObjectId(category_id) },
      body,
      COLLECTION.CATEGORY,
      (status, message, result) => {
        res.json({ status: status, message: message, result: result });
      }
    );
  }
);

router.post(
  API.ADMIN.CATEGORY.DELETE_CATEGORY,
  validate(deleteCategorySchema),
  ensureAuthorisedAdmin,
  (req, res) => {
    const { category_id } = req.body;

    deleteOne(
      { _id: new ObjectId(category_id) },
      COLLECTION.CATEGORY,
      (status, message, result) => {
        res.json({ status: status, message: message, result: result });
      }
    );
  }
);

router.post(
  API.ADMIN.CATEGORY.ASSIGNED_CATEGORY,
  validate(universal.assigneUnassignedSchema),
  ensureAuthorisedAdmin,
  async (req, res) => {
    const { _id } = req.body;

    const category_id = await _id.map((item) => new ObjectId(item));

    let filter = { _id: { $in: category_id } };

    let body = {
      $set: { status: 1 },
    };

    updateMany(filter, body, COLLECTION.CATEGORY, (status, message, result) => {
      res.json({ status: status, message: message, result: result });
    });
  }
);

router.post(
  API.ADMIN.CATEGORY.UNASSIGNED_CATEGORY,
  validate(universal.assigneUnassignedSchema),
  ensureAuthorisedAdmin,
  async (req, res) => {
    const { _id } = req.body;

    const category_id = await _id.map((item) => new ObjectId(item));

    let filter = { _id: { $in: category_id } };

    let body = {
      $set: { status: 0 },
    };

    updateMany(filter, body, COLLECTION.CATEGORY, (status, message, result) => {
      res.json({ status: status, message: message, result: result });
    });
  }
);

router.post(
  API.ADMIN.CATEGORY.VIEW_ALL_CATEGORY,
  validate(universal.searchAll),
  ensureAuthorisedAdmin,
  (req, res) => {
    const { searchKeyWord } = req.body;

    viewAll(
      {
        category_nm: { $regex: searchKeyWord },
        status: 1,
      },
      COLLECTION.CATEGORY,
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

router.post(
  API.ADMIN.CATEGORY.ADD_CATEGORY_FROM_CSV,
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
            csvrow[0].hasOwnProperty("category_nm") &&
            csvrow[0].hasOwnProperty("code")
          ) {
            const valid = csvrow.find(
              (item) => item.category_nm === "" || item.code === ""
            );

            const validIndex =
              csvrow.findIndex(
                (item) => item.category_nm === "" || item.code === ""
              ) + 2;

            if (
              valid !== undefined &&
              valid !== null &&
              valid !== "" &&
              (valid.category_nm === "" || valid.code === "")
            ) {
              res.json({
                status: false,
                message: `In line ${validIndex} some paramter is missing`,
                result: [],
              });
            } else {
              let row = [];
              let filter = {
                category_nm: {
                  $in: csvrow.map((item) => item.category_nm),
                },
              };

              viewAll(
                filter,
                COLLECTION.CATEGORY,
                (status, message, result) => {
                  if (status && result.length > 0) {
                    row = csvrow.filter(
                      (item) =>
                        !result.find(
                          (item2) => item.category_nm === item2.category_nm
                        )
                    );

                    if (
                      row !== undefined &&
                      row !== null &&
                      row !== "" &&
                      row.length > 0
                    ) {
                      let body = row.map((items) => ({
                        category_nm: items.category_nm,
                        code: items.code,
                        status: 0,
                        category_header: [],
                        category_footer: [],
                        category_path: (
                          items.category_nm +
                          "-" +
                          items.code +
                          ".html"
                        )
                          .split(" ")
                          .join("-"),
                        created_at: new Date(),
                        created_by: user_id,
                        updated_at: new Date(),
                      }));

                      insertManyBulk(
                        COLLECTION.CATEGORY,
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
                      category_nm: items.category_nm,
                      code: items.code,
                      status: 0,
                      category_path: (
                        items.category_nm +
                        "-" +
                        items.code +
                        ".html"
                      )
                        .split(" ")
                        .join("-"),
                      category_header: [],
                      category_footer: [],
                      created_at: new Date(),
                      created_by: user_id,
                      updated_at: new Date(),
                    }));

                    insertManyBulk(
                      COLLECTION.CATEGORY,
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
              );
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
  API.ADMIN.CATEGORY.SEND_CATEGORY_DATA_TO_CSV,
  ensureAuthorisedAdmin,
  async (req, res) => {
    viewAll({}, COLLECTION.CATEGORY, async (status, message, result) => {
      if (status && result.length > 0) {
        const json2csv = new Parser({ fields: ["category_nm", "code"] });
        const csv = json2csv.parse(result);
        res.send(csv);
      } else {
        res.send(RESPONSE.NOT_FOUND);
      }
    });
  }
);

module.exports = router;
