const fs = require('fs');
const sequelize = require('sequelize');
const Category = require('../../../models').Category;
const Product = require('../../../models').Product;
const Supplier = require('../../../models').Supplier;

const DIR_PATH = 'assets/uploadimages';
const DIR_PATH_EXCEL = "assets/excel";

const db = require('../../../models');
const moment = require('moment');

const {
	OPTIONS,
	generateURl,
	generateResponse,
	generateOTP,
} = require('../../../config/options/global.options');
const MESSAGES = require('../../../config/options/messages.options');

const resCode = MESSAGES.resCode;
const Op = sequelize.Op;

exports.postUpload = async (req, res) => {
	if (req.file) {
		let filePath = `post/${DIR_PATH}/${req.file.filename}`;
		return res.json(
			generateResponse(resCode.HTTP_OK, {
				data: req.file,
				url: generateURl(filePath),
			})
		);
	} else {
		const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
		res.status(resCode.HTTP_INTERNAL_SERVER_ERROR).json(
			generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors)
		);
		throw new Error(e);
	}
};

exports.postUploadExcel = async (req, res) => {
    if (req.file) {
        let filePath = `post/${DIR_PATH_EXCEL}/${req.file.filename}`;
        return res.json(
            generateResponse(resCode.HTTP_OK, {
                data: req.file,
                url: generateURl(filePath),
            })
        );
    } else {
        const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
        res.status(resCode.HTTP_INTERNAL_SERVER_ERROR).json(
            generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors)
        );
        throw new Error(e);
    }
};

exports.removeUpload = async (req, res) => {
	try {
		let splitPaths = req.body.path.split('assets');
		let path = `assets${splitPaths[1]}`;
		fs.unlinkSync(path);
		return res.json(
			generateResponse(resCode.HTTP_OK, {
				message: MESSAGES.apiSuccessStrings.DELETED('Image'),
			})
		);
	} catch (e) {
		const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
		res.status(resCode.HTTP_INTERNAL_SERVER_ERROR).json(
			generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors)
		);
		throw new Error(e);
	}
};

exports.getCategory = async (req, res) => {
	try {
		let query = {
			where: {
				status: OPTIONS.defaultStatus.ACTIVE,
			},
			attributes: ['id', 'name', 'image'],
		};
		let existingCategory = await Category.findAll(query);
		return res
			.status(resCode.HTTP_OK)
			.json(generateResponse(resCode.HTTP_OK, existingCategory));
	} catch (e) {
		const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
		res.status(resCode.HTTP_INTERNAL_SERVER_ERROR).json(
			generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors)
		);
		throw new Error(e);
	}
};

exports.getProduct = async (req, res) => {
	try {
		let query = {
            where: {
                status: OPTIONS.defaultStatus.ACTIVE,
            },
			attributes: ["id", "name", "image", "categoryId", "productCode"],
			include: [
				{
					model: db.Category,
					as: 'category',
					attributes:['id','name','image']
				}	
			]
        };
		if (req.query.categoryId) {
			query.where.categoryId = req.query.categoryId;
		}
		let existingProduct = await Product.findAll(query);
		return res.status(resCode.HTTP_OK).json(generateResponse(resCode.HTTP_OK, existingProduct));
	} catch (e) {
		const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
		res.status(resCode.HTTP_INTERNAL_SERVER_ERROR).json(
			generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors)
		);
		throw new Error(e);
	}
};

exports.getSupplier = async (req, res) => {
	try {
		let query = {
            where: {		
                status: OPTIONS.defaultStatus.ACTIVE,
            },
        };
		let existingSupplier= await Supplier.findAll(query);
		return res.status(resCode.HTTP_OK).json(generateResponse(resCode.HTTP_OK, existingSupplier));
	} catch (e) {
		const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
		res.status(resCode.HTTP_INTERNAL_SERVER_ERROR).json(
			generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors)
		);
		throw new Error(e);
	}
};
