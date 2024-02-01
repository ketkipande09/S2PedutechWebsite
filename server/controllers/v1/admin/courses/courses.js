const sequelize = require('sequelize');
const Course = require('../../../../models').Course;
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
  //** Create Course */
  createCourse: async (req, res) => {
    try {
      let query = {
        where: {
          [Op.or]: [{ name: req.body.name.toLowerCase() }],
        },
      };
      /** check if Course exist or not */
      let existingCourse = await Course.findOne(query);

      if (existingCourse) {
        let errors = MESSAGES.apiErrorStrings.Data_EXISTS(req.body.name);
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
      var createObj = new Course(req.body);
      // var courseObj = req.body;
      if (req.file) {
        courseObj.image = req.file.filename;
      }
      Object.keys(courseObj).forEach((key, index) => {
        createObj[key] = courseObj[key];
      });
      let course = await createObj.save();
      // let course = await Course.create(createObj);
      return res.status(resCode.HTTP_OK).json(
        generateResponse(resCode.HTTP_OK, {
          message: MESSAGES.apiSuccessStrings.ADDED(`The Course is`),
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
  //** Course listing */
  getCourseListing: async (req, res) => {
    try {
      let offset = req.query.page || 1;
      offset = offset - 1;
      offset = offset * req.query.pagesize || 0;
      let limit = req.query.pagesize || 10;
      let whereQuery;
      if (req.query.search) {
        whereQuery = {
          [Op.or]: [
            { name: { [Op.substring]: req.query.search } },
            { description: { [Op.substring]: req.query.search } },
          ],
        };
      }
      let { count, rows } = await Course.findAndCountAll({
        where: whereQuery,
        offset: parseInt(offset),
        limit: parseInt(limit),
      });
      if (!rows) {
        return res.status(resCode.HTTP_BAD_REQUEST).json(
          generateResponse(resCode.HTTP_BAD_REQUEST, {
            message: MESSAGES.apiSuccessStrings.COURSES('empty'),
          })
        );
      }
      let payload = {
        count: count,
        courses: rows,
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
  //** get Course by its id */
  getCourseById: async (req, res) => {
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

      let existingCourse = await Course.findOne(query);
      if (!existingCourse) {
        let errors = MESSAGES.apiSuccessStrings.DATA_NOT_EXISTS('The Course');
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
  //** Change Course status Status */
  changeStatus: async (req, res) => {
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
          status: [
            OPTIONS.defaultStatus.ACTIVE,
            OPTIONS.defaultStatus.INACTIVE,
          ],
        },
      };

      let existingCourse = await Course.findOne(query);
      if (!existingCourse) {
        const error =
          MESSAGES.apiSuccessStrings.DATA_ALREADY_EXISTS('The Course');
        return res
          .status(resCode.HTTP_BAD_REQUEST)
          .json(
            generateResponse(
              resCode.HTTP_BAD_REQUEST,
              error,
              MESSAGES.errorTypes.ENTITY_NOT_FOUND
            )
          );
      }

      existingCourse.status =
        existingCourse.status === OPTIONS.defaultStatus.ACTIVE
          ? OPTIONS.defaultStatus.INACTIVE
          : OPTIONS.defaultStatus.ACTIVE;
      await existingCourse.save();

      res.status(resCode.HTTP_OK).json(
        generateResponse(resCode.HTTP_OK, {
          message: MESSAGES.apiSuccessStrings.STATUS_CHANGE(
            'Course',
            existingCourse.status
          ),
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

  //** Update course*/
  updateCourse: async (req, res) => {
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

      let course = await Course.findOne(query);
      if (!course) {
        if (req.file.filename) {
          let path = `assets/image/${req.file.filename}`;
          if (fs.existsSync(path)) {
            fs.unlinkSync(path);
          }
        }
        let errors = MESSAGES.apiSuccessStrings.DATA_NOT_EXISTS('The Course');
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
          if (course.image && course.image != 'undefined') {
            let path = `assets/image/${course.image.split('image/image/')[1]}`;
            if (fs.existsSync(path)) {
              fs.unlinkSync(path);
            }
          }
          courseObject.image = req.file.filename;
        }

        Object.keys(courseObject).forEach((key, index) => {
          course[key] = courseObject[key];
        });
        await course.save();

        return res.json(
          generateResponse(resCode.HTTP_OK, {
            message: MESSAGES.apiSuccessStrings.UPDATE('The Course'),
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

  //** Course delete */
  deleteCourse: async (req, res) => {
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
      let item = await Course.findOne(query);
      let imagePath;
      if (item.image && item.image != 'undefined') {
        imagePath = item.image;
      }
      let course = await Course.destroy(query);
      if (course) {
        if (imagePath) {
          let path = `assets/image/${imagePath.split('/image/image/')[1]}`;

          if (fs.existsSync(path)) {
            fs.unlinkSync(path);
          }
        }
        return res.json(
          generateResponse(resCode.HTTP_OK, {
            message: MESSAGES.apiSuccessStrings.DELETED('The Course'),
          })
        );
      } else {
        let errors = MESSAGES.apiSuccessStrings.DATA_NOT_EXISTS('The Course');
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

  //**Course Image delete */
  deleteImage: async (req, res) => {
    try {
      req.assert('id', 'Course id is compulsory').notEmpty();
      req.assert('path', 'Image path is compulsory').notEmpty();

      let errors = req.validationErrors();

      if (errors) {
        return res
          .status(resCode.HTTP_BAD_REQUEST)
          .json(
            generateResponse(
              resCode.HTTP_BAD_REQUEST,
              errors,
              MESSAGES.errorTypes.INPUT_VALIDATION
            )
          );
      }
      let query = {
        where: {
          status: [
            OPTIONS.defaultStatus.ACTIVE,
            OPTIONS.defaultStatus.INACTIVE,
          ],
          id: req.body.id,
        },
      };
      let existingCourse = await Course.findOne(query);
      if (!existingCourse) {
        let errors = MESSAGES.apiSuccessStrings.DATA_NOT_EXISTS('The course');
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

      let splitPaths = req.body.path.split('assets');
      let path = `assets${splitPaths[1]}`;
      fs.unlinkSync(path);

      existingCourse.image = null;

      await existingCourse.save();

      return res.json(
        generateResponse(resCode.HTTP_OK, {
          message: MESSAGES.apiSuccessStrings.DELETED('Image'),
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
};
module.exports = courseObj;
