const sequelize = require('sequelize');
const Event = require('../../../../models').Event;
const Utils = require("../../../../shared/utils/moment-timezone/time");
const db = require('../../../../models');
const moment = require('moment');
const fs = require('fs');
const {
  OPTIONS,
  generateResponse,
} = require('../../../../config/options/global.options');
const MESSAGES = require('../../../../config/options/messages.options');
const { forEach } = require('lodash');

const resCode = MESSAGES.resCode;
const Op = sequelize.Op;

const eventObj = {
  //** Create event */
  createEvent: async (req, res) => {
    try {
      /** check if Event exist or not */
      await Event.findOne();
      var createObj = new Event();
      var eventObj = req.body;
      if (req.files) {
        eventObj.image = req.files.image[0].filename;
        eventObj.eventQr = req.files.eventQr[0].filename;
      }
      Object.keys(eventObj).forEach((key, index) => {
        createObj[key] = eventObj[key];
      });
      await createObj.save();
      return res.status(resCode.HTTP_OK).json(
        generateResponse(resCode.HTTP_OK, {
          message: MESSAGES.apiSuccessStrings.ADDED(`The event is`),
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
  getEventListing: async (req, res) => {
    try {
      let offset = req.query.page || 1;
      offset = offset - 1;
      offset = offset * req.query.pagesize || 0;
      let limit = req.query.pagesize || 10;

      // let whereQuery;
      let whereQuery = {
        endDate: { [Op.gte]: Utils.getDateTime() }
      }


      let { count, rows } = await Event.findAndCountAll({
        where: whereQuery,
        order: [
          ['eventStatus', 'DESC'],
          // ['date_time', 'DESC'],
        ],
        offset: parseInt(offset),
        limit: parseInt(limit),
      });
      if (!rows) {
        return res.status(resCode.HTTP_BAD_REQUEST).json(
          generateResponse(resCode.HTTP_BAD_REQUEST, {
            message: MESSAGES.apiSuccessStrings.EVENT('empty'),
          })
        );
      }
      let payload = {
        count: count,
        events: rows,
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

  getAllEventListing: async (req, res) => {
    try {
      let offset = req.query.page || 1;
      offset = offset - 1;
      offset = offset * req.query.pagesize || 0;
      let limit = req.query.pagesize || 10;

      let whereQuery;
      // let whereQuery = {
      //   endDate: { [Op.gte]: Utils.getDateTime() }
      // }
      if (req.query.search) {
        whereQuery = {
          [Op.or]: [
            // { name: { [Op.substring]: req.query.search } },
            // { description: { [Op.substring]: req.query.search } },
            // { date_time: { [Op.substring]: req.query.search } },
            { eventName: { [Op.substring]: req.query.search } },
          ],
        };
      }

      let { count, rows } = await Event.findAndCountAll({
        where: whereQuery,
        order: [
          ['eventStatus', 'DESC'],
          // ['date_time', 'DESC'],
        ],
        offset: parseInt(offset),
        limit: parseInt(limit),
      });
      if (!rows) {
        return res.status(resCode.HTTP_BAD_REQUEST).json(
          generateResponse(resCode.HTTP_BAD_REQUEST, {
            message: MESSAGES.apiSuccessStrings.EVENT('empty'),
          })
        );
      }
      let payload = {
        count: count,
        events: rows,
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
  updateEvent: async (req, res) => {
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
      let event = await Event.findOne(query);

      if (!event) {
        if (req.files && req.files.eventQr && req.files.eventQr[0].filename) {
          let qrImagePath = `assets/eventImage/${req.files.eventQr[0].filename}`;
          if (fs.existsSync(qrImagePath)) {
            fs.unlinkSync(qrImagePath);
          }
        }

        if (req.files && req.files.image && req.files.image[0].filename) {
          let imagePath = `assets/eventImage/${req.files.image[0].filename}`;
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        }

        if (req.files && req.files.FeedbackQr && req.files.FeedbackQr[0].filename) {
          let feedbackPath = `assets/eventImage/${req.files.FeedbackQr[0].filename}`;
          if (fs.existsSync(feedbackPath)) {
            fs.unlinkSync(feedbackPath);
          }

        }

        let errors = MESSAGES.apiSuccessStrings.DATA_NOT_EXISTS('The event');
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
        var eventObject = req.body;
        if (req.files && req.files.image) {
          if (event.image && event.image !== 'undefined') {
            let imagePath = `assets/eventImage/${event.image.split('eventImage/')[1]}`;
            if (fs.existsSync(imagePath)) {
              fs.unlinkSync(imagePath);
            }
          }
          eventObject.image = req.files.image[0].filename;
        }

        if (req.files && req.files.eventQr) {
          if (event.eventQr && event.eventQr !== 'undefined') {
            let eventQrPath = `assets/eventImage/${event.eventQr.split('eventImage/')[1]}`;
            if (fs.existsSync(eventQrPath)) {
              fs.unlinkSync(eventQrPath);
            }
          }
          eventObject.eventQr = req.files.eventQr[0].filename;
        }

        if (req.files && req.files.FeedbackQr) {
          if (event.FeedbackQr && event.FeedbackQr !== 'undefined') {
            let feedbackPath = `assets/eventImage/${event.FeedbackQr.split('eventImage/')[1]}`;
            if (fs.existsSync(feedbackPath)) {
              fs.unlinkSync(feedbackPath);
            }
          }
          eventObject.FeedbackQr = req.files.FeedbackQr[0].filename;
        }


        Object.keys(eventObject).forEach((key, index) => {
          event[key] = eventObject[key];
        });
        await event.save();

        return res.json(
          generateResponse(resCode.HTTP_OK, {
            message: MESSAGES.apiSuccessStrings.UPDATE('The event'),
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

  //update events Status
  updateEventStatus: async (req, res) => {
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
      let student = await Event.findOne(query);
      if (student) {
        student['eventStatus'] = req.body.eventStatus;
        await student.save();
      }
      return res.json(
        generateResponse(resCode.HTTP_OK, {
          message: MESSAGES.apiSuccessStrings.UPDATE('The Event status'),
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

  //** get event by its id */
  getEventById: async (req, res) => {
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
      let existingEvent = await Event.findOne(query);
      if (!existingEvent) {
        let errors = MESSAGES.apiSuccessStrings.DATA_NOT_EXISTS('The Event');
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
        .json(generateResponse(resCode.HTTP_OK, existingEvent));
    } catch (e) {
      const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
      res
        .status(resCode.HTTP_INTERNAL_SERVER_ERROR)
        .json(generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors));
      throw new Error(e);
    }
  },
  //** event delete */
  deleteEvent: async (req, res) => {
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
      let item = await Event.findOne(query);
      let imagePath;
      if (item.image && item.image != 'undefined') {
        imagePath = item.image;
      }
      let event = await Event.destroy(query);
      if (event) {
        if (imagePath) {
          let path = `assets/image/${imagePath.split('image/')[1]}`;

          if (fs.existsSync(path)) {
            fs.unlinkSync(path);
          }
        }
        return res.json(
          generateResponse(resCode.HTTP_OK, {
            message: MESSAGES.apiSuccessStrings.DELETED('The event'),
          })
        );
      } else {
        let errors = MESSAGES.apiSuccessStrings.DATA_NOT_EXISTS('The event');
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
module.exports = eventObj;
