const jwt = require('jsonwebtoken');
const User = require('../../models').User;
const { OPTIONS } = require('../options/global.options');
// const customErrorLogger = require('../../shared/service/customExceptionHandler');
exports.authenticateJWT = function (force = true) {
  return function (req, res, next) {
    const secretOrKey = process.env.JWT_SECRET_KEY;
    let authHeader = req.headers.authorization;
     console.log("auth",req.headers.authorization);
    if (authHeader) {
      const token = authHeader.split(' ')[1];
       console.log("token", token);
      jwt.verify(token, secretOrKey, async function (err, jwt_payload) {
        if (err) {
          // customErrorLogger(err);
          return res.sendStatus(401);
        } else {
          console.log("jwt_payload", jwt_payload);
          if (jwt_payload && jwt_payload.id) {
            let existingUser = await User.findOne({
              where: {
                id: jwt_payload.id,
                status: OPTIONS.defaultStatus.ACTIVE,
              },
            });
            if (existingUser) {
              req.authenticated = true;
              req.user = existingUser;
              next();
            } else {
              return res.sendStatus(401);
            }
          } else if (!force) {
            next();
          } else {
            return res.sendStatus(403);
          }
        }
      });
    } else if (!force) {
      next();
    } else {
      return res.sendStatus(401);
    }
  };
};
