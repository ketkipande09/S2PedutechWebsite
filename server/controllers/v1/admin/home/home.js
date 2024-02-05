const sequelize = require('sequelize');
const Home = require('../../../../models').Home;
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

const homeObj = {
  //** Create Enquiry */
  createHome: async (req, res) => {
    try {
      console.log("req.body", req.body);
      let query = {
        where: { placementCount: req.body.placementCount },
      };
      let existingHome = await Home.findOne(query);
      console.log("existingHome", existingHome);
      if (existingHome) {
        let errors = MESSAGES.apiErrorStrings.Data_EXISTS('This Details');
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
      var createObj = new Home();
      var homeObj = req.body;
      Object.keys(homeObj).forEach((key, index) => {
        createObj[key] = homeObj[key];
      });
      let home = await createObj.save();
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

  //** Enquiry listing */
  getHomeListing: async (req, res) => {
    try {
      let offset = req.query.page || 1;
      offset = offset - 1;
      offset = offset * req.query.pagesize || 0;
      let limit = req.query.pagesize || 10;
      let whereQuery = {};

      if (req.query.search) {
        whereQuery = {
          [Op.or]: [
            { course: { [Op.substring]: req.query.search } },
            { email: { [Op.substring]: req.query.search } },
            { mobile: { [Op.substring]: req.query.search } },
            { name: { [Op.substring]: req.query.search } },
          ],
        };
      }
      let { count, rows } = await Home.findAndCountAll({
        where: whereQuery,
        // attributes: {
        //     exclude: ['']
        // },
        offset: parseInt(offset),
        limit: parseInt(limit),
      });
      if (!rows) {
        return res.status(resCode.HTTP_BAD_REQUEST).json(
          generateResponse(resCode.HTTP_BAD_REQUEST, {
            message: MESSAGES.apiSuccessStrings.TEST('empty'),
          })
        );
      }
      let payload = {
        count: count,
        Home: rows,
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
  //** get Enquiry by its id */
  getHomeById: async (req, res) => {
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

      let existingHome = await Home.findOne(query);
      if (!existingHome) {
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
        .json(generateResponse(resCode.HTTP_OK, existingHome));
    } catch (e) {
      const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
      res
        .status(resCode.HTTP_INTERNAL_SERVER_ERROR)
        .json(generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors));
      throw new Error(e);
    }
  },

  //** Change Topic status Status */
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

      let existingTopic = await Topic.findOne(query);
      if (!existingTopic) {
        const error = MESSAGES.apiSuccessStrings.DATA_NOT_EXISTS('This Topic');
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

      existingTopic.status =
        existingTopic.status === OPTIONS.defaultStatus.ACTIVE
          ? OPTIONS.defaultStatus.INACTIVE
          : OPTIONS.defaultStatus.ACTIVE;
      await existingTopic.save();

      res.status(resCode.HTTP_OK).json(
        generateResponse(resCode.HTTP_OK, {
          message: MESSAGES.apiSuccessStrings.STATUS_CHANGE(
            'Topic',
            existingTopic.status
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

  //** Update enquiry*/
  updateHome: async (req, res) => {
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
      let home = await Home.findOne(query);
      if (!home) {
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
        var homeObject = req.body;
        Object.keys(homeObject).forEach((key, index) => {
          home[key] = homeObject[key];
        });
        await home.save();
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


  //** Topic delete */
  deleteHome: async (req, res) => {
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
      let home = await Home.destroy(query);
      if (home) {
        return res.json(
          generateResponse(resCode.HTTP_OK, {
            message: MESSAGES.apiSuccessStrings.DELETED('This Detail'),
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
module.exports = homeObj;
