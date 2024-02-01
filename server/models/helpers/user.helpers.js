const _ = require('lodash');
const sequelize = require('sequelize');
const moment = require('moment-timezone');
const {OPTIONS} = require('../../config/options/global.options');
const bcrypt = require('bcrypt-nodejs');
const User = require('..').User;
const Op = sequelize.Op;
const { Entropy, charset16 } = require('entropy-string');

const generateUsername = (prefix, proposedName) => {
	let userName = proposedName;
	proposedName += Math.floor(Math.random() * 100 + 1);

	let salt = bcrypt.genSaltSync(5);
	let hash = bcrypt.hashSync(proposedName, salt);
	hash = prefix + hash;
	hash = hash.replace(/[^\w\s]/gi, '');
	proposedName = hash.substring(0, OPTIONS.randomUsernameSize);
	proposedName = _.toUpper(proposedName);
	return userName + proposedName;
};
exports.generateUsername = generateUsername;

const generateUniqueUsername = async (proposedName, prefix) => {
	try {
		proposedName = _.replace(proposedName, /\s+/g, '');
		let userCount = await User.count({
			where: { userName: { [Op.like]: '%' + proposedName + '%' } },
		});
		if (userCount > 0) {
			return generateUsername(prefix, proposedName) + '' + (userCount + 1);
		} else {
			return _.replace(proposedName, /\s+/g, '');
		}
	} catch (err) {
		customErrorLogger(err);
		throw err;
	}
};
exports.generateUniqueUsername = generateUniqueUsername;

exports.findUserWithSameData = async (query = {}) => {
	try {
		let userWithUsername = await User.findOne({ where: query });
		return !!(userWithUsername && userWithUsername.id);
	} catch (e) {
		customErrorLogger(e);
		throw e;
	}
};

exports.updateLastLogin = async (userId) => {
	try {
		let user = await User.findOne({ where: userId });
		user.lastLoginAt = new Date();
		let saveUser = await user.save();
		return !!saveUser;
	} catch (e) {
		customErrorLogger(e);
		throw e;
	}
};

exports.generateRandomPassword = () => {
	if (process.env.ENVIRONMENT === 'development') {
		//TODO remove after email integration
		return 'QWERTY1234';
	}
	const entropy = new Entropy({ total: 1e6, risk: 1e9, charset: charset16 });
	const string = entropy.smallID();
	return string;
};
