const sequelize = require('sequelize');
const Org = require('../../../../models').Org;
const db = require('../../../../models');
const moment = require('moment');
const {
  OPTIONS,
  generateResponse,
} = require('../../../../config/options/global.options');
const MESSAGES = require('../../../../config/options/messages.options');
const org = require('../../../../models/org');
const resCode = MESSAGES.resCode;
const Op = sequelize.Op;

const OrgObj = {
  //** Create Org */
  createOrg: async (req, res) => {
    try {
      let query = {
        where: { email: req.body.email.toLowerCase() },
      };
      /** check if Org exist or not */
      //   let existingOrg = await org.findOne(query);
      let existingOrg = await Org.findOne(query);
      if (existingOrg) {
        let errors = MESSAGES.apiErrorStrings.Data_EXISTS('This Organization');
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
      var createObj = new Org();
      var OrgObj = req.body;
      Object.keys(OrgObj).forEach((key, index) => {
        createObj[key] = OrgObj[key];
      });
      let org = await createObj.save();
      return res.status(resCode.HTTP_OK).json(
        generateResponse(resCode.HTTP_OK, {
          message: MESSAGES.apiSuccessStrings.ADDED(`This Organization is`),
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
  //** Org listing */
  getOrgListing: async (req, res) => {
    try {
      let offset = req.query.page || 1;
      offset = offset - 1;
      offset = offset * req.query.pagesize || 0;
      let limit = req.query.pagesize || 10;
      let whereQuery = {};

      if (req.query.search) {
        whereQuery = {
          [Op.or]: [
            { email: { [Op.substring]: req.query.search } },
            { mobile: { [Op.substring]: req.query.search } },
          ],
        };
      }
      let { count, rows } = await Org.findAndCountAll({
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
        Org: rows,
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
  //** get Org by its id */
  getOrgById: async (req, res) => {
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

      let existingOrg = await Org.findOne(query);
      if (!existingOrg) {
        let errors = MESSAGES.apiSuccessStrings.DATA_NOT_EXISTS('This Org');
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
        .json(generateResponse(resCode.HTTP_OK, existingOrg));
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

  //** Update Org*/
  updateOrg: async (req, res) => {
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

      let org = await Org.findOne(query);

      if (!org) {
        let errors = MESSAGES.apiSuccessStrings.DATA_NOT_EXISTS('This Org');
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
        var OrgObject = req.body;
        Object.keys(OrgObject).forEach((key, index) => {
          org[key] = OrgObject[key];
        });
        await org.save();
        return res.json(
          generateResponse(resCode.HTTP_OK, {
            message: MESSAGES.apiSuccessStrings.UPDATE('This Organization'),
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
  deleteOrg: async (req, res) => {
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
      let org = await Org.destroy(query);
      if (org) {
        return res.json(
          generateResponse(resCode.HTTP_OK, {
            message: MESSAGES.apiSuccessStrings.DELETED('This Organization'),
          })
        );
      } else {
        let errors =
          MESSAGES.apiSuccessStrings.DATA_NOT_EXISTS('This Organization');
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
module.exports = OrgObj;
