const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
dotenv.config({ path: '.env' });

const User = require('./models').User;
bcrypt.hash('45TCZeDZXuQN4p29', bcrypt.genSaltSync(8)).then(function (password) {
	console.log(password);
	User.create({
		username: 'superadmin',
		email: 'superadmin@gmail.com',
		firstName: 'Super',
		lastName: 'Admin',
		password: password,
		role: 'SUPER_ADMIN',
		isEmailVerified: true,
		isMobileNumberVerified: true,
	}).then((user) => {
		console.log(user.get('email'));
	});
});


// {
//     "userName": "superadmin",
//     "email": "superadmin@gmail.com",
//     "firstName": "Super",
//     "lastName": "Admin",
//     "role": "SUPER_ADMIN",
//     "password": "admin@1234",
//     "status": "ACTIVE",
//     "permissions": "yes",
//     "mobileCode": null,
//     "city": null,
//     "state": null,
//     "location": null,
//     "pinCode": null,
//     "gender": null,
//     "websiteUrl": null,
//     "bio": null,
//     "dob": null,
//     "verificationToken": null,
//     "verificationTokenExpireAt": null,
//     "passwordResetToken": null,
//     "passwordResetExpires": null,
//     "countryCode": null,
//     "countryName": null,
//     "mobileNumber": null,
//     "isEmailVerified": true,
//     "isMobileNumberVerified": true,
//     "google": null,
//     "facebook": null,
//     "lastLoginAt": null,
//     "profilePicture": null,
//     "socialProfilePicture": null,
//     "coverPicture": null
// }