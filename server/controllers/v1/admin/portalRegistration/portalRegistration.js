const fs = require('fs');
const sequelize = require('sequelize');
const mail = require('../../../../config/middlewares/triggerMail');
const bcrypt = require('bcrypt');
const eventRegister = require('../../../../models').eventRegister;
const db = require('../../../../models');
const UserHelper = require('../../../../models/helpers/user.helpers');
const EmailRepository = require('../../../../shared/repositories/email.repository');
const SMSRepository = require('../../../../shared/repositories/sms.repository');
const customErrorLogger = require('../../../../shared/service/customExceptionHandler');
const Event = require('../../../../models').Event;
const {
  OPTIONS,
  generateURl,
  generateResponse,
  generateOTP,
} = require('../../../../config/options/global.options');
const MESSAGES = require('../../../../config/options/messages.options');
const path = require('path');
const Excel = require('exceljs');
const { title } = require('process');
const { includes } = require('lodash');
const resCode = MESSAGES.resCode;
const Op = sequelize.Op;
const roles = OPTIONS.usersRoles;

const eventRegisterObj = {
  //get All eventRegister
  getAllEventRegisters: async (req, res) => {
    try {
      let offset = req.query.page || 1;
      offset = offset - 1;
      offset = offset * req.query.pageSize || 0;
      let limit = req.query.pageSize || 10;
      let query = { [Op.and]: [{ status: OPTIONS.defaultStatus.ACTIVE }] };
      if (req.query.search) {
        query[Op.and].push({
          collegeName: { [Op.substring]: req.query.search },
        });
      }
      if (req.query.search) {
        query[Op.and].push({
          name: { [Op.substring]: req.query.search },
        });
      }
      if (req.query.eventId) {
        query[Op.and].push({ eventId: { [Op.substring]: req.query.eventId } });
      }
      if (req.query.eventName) {
        query[Op.and].push({
          eventName: { [Op.substring]: req.query.eventName },
        });
      }
      let { count, rows } = await eventRegister.findAndCountAll({
        where: query,
        order: [['createdAt', 'DESC']],

        attributes: {
          exclude: ['password'],
        },
        include: [
          {
            model: Event,
            as: 'registerDetails',
            attributes: ['id', 'eventName'],
          },
        ],
        offset: parseInt(offset),
        limit: parseInt(limit),
      });
      let payload = {
        eventRegister: rows,
        count: count,
      };
      return res
        .status(resCode.HTTP_OK)
        .json(generateResponse(resCode.HTTP_OK, payload));
    } catch (e) {
      const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
      res
        .status(resCode.HTTP_INTERNAL_SERVER_ERROR)
        .json(generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors));
    }
  },
  //create a new eventRegistration */
  create: async (req, res) => {
    try {
      var createObj = new eventRegister();
      var obj = req.body;
      (req.body.password = 'student'),
        (obj.password = await bcrypt.hash(
          req.body.password,
          bcrypt.genSaltSync(8)
        ));
      req.body.role = 'STUDENT';
      Object.keys(obj).forEach((key, index) => {
        createObj[key] = obj[key];
      });
      let course = await createObj.save();
      let todayDate = new Date();
      todayDate.setDate(todayDate.getDate() + OPTIONS.otpExpireInDays);
      return res.status(resCode.HTTP_OK).json(
        generateResponse(resCode.HTTP_OK, {
          message: MESSAGES.apiSuccessStrings.SIGNUP_SUCCESS,
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

  //delete eventRegister */
  deleteEventRegister: async (req, res) => {
    try {
      let query = {
        where: {
          id: req.params.id,
        },
      };
      let existingEventRegister = await eventRegister.findOne(query);
      if (existingEventRegister) {
        existingEventRegister.status = OPTIONS.defaultStatus.DELETED;
        existingEventRegister.userName =
          existingEventRegister.userName +
          Date.now() +
          OPTIONS.defaultStatus.DELETED;
        await existingEventRegister.save();
        return res.json(
          generateResponse(resCode.HTTP_OK, {
            message: MESSAGES.apiSuccessStrings.DELETED(' User'),
          })
        );
      } else {
        let errors = MESSAGES.apiSuccessStrings.DATA_NOT_EXISTS('User');
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

  //update Profile */
  updateProfile: async (req, res) => {
    try {
      let query = {
        where: {
          id: req.params.id ? req.params.id : req.user.id,
          role: roles.getAllRolesAsArray(),
        },
      };
      let user = await eventRegister.findOne(query);
      if (!user) {
        const errors = MESSAGES.apiErrorStrings.INVALID_REQUEST;
        return res
          .status(resCode.HTTP_BAD_REQUEST)
          .json(
            generateResponse(
              resCode.HTTP_BAD_REQUEST,
              errors,
              MESSAGES.errorTypes.ENTITY_NOT_FOUND
            )
          );
      }
      user.name = req.body.name || user.name;
      // user.firstName = req.body.firstName || user.firstName;
      // user.lastName = req.body.lastName || user.lastName;
      user.mobile = req.body.mobile || user.mobile;
      user.email = req.body.email || user.email;
      user.collegeName = req.body.collegeName || user.collegeName;

      let emailChange = false;

      if (req.body.email && user.email !== req.body.email) {
        let existingUserWithEmail = await UserHelper.findUserWithSameData({
          email: req.body.email.toLowerCase(),
        });

        if (existingUserWithEmail) {
          const errors = MESSAGES.apiErrorStrings.USER_EXISTS('email address');
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
        emailChange = true;
        user.email = req.body.email.toLowerCase();
        user.changeEmail = req.body.email.toLowerCase();
      }
      if (emailChange) {
        let todayDate = new Date();
        todayDate.setDate(todayDate.getDate() + OPTIONS.otpExpireInDays);
        user.verificationToken = token;
        user.verificationTokenExpireAt = todayDate;
      }
      await user.save();
      return res.status(resCode.HTTP_OK).json(
        generateResponse(resCode.HTTP_OK, {
          message: MESSAGES.apiSuccessStrings.UPDATE('User profile has been'),
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

  //get by id *//
  getStudenkById: async (req, res) => {
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
      let existingeventRegister = await eventRegister.findOne(query);
      if (!existingeventRegister) {
        let errors =
          MESSAGES.apiSuccessStrings.DATA_NOT_EXISTS('The Registration');
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
        .json(generateResponse(resCode.HTTP_OK, existingeventRegister));
    } catch (e) {
      const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
      res
        .status(resCode.HTTP_INTERNAL_SERVER_ERROR)
        .json(generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors));
      throw new Error(e);
    }
  },

  //download file *//
  downloadFile: async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-type', 'application/json');
    let { rows } = await getAllEventRegisters(req);
    return rows;

    let outputData = [];
    generateExcel(rows);
    function generateExcel(rows) {
      let data = Object.values(JSON.parse(JSON.stringify(rows)));
      outputData = data;
      workbook = new Excel.Workbook();
      var worksheet = workbook.addWorksheet('My Sheet');

      workbook.alignment = {
        vertical: 'middle',
        horizontal: 'left',
        wrapText: true,
      };
      worksheet.getRow(1).values = [
        'Sr.No.',
        'Event Name',
        'Name',
        'College Name',
        'Email',
        'Mobile',
      ];

      worksheet.columns = [
        { key: 'Sr.No.', width: 20 },
        { key: 'Event Name', width: 34 },
        { key: 'Name', width: 34 },
        { key: 'College Name', width: 34 },
        { key: 'Email', width: 34 },
        { key: 'Mobile', width: 34 },
      ];
      worksheet.getCell('A1').font = {
        size: 12,
        bold: true,
        color: { argb: 'FF000000' },
      };
      worksheet.getCell('B1').font = {
        size: 12,
        bold: true,
        color: { argb: 'FF000000' },
      };
      worksheet.getCell('C1').font = {
        size: 12,
        bold: true,
        color: { argb: 'FF000000' },
      };
      worksheet.getCell('D1').font = {
        size: 12,
        bold: true,
        color: { argb: 'FF000000' },
      };
      worksheet.getCell('E1').font = {
        size: 12,
        bold: true,
        color: { argb: 'FF000000' },
      };
      worksheet.getCell('F1').font = {
        size: 12,
        bold: true,
        color: { argb: 'FF000000' },
      };
      worksheet.getCell('G1').font = {
        size: 12,
        bold: true,
        color: { argb: 'FF000000' },
      };
      worksheet.getCell('H1').font = {
        size: 12,
        bold: true,
        color: { argb: 'FF000000' },
      };
      worksheet.getCell('I1').font = {
        size: 12,
        bold: true,
        color: { argb: 'FF000000' },
      };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFC0C0C0' },
      };
      let index = 1;
      let ids = [];
      data.forEach(function (d, i) {
        const row = worksheet.getRow(index);
        worksheet.addRow({
          'Sr.No.': i + 1,
          'Event Name': `${
            d['registerDetails'].eventName ? d['registerDetails'].eventName : ''
          }`,
          Name: `${d['name'] ? d['name'] : ''}`,
          'College Name': `${d['collegeName'] ? d['collegeName'] : ''}`,
          Email: `${d['email'] ? d['email'] : ''}`,
          Mobile: `${d['mobile'] ? d['mobile'] : ''}`,
          Status: `${d['status'] ? 'Active' : 'Inactive'}`,
        });
        row.eachCell((cell, rowNumber) => {
          worksheet.getColumn(rowNumber).alignment = {
            vertical: 'middle',
            horizontal: 'center',
          };
        });
        ids.push(d.id);
        index++;
      });
      if (req.query.type == 'csv') {
        let file = `assets/downloadStudentData/export.csv`;
        workbook.csv.writeFile(file).then(function (success) {
          let filePath = path.resolve(`${__dirname}/../../../../${file}`);
          fs.readFile(filePath, function (err, data) {
            if (err) {
              res.status(404).send({
                message: 'unable to read',
              });
            } else {
              res.status(200).send(data);
              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
              }
            }
          });
        });
      } else {
        let file = `assets/downloadStudentData/export.xlsx`;
        workbook.xlsx.writeFile(file).then(function (success) {
          let filePath = path.resolve(`${__dirname}/../../../../${file}`);
          fs.readFile(filePath, function (err, data) {
            if (err) {
              res.status(404).send({
                message: 'unable to read',
              });
            } else {
              res.status(200).send(data);
              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
              }
            }
          });
        });
      }
    }
  },
};
module.exports = eventRegisterObj;

async function getAllEventRegisters(req, title) {
  let whereQuery = {
    [Op.and]: [],
  };
  let order = [];
  if (req.query.eventId) {
    query[Op.and].push({ eventId: { [Op.substring]: req.query.eventId } });
  }
  if (req.query.eventName) {
    query[Op.and].push({
      eventName: { [Op.substring]: req.query.eventName },
    });
  }
  //  include: [
  //         {
  //           model: Event,
  //           as: 'registerDetails',
  //      attributes: ['id', 'eventName'],
  //            exclude: ['password'],
  //         },
  //       ],
  // {
  //   let data = {
  //     model: eventRegister,
  //     as: 'registerDetails',
  //     where: { eventId: { [Op.substring]: req.query.eventId } },
  //     attributes: {
  //       exclude: ['createdAt', 'updatedAt'],
  //     },
  //   };
  //   includes.push(Event);
  // }
  {
    let data = {
      include: [
        {
          model: Event,
          as: 'registerDetails',
          where: { eventName: { [Op.substring]: req.query.eventName } },
          attributes: {
            // includes: ['id', 'eventName'],
            exclude: ['createdAt', 'password', 'updatedAt'],
          },
        },
      ],
    };
    includes.push(eventName);
  }
  if (req.query.sortField && req.query.orderBy) {
    order = [req.query.sortField, req.query.orderBy];
  } else {
    order = ['createdAt', 'DESC'];
    //order = [sequelize.fn('max', sequelize.col('mobile')), 'DESC'];
  }
  if (req.query.search && req.query.search != 'undefined') {
    whereQuery[Op.and].push({
      [Op.or]: [
        { collegeName: { [Op.substring]: req.query.search } },
        { name: { [Op.substring]: req.query.search } },
      ],
    });
  }
  let obj = {
    where: whereQuery,
    include: include,
    order: [order],
  };
  if (title == 'not file') {
    let offset = req.query.page || 1;
    offset = offset - 1;
    obj.offset = parseInt(offset * req.query.pageSize || 0);
    obj.limit = parseInt(req.query.pageSize || 10);
  }
  let rows = await eventRegister.findAll(obj);
  let count = await eventRegister.count();
  let payload = {
    count: count,
    rows: rows,
  };

  return payload;
}
