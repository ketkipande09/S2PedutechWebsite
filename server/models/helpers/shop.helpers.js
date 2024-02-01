// const _ = require('lodash');
// const sequelize = require('sequelize');
// const moment = require('moment-timezone');
// const { OPTIONS } = require('../../config/options/global.options');
// const bcrypt = require('bcrypt-nodejs');
// const Shop = require('..').Shop;
// const Op = sequelize.Op;
// const { Entropy, charset16 } = require('entropy-string');

// const generateShopName = (prefix, proposedName) => {
// 	let userName = proposedName;
// 	proposedName += Math.floor(Math.random() * 100 + 1);

// 	let salt = bcrypt.genSaltSync(5);
// 	let hash = bcrypt.hashSync(proposedName, salt);
// 	hash = prefix + hash;
// 	hash = hash.replace(/[^\w\s]/gi, '');
// 	proposedName = hash.substring(0, OPTIONS.randomShopSize);
// 	proposedName = _.toUpper(proposedName);
// 	return userName + proposedName;
// };
// exports.generateShopName = generateShopName;

// const generateUniqueShopName = async (proposedName, prefix) => {
// 	try {
// 		proposedName = _.replace(proposedName, /\s+/g, '');
// 		let userCount = await Shop.count({
// 			where: { name: { [Op.like]: '%' + proposedName + '%' } },
// 		});
// 		if (userCount > 0) {
// 			return generateShopName(prefix, proposedName) + '' + (userCount + 1);
// 		} else {
// 			return _.replace(proposedName, /\s+/g, '');
// 		}
// 	} catch (err) {
// 		customErrorLogger(err);
// 		throw err;
// 	}
// };
// exports.generateUniqueShopName = generateUniqueShopName;
