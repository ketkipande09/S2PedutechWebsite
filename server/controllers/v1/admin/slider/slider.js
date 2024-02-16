const sequelize = require('sequelize');
const Slider = require('../../../../models').Slider;
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

const sliderObj = {
  //** Create event */
  createSlider: async (req, res) => {
    try {
      let query = {};
      let existingSlider = await Slider.findOne(query);
      var createObj = new Slider();
      var sliderObj = req.body;

      if (req.file) {
        sliderObj.image = req.file.filename;
      }
      if (sliderObj.image == undefined || sliderObj.image == null) {
        sliderObj.image = null;
      }
      if (sliderObj.videoUrl == undefined || sliderObj.videoUrl == null) {
        sliderObj.videoUrl = null;
      }

      Object.keys(sliderObj).forEach((key, index) => {
        createObj[key] = sliderObj[key];
      });

      let slider = await createObj.save();

      return res.status(resCode.HTTP_OK).json(
        generateResponse(resCode.HTTP_OK, {
          message: MESSAGES.apiSuccessStrings.ADDED(`This Detail is`),
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
  getSliderListing: async (req, res) => {
    try {
      let offset = req.query.page || 1;
      offset = offset - 1;
      offset = offset * req.query.pagesize || 0;
      let limit = req.query.pagesize || 10;
      let whereQuery;
      if (req.query.search) {
        whereQuery = {
          [Op.and]: [
            { status: OPTIONS.defaultStatus.ACTIVE },
            {
              [Op.or]: [
                { studentName: { [Op.substring]: req.query.search } },
                { collegeName: { [Op.substring]: req.query.search } },
              ],
            },
          ],
        };
      }
      let { count, rows } = await Slider.findAndCountAll({
        where: whereQuery,
        offset: parseInt(offset),
        limit: parseInt(limit),
      });
      if (!rows) {
        return res.status(resCode.HTTP_BAD_REQUEST).json(
          generateResponse(resCode.HTTP_BAD_REQUEST, {
            message: MESSAGES.apiSuccessStrings.Slider('empty'),
          })
        );
      }
      let payload = {
        count: count,
        slider: rows,
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
  updateSlider: async (req, res) => {
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

      let slider = await Slider.findOne(query);

      if (!slider) {
        if (req.file.filename) {
          let path = `assets/image/${req.file.filename}`;
          if (fs.existsSync(path)) {
            fs.unlinkSync(path);
          }
        }
        let errors = MESSAGES.apiSuccessStrings.DATA_NOT_EXISTS('This Detail');
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
        var sliderObject = req.body;
        if (req.file) {
          if (slider.image && slider.image != 'undefined') {
            let path = `assets/sliderImage/${slider.image.split('sliderImage/')[1]
              }`;
            if (fs.existsSync(path)) {
              fs.unlinkSync(path);
            }
          }
          sliderObject.image = req.file.filename;
        }

        Object.keys(sliderObject).forEach((key, index) => {
          slider[key] = sliderObject[key];
        });
        await slider.save();
        return res.json(
          generateResponse(resCode.HTTP_OK, {
            message: MESSAGES.apiSuccessStrings.UPDATE('This Detail'),
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
  //** get event by its id */
  getSliderById: async (req, res) => {
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
      let existingSlider = await Slider.findOne(query);
      if (!existingSlider) {
        let errors = MESSAGES.apiSuccessStrings.DATA_NOT_EXISTS('This Detail');
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
        .json(generateResponse(resCode.HTTP_OK, existingSlider));
    } catch (e) {
      const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
      res
        .status(resCode.HTTP_INTERNAL_SERVER_ERROR)
        .json(generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors));
      throw new Error(e);
    }
  },
  //** event delete */
  deleteSlider: async (req, res) => {
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
      let item = await Slider.findOne(query);
      let imagePath;
      if (item.image && item.image != 'undefined') {
        imagePath = item.image;
      }
      let slider = await Slider.destroy(query);
      if (slider) {
        if (imagePath) {
          let path = `assets/sliderImage/${imagePath.split('image/')[1]}`;

          if (fs.existsSync(path)) {
            fs.unlinkSync(path);
          }
        }
        return res.json(
          generateResponse(resCode.HTTP_OK, {
            message: MESSAGES.apiSuccessStrings.DELETED('This Details'),
          })
        );
      } else {
        let errors = MESSAGES.apiSuccessStrings.DATA_NOT_EXISTS('This Detail');
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
};
module.exports = sliderObj;
