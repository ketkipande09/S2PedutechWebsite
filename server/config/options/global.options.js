const _ = require('lodash');
const pug = require('pug');

const OPTIONS = {
	appVersion: '1.0.0',
	appSchemaUrl: 'project_name',
	timeZone: 'Asia/Kolkata',
	emailSenderName: 'email sender',
	randomUsernameSize: 4,
	randomShopSize: 4,
	resetPasswordExpireInDays: 720,
	defaultTax: 2,
	otpExpireInDays: 1,
	elasticSearchIndexes: {
		PRODUCT: 'product',
	},
	elasticSearchIndexModalNames: {
		PRODUCT: 'Product',
	},
	usersRoles: {
		SUPER_ADMIN: 'SUPER_ADMIN',
		ADMIN: 'ADMIN',
		STUDENT: 'STUDENT',
		// SUPPLIER: 'SUPPLIER',
		// CUSTOMER: 'CUSTOMER',
		// EMPLOYEE: 'EMPLOYEE',
		getAllRolesAsArray: function () {
			return [
				OPTIONS.usersRoles.SUPER_ADMIN,
				OPTIONS.usersRoles.ADMIN,
				OPTIONS.usersRoles.STUDENT,
				// OPTIONS.usersRoles.SUPPLIER,
				// OPTIONS.usersRoles.CUSTOMER,
				// OPTIONS.usersRoles.EMPLOYEE,
			];
		},
	},
	genders: {
		MALE: 'Male',
		FEMALE: 'Female',
		TRANSGENDER: 'Transgender',
	},
	otpVerifyActionTypes: {
		MOBILE_NUMBER_VERIFY: 'mobile_number_verify',
		RESET_PASSWORD: 'reset_password',
		ACCOUNT_VERIFY: 'account_verify',
	},
	defaultStatus: {
		ACTIVE: 'active',
		INACTIVE: 'inactive',
		UNAPPROVED: 'unapproved',
		APPROVED: 'approved',
		REJECTED: 'rejected',
		DELETED: 'deleted',
	},
	paymentModes: {
		CREDIT: 'credit',
		CASH: 'cash',
		CARD: 'card',
	},
	devicePlatforms: {
		ANDROID: 'android',
		IOS: 'ios',
		WEB: 'web',
	},
	emailSubjects: {
		ACCOUNT_WELCOME: 'Welcome mail',
		ACCOUNT_VERIFY: 'Verification OTP',
		ACCOUNT_ACTIVATE: 'Activate your account',
	},
	notificationMode: {
		NOTIFICATION_TRIGGER_ALL: 'notification_trigger_all',
		NOTIFICATION_TRIGGER_EMAIL: 'notification_trigger_email',
		NOTIFICATION_TRIGGER_IN_APP: 'notification_trigger_in_app',
	},
	notificationType: {
		FOLLOW_USER: 'follow_user',
		NEW_POST: 'new_post',
	},
	topicARNS: {
		globalNotificationARN: 'NotificationsTopic',
		postNewLikeARN: 'postNewLike',
		followARN: 'FollowTopic',
		newPostARN: 'newPostTopic',
		walletARN: 'TransactionPoint',
	},
	userPreferences: {
		mobileNumber: {
			name: 'MOBILE_NUMBER',
			title: 'Mobile Number',
			description: 'Are you sure you want to show Mobile Number',
		},
		profilePicture: {
			name: 'PROFILE_PICTURE',
			title: 'Profile Picture',
			description: 'Are you sure you want to show profile picture',
		},
		email: {
			name: 'EMAIL',
			title: 'Email',
			description: 'Are you sure you want to show your email',
		},
		getAsArray: () => {
			return [
				options.userPreferences.mobileNumber,
				options.userPreferences.profilePicture,
				options.userPreferences.email,
			];
		},
	},
	mediaTypes: {
		TRN_CERTIFICATE: 'trn_certificate',
		VAT_NUMBER: 'vat_number',
		NATIONAL_ID_CARD: 'national_id_card',
		TRADE_LICENSE: 'trade_license',
	},
	modal: {
		CATEGORY: 'Category',
		PRODUCT: 'Product',
	},
};
const generateURl = (filePath) => {
	return filePath ? process.env.CDN_WEB_STATIC + '/post/' + filePath : null;
};
const generateOTP = (length) => {
	if (process.env.ENVIRONMENT === 'development') {
		//TODO remove after sms integration
		return length > 4 ? 4444 : 4444;
	}
	return length > 4
		? Math.floor(10000 + Math.random() * 90000)
		: Math.floor(1000 + Math.random() * 9000);
};
const generateResponse = (code, payload, type, noWrapPayload) => {
	noWrapPayload = noWrapPayload || false;
	type = type || 'unknown';

	if (code && code >= 300) {
		payload = _.isArray(payload) ? payload : [payload];
		var plain_text_errors = payload.length > 0 && _.isString(payload[0]) ? payload : [];
		var object_errors = payload.length > 0 && _.isObject(payload[0]) ? payload : [];
		var output = {
			error: {
				errors: plain_text_errors,
				error_params: object_errors,
				code: code,
				type: type,
			},
		};
		return output;
	} else {
		// success data
		if (payload && !noWrapPayload) {
			return { result: payload };
		} else if (payload) {
			return payload;
		} else {
			return undefined;
		}
	}
};
const genAbsoluteUrl = (path, type, opt) => {
	switch (type) {
		case 'admin':
			return process.env.CLIENT_REQUEST_PROTOCOL + '://' + process.env.ADMIN_HOST + path;
		default:
			return process.env.CLIENT_REQUEST_PROTOCOL + '://' + process.env.CUSTOMER_HOST + path;
	}
};
const generateHtml = (template, data) => {
	return pug.renderFile(__dirname + '/../../public/email_templates/' + template + '.pug', data);
};
module.exports = {
	OPTIONS,
	generateURl,
	generateOTP,
	genAbsoluteUrl,
	generateResponse,
	generateHtml,
};
