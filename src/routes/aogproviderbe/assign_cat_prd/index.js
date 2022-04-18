const router = require("../../../app");
const config = require("../../../config/config");
const validate = require("../../../validation");
const { ensureAuthorisedAdmin } = require("../../../auth");
const filesvalidate = require("../../../validation/fileValidation");
const assigncatprd = require("../../../schema/aogproviderbe/assign_cat_prd");
const universal = require("../../../schema/universal");
const { view } = require("../../../mongo-qury/viewOne");
const { insert } = require("../../../mongo-qury/insertOne");
const {
  viewInPaginationLookUp,
} = require("../../../mongo-qury/aggregateFindAllinPagination");
const { update } = require("../../../mongo-qury/updateOne");
const { deleteOne } = require("../../../mongo-qury/deleteOne");
const { viewAll } = require("../../../mongo-qury/findAll");
const { updateMany } = require("../../../mongo-qury/updateMany");
const { insertManyBulk } = require("../../../mongo-qury/bulkOperation");
const {
  findCategory,
  findProduct,
  findAllCategory,
  findAllProduct,
} = require("../../../modules/csv_modules");
const csvtojson = require("csvtojson");
const { Parser } = require("json2csv");
const { ObjectId } = require("mongodb");

const { API, COLLECTION, RESPONSE } = config;

