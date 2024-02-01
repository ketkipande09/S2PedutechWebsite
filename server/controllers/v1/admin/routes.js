const express = require('express');
const router = express.Router();

const user = require('./user/routes');
const courses = require('./courses/routes');
const event = require('./event/routes');
const enquiry = require('./enquiry/routes');
const feedback = require('./feedback/routes');
const Transition_course = require('./transition_course/routes');
const Home = require('./home/routes');
const Slider = require('./slider/routes');
const Org = require('./organization/routes');
const User = require('./portalRegistration/routes');
const client = require('./client/route');
const placement = require('./placement/route')




router.use('/portalRegistration', User);
router.use('/user', user);
router.use('/courses', courses);
router.use('/event', event);
router.use('/enquiry', enquiry);
router.use('/contact', feedback);     // for contact form
router.use('/transition', Transition_course);
router.use('/placement', placement);
router.use('/home', Home);
router.use('/slider', Slider);
router.use('/org', Org);
router.use('/client', client);

module.exports = router;
