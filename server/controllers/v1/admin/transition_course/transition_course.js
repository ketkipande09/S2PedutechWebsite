const sequelize = require('sequelize');
const Transition_course = require('../../../../models').Transition_course;
const db = require('../../../../models');
const moment = require('moment');
const fs = require('fs');
const {
  OPTIONS,
  generateResponse,
} = require('../../../../config/options/global.options');
const MESSAGES = require('../../../../config/options/messages.options');

const resCode = MESSAGES.resCode;
const Op = sequelize.Op;

const courseObj = {
  //** Create transition course  */
  createTransitionCourse: async (req, res) => {
    try {
      let query = {
        where: {
          [Op.or]: [{ course: req.body.course.toLowerCase() }],
        },
      };
      /** check if Event exist or not */
      let existingCourse = await Transition_course.findOne(query);

      if (existingCourse) {
        let errors = MESSAGES.apiErrorStrings.Data_EXISTS('This Course');
        return res
          .status(resCode.HTTP_BAD_REQUEST)
          .json(
            generateResponse(
              resCode.HTTP_BAD_REQUEST,
              errors,
              MESSAGES.errorTypes.OAUTH_EXCEPTION
            )
          );
      }
      var createObj = new Transition_course();
      var courseObj = req.body;
      if (req.file) {
        courseObj.image = req.file.filename;
      }
      Object.keys(courseObj).forEach((key, index) => {
        createObj[key] = courseObj[key];
      });
      let course = await createObj.save();
      return res.status(resCode.HTTP_OK).json(
        generateResponse(resCode.HTTP_OK, {
          message: MESSAGES.apiSuccessStrings.ADDED(`This course is`),
        })
      );
    } catch (e) {
      const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
      res
        .status(resCode.HTTP_INTERNAL_SERVER_ERROR)
        .json(generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors));
      throw new Error(e);
    }
  },
  //** Event listing */
  getTransitionCourse: async (req, res) => {
    try {
      let offset = req.query.page || 1;
      offset = offset - 1;
      offset = offset * req.query.pagesize || 0;
      let limit = req.query.pagesize || 10;
      let whereQuery;
      if (req.query.search) {
        whereQuery = {
          [Op.or]: [
            { course: { [Op.substring]: req.query.search } },
            { description: { [Op.substring]: req.query.search } },
          ],
        };
      }
      let { count, rows } = await Transition_course.findAndCountAll({
        where: whereQuery,
        offset: parseInt(offset),
        limit: parseInt(limit),
      });
      if (!rows) {
        return res.status(resCode.HTTP_BAD_REQUEST).json(
          generateResponse(resCode.HTTP_BAD_REQUEST, {
            message: MESSAGES.apiSuccessStrings.Transition_course('empty'),
          })
        );
      }
      let payload = {
        count: count,
        Transition_course: rows,
      };
      return res
        .status(resCode.HTTP_OK)
        .json(generateResponse(resCode.HTTP_OK, payload));
    } catch (e) {
      const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
      res
        .status(resCode.HTTP_INTERNAL_SERVER_ERROR)
        .json(generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors));
      throw new Error(e);
    }
  },
  //** Update Event*/
  updateTransitionCourse: async (req, res) => {
    try {
      let id = req.params.id;
      if (!id) {
        const error = MESSAGES.apiErrorStrings.INVALID_REQUEST;
        return res
          .status(resCode.HTTP_BAD_REQUEST)
          .json(generateResponse(resCode.HTTP_BAD_REQUEST, error));
      }

      let query = {
        where: {
          id: req.params.id || req.query.id,
        },
      };

      let existingCourse = await Transition_course.findOne(query);
      if (!existingCourse) {
        if (req.file.filename) {
          let path = `assets/image/${req.file.filename}`;
          if (fs.existsSync(path)) {
            fs.unlinkSync(path);
          }
        }
        let errors = MESSAGES.apiSuccessStrings.DATA_NOT_EXISTS('This Course');
        return res
          .status(resCode.HTTP_BAD_REQUEST)
          .json(
            generateResponse(
              resCode.HTTP_BAD_REQUEST,
              errors,
              MESSAGES.errorTypes.OAUTH_EXCEPTION
            )
          );
      } else {
        var courseObject = req.body;
        if (req.file) {
          if (existingCourse.image && existingCourse.image != 'undefined') {
            let path = `assets/courseImage/${
              existingCourse.image.split('image/courseImage/')[1]
            }`;
            if (fs.existsSync(path)) {
              fs.unlinkSync(path);
            }
          }
          courseObject.image = req.file.filename;
        }
        Object.keys(courseObject).forEach((key, index) => {
          existingCourse[key] = courseObject[key];
        });
        await existingCourse.save();
        return res.json(
          generateResponse(resCode.HTTP_OK, {
            message: MESSAGES.apiSuccessStrings.UPDATE('This Course'),
          })
        );
      }
    } catch (e) {
      const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
      res
        .status(resCode.HTTP_INTERNAL_SERVER_ERROR)
        .json(generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors));
      throw new Error(e);
    }
  },
  //** get Transition by its id */
  getTransitionById: async (req, res) => {
    try {
      let id = req.params.id;
      if (!id) {
        const error = MESSAGES.apiErrorStrings.INVALID_REQUEST;
        return res
          .status(resCode.HTTP_BAD_REQUEST)
          .json(generateResponse(resCode.HTTP_BAD_REQUEST, error));
      }
      let query = {
        where: {
          id: id,
        },
      };
      let existingCourse = await Transition_course.findOne(query);
      if (!existingCourse) {
        let errors = MESSAGES.apiSuccessStrings.DATA_NOT_EXISTS('This Course');
        return res
          .status(resCode.HTTP_BAD_REQUEST)
          .json(
            generateResponse(
              resCode.HTTP_BAD_REQUEST,
              errors,
              MESSAGES.errorTypes.OAUTH_EXCEPTION
            )
          );
      }
      return res
        .status(resCode.HTTP_OK)
        .json(generateResponse(resCode.HTTP_OK, existingCourse));
    } catch (e) {
      const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
      res
        .status(resCode.HTTP_INTERNAL_SERVER_ERROR)
        .json(generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors));
      throw new Error(e);
    }
  },
  //** event delete */
  deleteTransitionCourse: async (req, res) => {
    try {
      let id = req.params.id;
      if (!id) {
        const error = MESSAGES.apiErrorStrings.INVALID_REQUEST;
        return res
          .status(resCode.HTTP_BAD_REQUEST)
          .json(generateResponse(resCode.HTTP_BAD_REQUEST, error));
      }
      let query = {
        where: {
          id: req.params.id || req.query.id,
        },
      };
      let item = await Transition_course.findOne(query);
      let imagePath;
      let pdf;
      if (item.pdf && item.pdf != 'undefined') {
        pdf = item.pdf;
      }
      if (item.image && item.image != 'undefined') {
        imagePath = item.image;
      }
      let event = await Transition_course.destroy(query);
      if (event) {
        if (imagePath) {
          let path = `assets/courseImage/${
            item.image.split('image/courseImage/')[1]
          }`;
          if (fs.existsSync(path)) {
            fs.unlinkSync(path);
          }
        }
        if (pdf) {
          let pdf = `assets/pdf/${item.pdf.split('image/pdf/')[1]}`;
          if (fs.existsSync(pdf)) {
            fs.unlinkSync(pdf);
          }
        }
        return res.json(
          generateResponse(resCode.HTTP_OK, {
            message: MESSAGES.apiSuccessStrings.DELETED('This Course'),
          })
        );
      } else {
        let errors = MESSAGES.apiSuccessStrings.DATA_NOT_EXISTS('This Course');
        return res
          .status(resCode.HTTP_BAD_REQUEST)
          .json(
            generateResponse(
              resCode.HTTP_BAD_REQUEST,
              errors,
              MESSAGES.errorTypes.OAUTH_EXCEPTION
            )
          );
      }
    } catch (e) {
      const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
      res
        .status(resCode.HTTP_INTERNAL_SERVER_ERROR)
        .json(generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors));
      throw new Error(e);
    }
  },
  // Upload pdf/doc
  uploadPdf: async (req, res) => {
    try {
      let id = req.params.id;
      if (!id) {
        const error = MESSAGES.apiErrorStrings.INVALID_REQUEST;
        return res
          .status(resCode.HTTP_BAD_REQUEST)
          .json(generateResponse(resCode.HTTP_BAD_REQUEST, error));
      }

      let query = {
        where: {
          id: id,
        },
      };

      let transition = await Transition_course.findOne(query);
      if (!transition) {
        if (req.file.filename) {
          let path = `assets/image/${req.file.filename}`;
          fs.unlinkSync(path);
        }
        let errors =
          MESSAGES.apiSuccessStrings.DATA_NOT_EXISTS('The Course Details');
        return res
          .status(resCode.HTTP_BAD_REQUEST)
          .json(
            generateResponse(
              resCode.HTTP_BAD_REQUEST,
              errors,
              MESSAGES.errorTypes.OAUTH_EXCEPTION
            )
          );
      } else {
        var obj = req.body;
        if (req.file) {
          if (transition.pdf && transition.pdf != 'undefined') {
            let path = `assets/${transition.pdf.split('image/')[1]}`;
            if (fs.existsSync(path)) {
              fs.unlinkSync(path);
            }
          }
          obj.pdf = req.file.filename;
        }
        Object.keys(obj).forEach((key, index) => {
          transition[key] = obj[key];
        });
        let result = await transition.save();
        return res.json(
          generateResponse(resCode.HTTP_OK, {
            message: MESSAGES.apiSuccessStrings.UPDATE('This PDF Uploaded'),
          })
        );
      }
    } catch (e) {
      const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
      res
        .status(resCode.HTTP_INTERNAL_SERVER_ERROR)
        .json(generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors));
      throw new Error(e);
    }
  },
};
module.exports = courseObj;