router.post(
  API.ADMIN.ASSIGN_CAT_PRD.ADD_ASSIGN_CAT_PRD,
  validate(assigncatprd.addAssignCategoryProductSchema),
  ensureAuthorisedAdmin,
  (req, res) => {
    const { prd_id, cat_id, user_id } = req.body;

    const body = {
      prd_id: new ObjectId(prd_id),
      cat_id: new ObjectId(cat_id),
      created_by: user_id,
      created_at: new Date(),
      updated_at: new Date(),
    };

    view(
      { prd_id: new ObjectId(prd_id), cat_id: new ObjectId(cat_id) },
      COLLECTION.ASSIGN_CAT_PRD,
      (status, message, result) => {
        if (status) {
          res.json({
            status: false,
            message: RESPONSE.DATA,
          });
        } else {
          insert(
            body,
            COLLECTION.ASSIGN_CAT_PRD,
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
  API.ADMIN.ASSIGN_CAT_PRD.VIEW_ASSIGN_CAT_PRD,
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
            $lookup: {
              from: COLLECTION.CATEGORY,
              localField: "cat_id",
              foreignField: "_id",
              as: "category",
            },
          },
          { $unwind: "$category" },
          {
            $lookup: {
              from: COLLECTION.PRODUCT,
              localField: "prd_id",
              foreignField: "_id",
              as: "product",
            },
          },
          { $unwind: "$product" },
          {
            $project: {
              category_nm: "$category.category_nm",
              product_nm: "$product.product_nm",
              status: 1,
              prd_id: 1,
              cat_id: 1,
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
          { $unwind: "$total" },
        ],
        COLLECTION.ASSIGN_CAT_PRD,
        (status, message, result) => {
          if (result.length) {
            if (result[0].result.length) {
              res.json({
                status: status,
                message: message,
                result: result[0].result,
                total: result[0].total.total,
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
            $lookup: {
              from: COLLECTION.CATEGORY,
              localField: "cat_id",
              foreignField: "_id",
              as: "category",
            },
          },
          { $unwind: "$category" },
          {
            $lookup: {
              from: COLLECTION.PRODUCT,
              localField: "prd_id",
              foreignField: "_id",
              as: "product",
            },
          },
          { $unwind: "$product" },
          {
            $match: {
              $or: [
                {
                  "category.category_nm": {
                    $regex: searchKeyWord,
                    $options: "i",
                  },
                },
                {
                  "product.product_nm": {
                    $regex: searchKeyWord,
                    $options: "i",
                  },
                },
              ],
            },
          },
          {
            $project: {
              category_nm: "$category.category_nm",
              product_nm: "$product.product_nm",
              status: 1,
              prd_id: 1,
              cat_id: 1,
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
          { $unwind: "$total" },
        ],
        COLLECTION.ASSIGN_CAT_PRD,
        (status, message, result) => {
          if (result[0].result.length > 0) {
            res.json({
              status: status,
              message: message,
              result: result[0].result,
              total: result[0].total.total,
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
  API.ADMIN.ASSIGN_CAT_PRD.EDIT_ASSIGN_CAT_PRD,
  validate(assigncatprd.editAssignCategoryProductSchema),
  ensureAuthorisedAdmin,
  (req, res) => {
    const { prd_id, cat_id, assign_id } = req.body;

    const body = {
      $set: {
        prd_id: new ObjectId(prd_id),
        cat_id: new ObjectId(cat_id),
        updated_at: new Date(),
      },
    };

    view(
      { _id: new ObjectId(assign_id) },
      COLLECTION.ASSIGN_CAT_PRD,
      (status, message, result) => {
        if (status) {
          update(
            { _id: new ObjectId(assign_id) },
            body,
            COLLECTION.ASSIGN_CAT_PRD,
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
  API.ADMIN.ASSIGN_CAT_PRD.DELETE_ASSIGN_CAT_PRD,
  validate(assigncatprd.deleteAssignCategoryProductSchema),
  ensureAuthorisedAdmin,
  (req, res) => {
    const { assign_id } = req.body;

    view(
      { _id: new ObjectId(assign_id) },
      COLLECTION.ASSIGN_CAT_PRD,
      (status, message, result) => {
        if (status) {
          deleteOne(
            { _id: new ObjectId(assign_id) },
            COLLECTION.ASSIGN_CAT_PRD,
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
  API.ADMIN.ASSIGN_CAT_PRD.ASSIGNED_ASSIGN_CAT_PRD,
  validate(universal.assigneUnassignedSchema),
  ensureAuthorisedAdmin,
  async (req, res) => {
    const { _id } = req.body;

    const assign_id = await _id.map((item) => new ObjectId(item));

    let filter = { _id: { $in: assign_id } };

    let body = {
      $set: { status: 1 },
    };

    updateMany(
      filter,
      body,
      COLLECTION.ASSIGN_CAT_PRD,
      (status, message, result) => {
        res.json({ status: status, message: message, result: result });
      }
    );
  }
);

router.post(
  API.ADMIN.ASSIGN_CAT_PRD.UNASSIGNED_ASSIGN_CAT_PRD,
  validate(universal.assigneUnassignedSchema),
  ensureAuthorisedAdmin,
  async (req, res) => {
    const { _id } = req.body;

    const assign_id = await _id.map((item) => new ObjectId(item));

    let filter = { _id: { $in: assign_id } };

    let body = {
      $set: { status: 0 },
    };

    updateMany(
      filter,
      body,
      COLLECTION.ASSIGN_CAT_PRD,
      (status, message, result) => {
        res.json({ status: status, message: message, result: result });
      }
    );
  }
);

router.post(
  API.ADMIN.ASSIGN_CAT_PRD.ADD_ASSIGN_CAT_PRD_FROM_CSV,
  filesvalidate(universal.importAndExportCsv),
  ensureAuthorisedAdmin,
  async (req, res) => {
    const { user_id } = req.body;
    const { csv } = req.files;

    await csvtojson()
      .fromString(csv.data.toString("utf8"))
      .then(async (csvrow) => {
        if (csvrow.length > 0) {
          if (
            csvrow[0].hasOwnProperty("category_nm") &&
            csvrow[0].hasOwnProperty("product_nm")
          ) {
            const valid = csvrow.find(
              (item) => item.product_nm === "" || item.category_nm === ""
            );

            const validIndex =
              csvrow.findIndex(
                (item) => item.product_nm === "" || item.category_nm === ""
              ) + 2;

            if (
              valid !== undefined &&
              valid !== null &&
              valid !== "" &&
              (valid.product_nm === "" || valid.category_nm === "")
            ) {
              res.json({
                status: false,
                message: `In line ${validIndex} some paramter is missing`,
                result: [],
              });
            } else {
              var row = [];

              await viewInPaginationLookUp(
                [
                  {
                    $lookup: {
                      from: COLLECTION.CATEGORY,
                      localField: "cat_id",
                      foreignField: "_id",
                      as: "category",
                    },
                  },
                  { $unwind: "$category" },
                  {
                    $lookup: {
                      from: COLLECTION.PRODUCT,
                      localField: "prd_id",
                      foreignField: "_id",
                      as: "product",
                    },
                  },
                  { $unwind: "$product" },
                  {
                    $match: {
                      $and: [
                        {
                          "category.category_nm": {
                            $in: csvrow.map((item) => item.category_nm),
                          },
                        },
                        {
                          "product.product_nm": {
                            $in: csvrow.map((item) => item.product_nm),
                          },
                        },
                      ],
                    },
                  },
                  {
                    $project: {
                      category_nm: "$category.category_nm",
                      product_nm: "$product.product_nm",
                    },
                  },
                ],
                COLLECTION.ASSIGN_CAT_PRD,
                async (status, message, result) => {
                  if (status && result.length) {
                    row = csvrow.filter(
                      (item) =>
                        !result.find(
                          (item2) =>
                            item.product_nm === item2.product_nm &&
                            item.category_nm === item2.category_nm
                        )
                    );
                    if (
                      row !== undefined &&
                      row !== null &&
                      row !== "" &&
                      row.length
                    ) {
                      let filter = {
                        product_nm: {
                          $in: row.map((item) => item.product_nm),
                        },
                      };

                      let filter2 = {
                        category_nm: {
                          $in: row.map((item) => item.category_nm),
                        },
                      };

                      findCategory(
                        COLLECTION.CATEGORY,
                        filter2,
                        row,
                        (rows) => {
                          findProduct(
                            COLLECTION.PRODUCT,
                            filter,
                            rows,
                            (dbrows) => {
                              insetEverything(dbrows);
                            }
                          );
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
                    let filter = {
                      product_nm: {
                        $in: csvrow.map((item) => item.product_nm),
                      },
                    };

                    let filter2 = {
                      category_nm: {
                        $in: csvrow.map((item) => item.category_nm),
                      },
                    };

                    findCategory(
                      COLLECTION.CATEGORY,
                      filter2,
                      csvrow,
                      (rows) => {
                        findProduct(
                          COLLECTION.PRODUCT,
                          filter,
                          rows,
                          (dbrows) => {
                            insetEverything(dbrows);
                          }
                        );
                      }
                    );
                  }
                }
              );

              async function insetEverything(row) {
                if (row !== undefined && row !== null && row.length) {
                  row = row.map((item) => ({
                    prd_id: item.prd_id,
                    cat_id: item.cat_id,
                    created_by: user_id,
                    status: 0,
                    created_at: new Date(),
                    updated_at: new Date(),
                  }));

                  await insertManyBulk(
                    COLLECTION.ASSIGN_CAT_PRD,
                    row,
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
  API.ADMIN.ASSIGN_CAT_PRD.SEND_ASSIGN_CAT_PRD_TO_CSV,
  ensureAuthorisedAdmin,
  async (req, res) => {
    viewAll({}, COLLECTION.ASSIGN_CAT_PRD, (status, message, result) => {
      if (status && result.length) {
        let filter = {
          _id: {
            $in: result.map((item) => new ObjectId(item.cat_id)),
          },
        };

        let filter2 = {
          _id: {
            $in: result.map((item) => new ObjectId(item.prd_id)),
          },
        };

        findAllCategory(COLLECTION.CATEGORY, filter, result, (rows) => {
          findAllProduct(COLLECTION.PRODUCT, filter2, rows, (csvrows) => {
            if (csvrows !== undefined && csvrows !== null && csvrows.length) {
              const json2csv = new Parser({
                fields: ["category_nm", "product_nm"],
              });

              const csv = json2csv.parse(csvrows);

              res.send(csv);
            } else {
              res.send(RESPONSE.NOT_FOUND);
            }
          });
        });
      } else {
        res.send(RESPONSE.NOT_FOUND);
      }
    });
  }
);

module.exports = router;
