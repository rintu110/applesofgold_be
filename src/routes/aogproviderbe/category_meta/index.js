const router = require("../../../app");
const config = require("../../../config/config");
const validate = require("../../../validation");
const { ObjectId } = require("mongodb");
const { ensureAuthorisedAdmin } = require("../../../auth");
const {
  addCategoryMetaSchema,
  viewCategoryMetaSchema,
  editCategoryMetaSchema,
  deleteCategoryMetaSchema,
} = require("../../../schema/aogproviderbe/category_meta");
const { view } = require("../../../mongo-qury/viewOne");
const { insert } = require("../../../mongo-qury/insertOne");
const { viewInPagination } = require("../../../mongo-qury/viewInPagination");
const { update } = require("../../../mongo-qury/updateOne");
const { deleteOne } = require("../../../mongo-qury/deleteOne");

const { API, COLLECTION } = config;

router.post(
  API.ADMIN.CATEGORY_META.ADD_CATEGORY_META,
  validate(addCategoryMetaSchema),
  ensureAuthorisedAdmin,
  (req, res) => {
    const { cat_id, meta_keyword, meta_desc, meta_title, user_id } = req.body;

    const body = {
      cat_id: new ObjectId(cat_id),
      meta_keyword: meta_keyword,
      meta_desc: meta_desc,
      meta_title: meta_title,
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
  validate(viewCategoryMetaSchema),
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
      viewInPagination(
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
    const { cat_id, meta_keyword, meta_desc, meta_title, meta_id } = req.body;

    const body = {
      $set: {
        cat_id: new ObjectId(cat_id),
        meta_keyword: meta_keyword,
        meta_desc: meta_desc,
        meta_title: meta_title,
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

module.exports = router;
