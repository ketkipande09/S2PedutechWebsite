const moment = require('moment-timezone');
const { OPTIONS } = require('../../../config/options/global.options');
const timeZone = OPTIONS.timeZone;

var timeObj = {
    getTime: function () {
        return moment().tz(timeZone).format('HH:mm:ss');
    },
    getDate: function () {
        return moment().tz(timeZone).format('YYYY-MM-DD');
    },
    getDay: function () {
        return moment().tz(timeZone).weekday();
    },
    getDateTime: function () {
        return moment().tz(timeZone).format('YYYY-MM-DD HH:mm:ss');
    },
  
};
module.exports = timeObj;