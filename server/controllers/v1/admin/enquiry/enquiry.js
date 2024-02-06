const sequelize = require('sequelize');
const Enquiry = require('../../../../models').Enquiry;
const fs = require('fs');
const db = require('../../../../models');
const moment = require('moment');
const {
  OPTIONS,
  generateResponse,
} = require('../../../../config/options/global.options');
const MESSAGES = require('../../../../config/options/messages.options');
const path = require('path');
const resCode = MESSAGES.resCode;
const Op = sequelize.Op;
const Excel = require('exceljs');
const { includes } = require('lodash');
const enquiryObj = {

  createEnquiry: async (req, res) => {
    try {
      let query = {
        where: {
          [Op.or]: [{ name: req.body.name }],
        },
      };
      let existingEnquiry = await Enquiry.findOne(query);
      var createObj = new Enquiry();
      var enquiryObj = req.body;
      if (req.file) {
        enquiryObj.image = req.file.filename;
      }
      Object.keys(enquiryObj).forEach((key, index) => {
        createObj[key] = enquiryObj[key];
      });
      let enquiry = await createObj.save();
      return res.status(resCode.HTTP_OK).json(
        generateResponse(resCode.HTTP_OK, {
          message: MESSAGES.apiSuccessStrings.ADDED(`enquiry added`),
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
  getEnquiryListing: async (req, res) => {
    try {
      let title = 'not file';
      let { count, rows } = await getEnquiry(req, title);
      if (!rows) {
        return res.status(resCode.HTTP_BAD_REQUEST).json(
          generateResponse(resCode.HTTP_BAD_REQUEST, {
            message: MESSAGES.apiSuccessStrings.MASTER_STUDENT('empty'),
          })
        );
      }
      let payload = {
        count: count,
        Enquiry: rows,
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
  getEnquiryById: async (req, res) => {
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

      let existingEnquiry = await Enquiry.findOne(query);
      if (!existingEnquiry) {
        let errors = MESSAGES.apiSuccessStrings.DATA_NOT_EXISTS('This Enquiry');
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
        .json(generateResponse(resCode.HTTP_OK, existingEnquiry));
    } catch (e) {
      const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
      res
        .status(resCode.HTTP_INTERNAL_SERVER_ERROR)
        .json(generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors));
      throw new Error(e);
    }
  },
  //** get Enquiry by its id */
  //   getTopicByParentId: async (req, res) => {
  //     try {
  //       let id = req.params.parentId;
  //       if (!id) {
  //         const error = MESSAGES.apiErrorStrings.INVALID_REQUEST;
  //         return res
  //           .status(resCode.HTTP_BAD_REQUEST)
  //           .json(generateResponse(resCode.HTTP_BAD_REQUEST, error));
  //       }
  //
  //       let query = {};
  //       if (id == 'null' || id == null) {
  //         query = {
  //           where: {
  //             status: [
  //               OPTIONS.defaultStatus.ACTIVE,
  //               OPTIONS.defaultStatus.INACTIVE,
  //             ],
  //             parentId: null,
  //           },
  //         };
  //       } else {
  //         if (req.query.search) {
  //           query = {
  //             where: {
  //               [Op.and]: [
  //                 {
  //                   status: [
  //                     OPTIONS.defaultStatus.ACTIVE,
  //                     OPTIONS.defaultStatus.INACTIVE,
  //                   ],
  //                 },
  //                 { parentId: id },
  //                 {
  //                   [Op.or]: [
  //                     { name: { [Op.substring]: req.query.search } },
  //                     { displayName: { [Op.substring]: req.query.search } },
  //                   ],
  //                 },
  //               ],
  //             },
  //           };
  //         } else {
  //           query = {
  //             where: {
  //               status: [
  //                 OPTIONS.defaultStatus.ACTIVE,
  //                 OPTIONS.defaultStatus.INACTIVE,
  //               ],
  //               parentId: id,
  //             },
  //           };
  //         }
  //       }

  //
  //       let { count, rows } = await Topic.findAndCountAll(query);
  //       if (!rows) {
  //         let errors = MESSAGES.apiSuccessStrings.DATA_NOT_EXISTS('The Topic');
  //         return res
  //           .status(resCode.HTTP_BAD_REQUEST)
  //           .json(
  //             generateResponse(
  //               resCode.HTTP_BAD_REQUEST,
  //               errors,
  //               MESSAGES.errorTypes.OAUTH_EXCEPTION
  //             )
  //           );
  //       }
  //       let payload = {
  //         count: count,
  //         topics: rows,
  //       };
  //       return res
  //         .status(resCode.HTTP_OK)
  //         .json(generateResponse(resCode.HTTP_OK, payload));
  //     } catch (e) {
  //       const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
  //       res
  //         .status(resCode.HTTP_INTERNAL_SERVER_ERROR)
  //         .json(generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors));
  //       throw new Error(e);
  //     }
  //   },
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
  updateEnquiry: async (req, res) => {
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

      let enquiry = await Enquiry.findOne(query);

      if (!enquiry) {
        let errors = MESSAGES.apiSuccessStrings.DATA_NOT_EXISTS('This Enquiry');
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
        var enquiryObject = req.body;
        Object.keys(enquiryObject).forEach((key, index) => {
          enquiry[key] = enquiryObject[key];
        });
        await enquiry.save();

        return res.json(
          generateResponse(resCode.HTTP_OK, {
            message: MESSAGES.apiSuccessStrings.UPDATE('This Enquiry'),
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
  deleteEnquiry: async (req, res) => {
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
      let enquiry = await Enquiry.destroy(query);
      if (enquiry) {
        return res.json(
          generateResponse(resCode.HTTP_OK, {
            message: MESSAGES.apiSuccessStrings.DELETED('This Enquiry'),
          })
        );
      } else {
        let errors = MESSAGES.apiSuccessStrings.DATA_NOT_EXISTS('This Enquiry');
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

  // user download sheet
  downloadFile: async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-type', 'application/json');
    let { rows } = await getEnquiry(req, 'file');
    // return rows;

    let outputData = [];

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
      'Name',
      'Mobile',
      'Collage',
      'Branch',
      'Passing Year',
      'Course',
    ];

    worksheet.columns = [
      { key: 'Sr.No.', width: 20 },
      { key: 'Name', width: 34 },
      { key: 'Mobile', width: 24 },
      { key: 'Collage', width: 24 },
      { key: 'Branch', width: 24 },
      { key: 'Passing Year', width: 34 },
      { key: 'Course', width: 34 },
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
        Name: `${d['name'] ? d['name'] : ''}`,
        Mobile: `${d['mobile'] ? d['mobile'] : ''}`,
        Collage: `${d['college'] ? d['college'] : ''}`,
        Branch: `${d['branch'] ? d['branch'] : ''}`,
        'Passing Year': `${d['passingyear'] ? d['passingyear'] : ''}`,
        Course: `${d['course'] ? d['course'] : ''}`,
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
      let file = `assets/downloadEnquiryData/export.csv`;
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
      let file = `assets/downloadEnquiryData/export.xlsx`;
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
  },
};
module.exports = enquiryObj;

async function getEnquiry(req, title) {
  let whereQuery = {
    [Op.and]: [],
  };
  if (req.query.course && req.query.course != 'undefined') {
    whereQuery[Op.and].push({ course: req.query.course });
  }
  if (req.query.search) {
    whereQuery[Op.and].push({
      [Op.or]: [
        { name: { [Op.substring]: req.query.search } },
        { mobile: { [Op.substring]: req.query.search } },
      ],
    });
  }
  let obj = {
    where: whereQuery,
    // include: include,
    order: [['createdAt', 'DESC']],
  };
  if (title == 'not file') {
    let offset = req.query.page || 1;
    offset = offset - 1;
    obj.offset = parseInt(offset * req.query.pageSize || 0);
    obj.limit = parseInt(req.query.pageSize || 10);
  }
  let rows = await Enquiry.findAll(obj);
  let count = await Enquiry.count();
  let payload = {
    count: count,
    rows: rows,
  };

  return payload;
}
