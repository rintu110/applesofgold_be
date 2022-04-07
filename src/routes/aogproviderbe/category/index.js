const router = require("../../../app");
const config = require("../../../config/config");
const validate = require("../../../validation");
const { ObjectId } = require("mongodb");
const { ensureAuthorisedAdmin } = require("../../../auth");
const {
  addCategorySchema,
  viewCategorySchema,
  editCategorySchema,
  deleteCategorySchema,
  assigneUnassignedSchema,
} = require("../../../schema/aogproviderbe/category");
const { view } = require("../../../mongo-qury/viewOne");
const { insert } = require("../../../mongo-qury/insertOne");
const { viewInPagination } = require("../../../mongo-qury/viewInPagination");
const { update } = require("../../../mongo-qury/updateOne");
const { deleteOne } = require("../../../mongo-qury/deleteOne");
const { updateMany } = require("../../../mongo-qury/updateMany");
const { viewAll } = require("../../../mongo-qury/findAll");

const { API, COLLECTION } = config;

router.post(
  API.ADMIN.CATEGORY.ADD_CATEGORY,
  validate(addCategorySchema),
  ensureAuthorisedAdmin,
  (req, res) => {
    const { category_nm, code, user_id, page_content, parent_id } = req.body;

    const body = {
      category_nm: category_nm,
      code: code,
      status: 0,
      page_content: page_content,
      parent_id: parent_id === 0 ? parent_id : new ObjectId(parent_id),
      created_at: new Date(),
      created_by: user_id,
      updated_at: new Date(),
    };

    view(
      { category_nm: category_nm },
      COLLECTION.CATEGORY,
      (status, message, result) => {
        if (status) {
          res.json({ status: false, message: "Category already exists." });
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
  validate(viewCategorySchema),
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
        COLLECTION.CATEGORY,
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
            {
              page_content: {
                $regex: searchKeyWord,
                $options: "i",
              },
            },
          ],
        },
        startingAfter,
        limit,
        COLLECTION.CATEGORY,
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
  API.ADMIN.CATEGORY.EDIT_CATEGORY,
  validate(editCategorySchema),
  ensureAuthorisedAdmin,
  (req, res) => {
    const { category_nm, code, parent_id, page_content, category_id } =
      req.body;

    const body = {
      $set: {
        category_nm: category_nm,
        parent_id: parent_id === 0 ? parent_id : new ObjectId(parent_id),
        page_content: page_content,
        code: code,
        updated_at: new Date(),
      },
    };

    view(
      { _id: new ObjectId(category_id) },
      COLLECTION.CATEGORY,
      (status, message, result) => {
        if (status) {
          update(
            { _id: new ObjectId(category_id) },
            body,
            COLLECTION.CATEGORY,
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
  API.ADMIN.CATEGORY.DELETE_CATEGORY,
  validate(deleteCategorySchema),
  ensureAuthorisedAdmin,
  (req, res) => {
    const { category_id } = req.body;

    view(
      { _id: new ObjectId(category_id) },
      COLLECTION.CATEGORY,
      (status, message, result) => {
        if (status) {
          deleteOne(
            { _id: new ObjectId(category_id) },
            COLLECTION.CATEGORY,
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
  API.ADMIN.CATEGORY.ASSIGNED_CATEGORY,
  validate(assigneUnassignedSchema),
  ensureAuthorisedAdmin,
  async (req, res) => {
    const { category_id } = req.body;

    const _id = await category_id.map((item) => new ObjectId(item));

    let filter = { _id: { $in: _id } };

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
  validate(assigneUnassignedSchema),
  ensureAuthorisedAdmin,
  async (req, res) => {
    const { category_id } = req.body;

    const _id = await category_id.map((item) => new ObjectId(item));

    let filter = { _id: { $in: _id } };

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
  ensureAuthorisedAdmin,
  (req, res) => {
    viewAll({}, COLLECTION.CATEGORY, (status, message, result) => {
      res.json({
        status: status,
        message: message,
        result: result,
      });
    });
  }
);

module.exports = router;
