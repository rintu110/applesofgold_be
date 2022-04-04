const router = require("../../../app");
const config = require("../../../config/config");
const validate = require("../../../validation");
const { ensureAuthorisedAdmin } = require("../../../auth");
const {
  addStateSchema,
  viewStateSchema,
  editStateSchema,
  deleteStateSchema,
  assigneUnassignedSchema,
} = require("../../../schema/aogproviderbe/state");
const { view } = require("../../../mongo-qury/viewOne");
const { insert } = require("../../../mongo-qury/insertOne");
const { viewInPagination } = require("../../../mongo-qury/viewInPagination");
const { ObjectId } = require("mongodb");
const { update } = require("../../../mongo-qury/updateOne");
const { deleteOne } = require("../../../mongo-qury/deleteOne");
const { updateMany } = require("../../../mongo-qury/updateMany");
const { API, COLLECTION } = config;

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
  validate(viewStateSchema),
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

module.exports = router;
