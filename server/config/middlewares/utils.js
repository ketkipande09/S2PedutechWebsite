const sequelize = require('sequelize');
const { body, param, query, validationResult } = require('express-validator');
const { schemaValidation } = require('../options/schemaValidate');
const moment = require('moment');
const { OPTIONS, generateResponse } = require('../options/global.options');
const MESSAGES = require('../options/messages.options');

const resCode = MESSAGES.resCode;
var utilsObj = {
  rolePermit: (...permittedRoles) => {
    // return a middleware
    return (request, response, next) => {
      const { user } = request;
      //console.log("req", request.user);
      if (user && permittedRoles.includes(user.role)) {
        next(); // role is allowed, so continue on the next middleware
      } else {
        return response
          .status(resCode.HTTP_BAD_REQUEST)
          .json(
            generateResponse(
              resCode.HTTP_BAD_REQUEST,
              MESSAGES.errorTypes.UNAUTHORISED_ACCESS
            )
          ); // user is forbidden
      }
    };
  },
  validate: (schemas) => {
    // console.log('schemas', schemas);
    // console.log('schemas value', schemaValidation[schemas]);
    return async (req, res, next) => {
      await Promise.all(
        schemaValidation[schemas].map((schema) => schema.run(req))
      );
      const result = validationResult(req);
      if (result.isEmpty()) {
        return next();
      }
      const errors = result.array();
      if (!result.isEmpty()) {
        return res
          .status(resCode.HTTP_BAD_REQUEST)
          .json(
            generateResponse(
              resCode.HTTP_BAD_REQUEST,
              { errors: errors },
              MESSAGES.errorTypes.INPUT_VALIDATION
            )
          );
      }
    };
  },
};
module.exports = utilsObj;
