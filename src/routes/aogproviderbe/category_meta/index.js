const router = require("../../../app");
const config = require("../../../config/config");
const validate = require("../../../validation");
const { ObjectId } = require("mongodb");
const { ensureAuthorisedAdmin } = require("../../../auth");
const filesvalidate = require("../../../validation/fileValidation");
const {
  addCategoryMetaSchema,
  editCategoryMetaSchema,
  deleteCategoryMetaSchema,
} = require("../../../schema/aogproviderbe/category_meta");
const universal = require("../../../schema/universal");
const { view } = require("../../../mongo-qury/viewOne");
const { insert } = require("../../../mongo-qury/insertOne");
const {
  viewInPaginationLookUp,
} = require("../../../mongo-qury/aggregateFindAllinPagination");
const { update } = require("../../../mongo-qury/updateOne");
const { deleteOne } = require("../../../mongo-qury/deleteOne");
const { viewAll } = require("../../../mongo-qury/findAll");
const { insertManyBulk } = require("../../../mongo-qury/bulkOperation");
const csvtojson = require("csvtojson");
const { Parser } = require("json2csv");

const { API, COLLECTION, RESPONSE } = config;

router.post(
  API.ADMIN.CATEGORY_META.ADD_CATEGORY_META,
  validate(addCategoryMetaSchema),
  ensureAuthorisedAdmin,
  (req, res) => {
    const {
      cat_id,
      meta_keyword,
      meta_desc,
      meta_title,
      meta_content,
      user_id,
    } = req.body;

    const body = {
      cat_id: new ObjectId(cat_id),
      meta_keyword: meta_keyword,
      meta_desc: meta_desc,
      meta_title: meta_title,
      meta_content: meta_content,
      created_by: user_id,
      created_at: new Date(),
      updated_at: new Date(),
    };

    view(
      { meta_title: meta_title },
      COLLECTION.CATEGORY_META,
      (status, message, result) => {
        if (status) {
          res.json({ status: false, message: "Category meta already exists." });
        } else {
          insert(
            body,
            COLLECTION.CATEGORY_META,
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
  API.ADMIN.CATEGORY_META.VIEW_CATEGORY_META,
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
        {},
        {
          from: COLLECTION.CATEGORY,
          localField: "cat_id",
          foreignField: "_id",
          as: "category",
        },
        startingAfter,
        limit,
        COLLECTION.CATEGORY_META,
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
      viewInPaginationLookUp(
        {
          $or: [
            {
              meta_keyword: {
                $regex: searchKeyWord,
                $options: "i",
              },
            },
            {
              meta_desc: {
                $regex: searchKeyWord,
                $options: "i",
              },
            },
            {
              meta_title: {
                $regex: searchKeyWord,
                $options: "i",
              },
            },
          ],
        },
        {
          from: COLLECTION.CATEGORY,
          localField: "cat_id",
          foreignField: "_id",
          as: "category",
        },
        startingAfter,
        limit,
        COLLECTION.CATEGORY_META,
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
  API.ADMIN.CATEGORY_META.EDIT_CATEGORY_META,
  validate(editCategoryMetaSchema),
  ensureAuthorisedAdmin,
  (req, res) => {
    const {
      cat_id,
      meta_keyword,
      meta_desc,
      meta_title,
      meta_content,
      meta_id,
    } = req.body;

    const body = {
      $set: {
        cat_id: new ObjectId(cat_id),
        meta_keyword: meta_keyword,
        meta_desc: meta_desc,
        meta_title: meta_title,
        meta_content: meta_content,
        updated_at: new Date(),
      },
    };

    view(
      { _id: new ObjectId(meta_id) },
      COLLECTION.CATEGORY_META,
      (status, message, result) => {
        if (status) {
          update(
            { _id: new ObjectId(meta_id) },
            body,
            COLLECTION.CATEGORY_META,
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
  API.ADMIN.CATEGORY_META.DELETE_CATEGORY_META,
  validate(deleteCategoryMetaSchema),
  ensureAuthorisedAdmin,
  (req, res) => {
    const { meta_id } = req.body;

    view(
      { _id: new ObjectId(meta_id) },
      COLLECTION.CATEGORY_META,
      (status, message, result) => {
        if (status) {
          deleteOne(
            { _id: new ObjectId(meta_id) },
            COLLECTION.CATEGORY_META,
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
  API.ADMIN.CATEGORY_META.ADD_META_FROM_CSV,
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
            csvrow[0].hasOwnProperty("meta_desc") &&
            csvrow[0].hasOwnProperty("meta_title") &&
            csvrow[0].hasOwnProperty("meta_keyword") &&
            csvrow[0].hasOwnProperty("meta_content")
          ) {
            const valid = csvrow.find(
              (item) =>
                item.meta_title === "" ||
                item.meta_keyword === "" ||
                item.meta_desc === "" ||
                item.meta_content === ""
            );

            const validIndex =
              csvrow.findIndex(
                (item) =>
                  item.meta_title === "" ||
                  item.meta_keyword === "" ||
                  item.meta_desc === "" ||
                  item.meta_content === ""
              ) + 2;

            if (
              valid !== undefined &&
              valid !== null &&
              valid !== "" &&
              (valid.meta_title === "" ||
                valid.meta_keyword === "" ||
                valid.meta_desc === "" ||
                valid.meta_content === "")
            ) {
              res.json({
                status: false,
                message: `In line ${validIndex} some paramter is missing`,
                result: [],
              });
            } else {
              let row = [];
              let filter = {
                meta_title: {
                  $not: {
                    $in: csvrow.map((item) => ({
                      meta_title: item.meta_title,
                    })),
                  },
                },
              };

              viewAll(
                filter,
                COLLECTION.CATEGORY_META,
                async (status, message, result) => {
                  if (status && result.length > 0) {
                    row = csvrow.filter(
                      (item) =>
                        !result.find(
                          (item2) => item.meta_title === item2.meta_title
                        )
                    );

                    if (
                      row !== undefined &&
                      row !== null &&
                      row !== "" &&
                      row.length > 0
                    ) {
                      let filter = {
                        category_nm: {
                          $not: {
                            $in: row.map((item) => ({
                              category_nm: item.category_nm,
                            })),
                          },
                        },
                      };

                      viewAll(
                        filter,
                        COLLECTION.CATEGORY,
                        async (status, message, result) => {
                          if (
                            result !== null &&
                            result !== undefined &&
                            result !== "" &&
                            result.length > 0
                          ) {
                            row = row.map((item) => {
                              if (
                                result.find(
                                  (item2) =>
                                    item.category_nm === item2.category_nm
                                ) !== undefined
                              ) {
                                return {
                                  meta_title: item.meta_title,
                                  meta_keyword: item.meta_keyword,
                                  meta_desc: item.meta_desc,
                                  meta_content: item.meta_content,
                                  cat_id: result.find(
                                    (item2) =>
                                      item.category_nm === item2.category_nm
                                  )._id,
                                  created_at: new Date(),
                                  created_by: user_id,
                                  updated_at: new Date(),
                                };
                              } else {
                                return {
                                  meta_title: item.meta_title,
                                  meta_keyword: item.meta_keyword,
                                  meta_desc: item.meta_desc,
                                  meta_content: item.meta_content,
                                  cat_id: 0,
                                  created_at: new Date(),
                                  created_by: user_id,
                                  updated_at: new Date(),
                                };
                              }
                            });

                            await insertManyBulk(
                              COLLECTION.CATEGORY_META,
                              row,
                              (status, message, result) => {
                                res.json({
                                  status: status,
                                  message: message,
                                  result: result,
                                });
                              }
                            );
                          } else {
                            let body = row.map((item) => ({
                              meta_title: item.meta_title,
                              meta_keyword: item.meta_keyword,
                              meta_desc: item.meta_desc,
                              meta_content: item.meta_content,
                              cat_id: 0,
                              created_at: new Date(),
                              created_by: user_id,
                              updated_at: new Date(),
                            }));

                            await insertManyBulk(
                              COLLECTION.CATEGORY_META,
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
                    } else {
                      res.json({
                        status: false,
                        message: RESPONSE.DATA,
                        result: [],
                      });
                    }
                  } else {
                    let filter = {
                      category_nm: {
                        $not: {
                          $in: csvrow.map((item) => ({
                            category_nm: item.category_nm,
                          })),
                        },
                      },
                    };

                    viewAll(
                      filter,
                      COLLECTION.CATEGORY,
                      async (status, message, result) => {
                        if (
                          result !== null &&
                          result !== undefined &&
                          result !== "" &&
                          result.length > 0
                        ) {
                          row = csvrow.map((item) => {
                            if (
                              result.find(
                                (item2) =>
                                  item.category_nm === item2.category_nm
                              ) !== undefined
                            ) {
                              return {
                                meta_title: item.meta_title,
                                meta_keyword: item.meta_keyword,
                                meta_desc: item.meta_desc,
                                meta_content: item.meta_content,
                                cat_id: result.find(
                                  (item2) =>
                                    item.category_nm === item2.category_nm
                                )._id,
                                created_at: new Date(),
                                created_by: user_id,
                                updated_at: new Date(),
                              };
                            } else {
                              return {
                                meta_title: item.meta_title,
                                meta_keyword: item.meta_keyword,
                                meta_desc: item.meta_desc,
                                meta_content: item.meta_content,
                                cat_id: 0,
                                created_at: new Date(),
                                created_by: user_id,
                                updated_at: new Date(),
                              };
                            }
                          });

                          await insertManyBulk(
                            COLLECTION.CATEGORY_META,
                            row,
                            (status, message, result) => {
                              res.json({
                                status: status,
                                message: message,
                                result: result,
                              });
                            }
                          );
                        } else {
                          let body = csvrow.map((item) => ({
                            meta_title: item.meta_title,
                            meta_keyword: item.meta_keyword,
                            meta_desc: item.meta_desc,
                            meta_content: item.meta_content,
                            cat_id: 0,
                            created_at: new Date(),
                            created_by: user_id,
                            updated_at: new Date(),
                          }));

                          await insertManyBulk(
                            COLLECTION.CATEGORY_META,
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
  API.ADMIN.CATEGORY_META.SEND_META_TO_CSV,
  ensureAuthorisedAdmin,
  async (req, res) => {
    viewAll({}, COLLECTION.CATEGORY_META, async (status, message, result1) => {
      if (status && result1.length > 0) {
        let row = [];

        let filter = {
          _id: {
            $not: {
              $in: result1.map((item) => ({
                _id: new ObjectId(item.cat_id),
              })),
            },
          },
        };

        viewAll(
          filter,
          COLLECTION.CATEGORY,
          async (status, message, result) => {
            if (
              result !== null &&
              result !== undefined &&
              result !== "" &&
              result.length > 0
            ) {
              row = result1.map((item) => {
                if (
                  result.find(
                    (item2) => item.cat_id.toString() == item2._id.toString()
                  ) !== undefined
                ) {
                  return {
                    meta_title: item.meta_title,
                    meta_keyword: item.meta_keyword,
                    meta_desc: item.meta_desc,
                    meta_content: item.meta_content,
                    category_nm: result.find(
                      (item2) => item.cat_id.toString() === item2._id.toString()
                    ).category_nm,
                  };
                } else {
                  return {
                    meta_title: item.meta_title,
                    meta_keyword: item.meta_keyword,
                    meta_desc: item.meta_desc,
                    meta_content: item.meta_content,
                    category_nm: "",
                  };
                }
              });

              const json2csv = new Parser({
                fields: [
                  "category_nm",
                  "meta_desc",
                  "meta_title",
                  "meta_keyword",
                  "meta_content",
                ],
              });
              const csv = json2csv.parse(row);
              res.send(csv);
            } else {
              row = result1.map((item) => ({
                meta_title: item.meta_title,
                meta_keyword: item.meta_keyword,
                meta_desc: item.meta_desc,
                meta_content: item.meta_content,
                category_nm: "",
              }));

              const json2csv = new Parser({
                fields: [
                  "category_nm",
                  "meta_desc",
                  "meta_title",
                  "meta_keyword",
                  "meta_content",
                ],
              });
              const csv = json2csv.parse(row);
              res.send(csv);
            }
          }
        );
      } else {
        res.send(RESPONSE.NOT_FOUND);
      }
    });
  }
);

module.exports = router;
