const sequelize = require('sequelize');
const Feedback = require('../../../../models').Feedback;
const db = require('../../../../models');
const moment = require('moment');
const Event = require('../../../../models').Event;

const {
  OPTIONS,
  generateResponse,
} = require('../../../../config/options/global.options');
const MESSAGES = require('../../../../config/options/messages.options');
const path = require('path');
const fs = require('fs');

const resCode = MESSAGES.resCode;
const Op = sequelize.Op;
const Excel = require('exceljs');

const feedbackObj = {
  //** Create Test */
createFeedback: async (req, res) => {
  try {
    var createObj = req.body;
    const item = await Feedback.create(createObj);
    
    return res.status(resCode.HTTP_OK).json(
      generateResponse(resCode.HTTP_OK, {
        message: MESSAGES.apiSuccessStrings.ADDED(
          `This Feedback Details is`
        ),
        id: item.id,
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


  getFeedback: async (req, res) => {
    try {
      let offset = req.query.page || 1;
      offset = offset - 1;
      offset = offset * req.query.pagesize || 0;
      let limit = req.query.pagesize || 10;
      let whereQuery = {};
      if (req.query.search) {
        whereQuery = {
          [Op.or]: [
            { contact: { [Op.substring]: req.query.search } },
            { email: { [Op.substring]: req.query.search } },
            { name: { [Op.substring]: req.query.search } },
            { message: { [Op.substring]: req.query.search } },
          ],
        };
      }
      let { count, rows } = await Feedback.findAndCountAll({
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
        Feedback: rows,
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

  //** get feedback by its id */
  getFeedbackById: async (req, res) => {
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
      let existingFeedback = await Feedback.findOne(query);
      if (!existingFeedback) {
        let errors = MESSAGES.apiSuccessStrings.DATA_NOT_EXISTS('The Feedback');
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
        .json(generateResponse(resCode.HTTP_OK, existingFeedback));
    } catch (e) {
      const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
      res
        .status(resCode.HTTP_INTERNAL_SERVER_ERROR)
        .json(generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors));
      throw new Error(e);
    }
  },

  //** Update feedback*/
  updateFeedback: async (req, res) => {
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
      let feedback = await Feedback.findOne(query);
      if (!feedback) {
        let errors = MESSAGES.apiSuccessStrings.DATA_NOT_EXISTS('The Feedback');
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
        var feedbackObject = req.body;
        Object.keys(feedbackObject).forEach((key, index) => {
          feedback[key] = feedbackObject[key];
        });
        await feedback.save();

        return res.json(
          generateResponse(resCode.HTTP_OK, {
            message: MESSAGES.apiSuccessStrings.UPDATE('The Feedback'),
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
  //** Feedback delete */
  deleteFeedback: async (req, res) => {
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
      let feedback = await Feedback.destroy(query);
      if (feedback) {
        return res.json(
          generateResponse(resCode.HTTP_OK, {
            message: MESSAGES.apiSuccessStrings.DELETED('The Feedback'),
          })
        );
      } else {
        let errors = MESSAGES.apiSuccessStrings.DATA_NOT_EXISTS('The Feedback');
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

  getEventsById: async (req, res) => {
    try {
      let offset = req.query.page || 1;
      offset = offset - 1;
      offset = offset * req.query.pageSize || 0;
      let limit = req.query.pageSize || 10;
      let id = req.params.id;
      if (!id) {
        const error = MESSAGES.apiErrorStrings.INVALID_REQUEST;
        return res
          .status(resCode.HTTP_BAD_REQUEST)
          .json(generateResponse(resCode.HTTP_BAD_REQUEST, error));
      }
      let whereQuery = { eventId: id };
      if (req.query.search) {
        whereQuery = {
          [Op.or]: [{ branch: { [Op.substring]: req.query.search } }],
        };
      }

      let { count, rows } = await Feedback.findAndCountAll({
        where: whereQuery,
        attributes: {
          exclude: ['createdAt', 'updatedAt'],
        },
        offset: parseInt(offset),
        limit: parseInt(limit),
      });
      if (!rows) {
        return res.status(resCode.HTTP_BAD_REQUEST).json(
          generateResponse(resCode.HTTP_BAD_REQUEST, {
            message: MESSAGES.apiSuccessStrings.JOB_POST('empty'),
          })
        );
      }
      let payload = {
        count: count,
        Feedback: rows,
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

  //download file */
  downloadFile: async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-type', 'application/json');
    let rows = await getFeedback(req, 'file');
    let outputData = [];
    console.log("rows", rows);
    generateExcel(rows);
    function generateExcel(rows) {
      let data = Object.values(JSON.parse(JSON.stringify(rows.feedbackObj)));
      outputData = data;

      console.log('data@@@@', data);
      workbook = new Excel.Workbook();
      var worksheet = workbook.addWorksheet('My Sheet');

      workbook.alignment = {
        vertical: 'middle',
        horizontal: 'left',
        wrapText: true,
      };
      worksheet.getRow(1).values = [
        'Sr.No.',
        'Name',
        'Message',
        'Contact',
        'Email',
      ];
      worksheet.columns = [
        { key: 'Sr.No.', width: 20 },
        { key: 'name', width: 34 },
        { key: 'message', width: 34 },
        { key: 'contact', width: 34 },
        { key: 'email', width: 34 }
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

      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFC0C0C0' },
      };
      let index = 1;
      let ids = [];
      data.forEach((d, i) => {
        const row = worksheet.getRow(index);
        console.log("ddddddd", d);
        let detas = worksheet.addRow({
          'Sr.No.': i + 1,
          'name': `${d['name'] ? d['name'] : ''}`,
          'message': `${d['message'] ? d['message'] : ''}`,
          'contact': `${d['contact'] ? d['contact'] : ''}`,
          'email': `${d['email'] ? d['email'] : ''}`,
          // Status: `${d['status'] ? 'Active' : 'Inactive'}`,
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
      console.log("data----", data);
    }
    if (req.query.type == 'csv') {
      let file = `assets/downloadFeedbackData/export.csv`;
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
      let file = `assets/downloadFeedbackData/export.xlsx`;
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

};

async function getFeedback(req) {
  // let id = 17;
  // let id = req.params.id;
  // console.log("id---------", id);
  let row = await Feedback.findAll({
    attributes: [
      `name`,
      `message`,
      `contact`,
      `email`,
    ],

  });

  let payload = {
    feedbackObj: row,
  };
  console.log("row--------", row);
  return payload;
}

module.exports = feedbackObj;
