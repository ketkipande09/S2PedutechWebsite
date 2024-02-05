const { body, param, query, validationResult } = require('express-validator');

exports.schemaValidation = {
  updateProfile: [
    body('userName', 'Profile Name cannot be blank').exists(),
    body('firstName', 'First Name cannot be blank').optional(),
    body('lastName', 'Last Name cannot be blank').optional(),
    body('email', 'Email cannot be blank').exists(),
    body('mobileNumber', 'Mobile Number cannot be blank').optional(),
    body('mobileCode', 'Mobile Code cannot be blank').optional(),
    body('dob', 'Date of birth can be blank').optional(),
    body('gender', 'Gender can be blank').optional(),
    body('bio', 'Bio can be blank').optional(),
    body('countryCode', 'Country Code cannot be blank').optional(),
    body('countryName', 'Country Name cannot be blank').optional(),
    body('pincode', 'Pincode cannot be blank').optional(),
    body('city', 'City cannot be blank').optional(),
    body('state', 'State cannot be blank').optional(),
    body('location', 'Residence Cannot be blank').optional(),
    body('websiteUrl', 'Website Url can be blank').optional(),
    body('profilePicture', 'Picture Url can be blank').optional(),
    body('coverPicture', 'Cover Picture Url Can be blank').optional(),
  ],

  create: [
    body('userName', 'Please enter User Name address').exists(),
    body('email', 'Email cannot be blank').exists().isEmail(),
    body('password', 'Please enter the user password').exists(),
  ],

  login: [
    body('email', 'Email cannot be blank').exists().isEmail(),
    body('password', 'Please enter the user password').exists(),
  ],
  course: [
    body('name', 'Please enter Course Name').exists(),
    body('description', 'Please enter Course Description').exists(),
    // body('password', 'Please enter the user password').exists(),
  ],
  updateCourse: [body('name', 'Please enter name').exists()],

  placement: [
    body('studentName', 'Please enter name').exists(),
    body('collage', 'Please enter collage').exists(),
    body('company', 'Please enter company').exists(),
  ],
  updatePlacement: [
    body('studentName', 'Please enter name').exists(),
    body('collage', 'Please enter collage').exists(),
    body('company', 'Please enter company').exists(),
  ],
  event: [
    body('name', 'Please enter event Name').exists(),
    body('description', 'Please enter event Description').exists(),
    body('eventName', 'Please enter event Description').exists(),
    // body('date_time', 'Please enter event date and time').exists(),

    // body('password', 'Please enter the user password').exists(),
  ],
  updateEvent: [body('name', 'Please enter name').exists()],
  transition_course: [body('course', 'Please enter course').exists()],

  //feedback
  feedback: [
    body('name', 'Please enter name').exists(),
    body('eventId', 'Please enter eventId').exists(),
    body('collegeName', 'Please enter collegeName').exists(),
    body('branch', 'Please enter branch').exists(),
    body('yearOfPassing', 'Please enter yearOfPassing').optional(),
    body('mobile', 'Please enter mobile').exists(),
    body('email', 'Please enter email').exists(),
    body('remark', 'Please enter remark').exists(),
  ],

  updateFeedback: [
    body('name', 'Please enter name').exists(),
    body('mobile', 'Please enter mobile').optional(),
    body('email', 'Please enter email').exists(),
    body('remark', 'Please enter remark').exists(),
  ],
  enquiry: [
    body('name', 'Please enter name').exists(),
    body('course', 'Please enter course').optional(),
    body('message', 'Please enter message').optional(),
    body('mobile', 'Please enter mobile').exists(),
    body('email', 'Please enter email').exists(),
  ],
  transition_course: [
    body('average_Salary_Hike', 'Please enter Average Salary Hike').optional(),
    body('course', 'Please enter course').exists(),
    body('duration', 'Please enter Duration').optional(),
    body('mentor', 'Please enter Mentor').exists(),
    body('average_Salary', 'Please enter Average Salary').exists(),
    body('description', 'Please enter Description').exists(),
  ],
  updateTransition: [body('course', 'Please enter course').exists()],
  home: [
    body('bulletPoint', 'Please enter Bullet Point').optional(),
    body('placementCount', 'Please enter Placement Count').exists(),
  ],
  slider: [
    body('studentName', 'Please enter Student Name').optional(),
    body('companyName', 'Please enter Company Name').optional(),
    body('collegeName', 'Please enter College Name').optional(),
  ],
  resetPassword: [
    body('id', 'Please enter valid id').exists(),
    body('oldPassword', 'Please enter a valid oldPassword.').exists(),
    body('newPassword', 'Please enter a valid newPassword.').exists(),
  ],
  org: [
    body('email', 'Please enter email').exists(),
    body('orgName', 'Please enter Organization Name').exists(),
    body('address', 'Please enter address').exists(),
    body('mobile', 'Please enter mobile No.').exists(),
    body('alternateMobile', 'Please enter alternate Mobile No.').optional(),
  ],

};
