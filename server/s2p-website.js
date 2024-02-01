const express = require("express");
const compression = require("compression");
const bodyParser = require("body-parser");
const logger = require("morgan");
const https = require("https");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const errorHandler = require("errorhandler");
const lusca = require("lusca");
const dotenv = require("dotenv");
// const expressValidator = require('express-validator');
const cors = require("cors");
const lodash = require("lodash");
const _ = require("lodash");
const Sentry = require("@sentry/node");
var admin = require("firebase-admin");
var serviceAccount = require("./config/json/key.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
dotenv.config();
global._ = lodash;
// Router
const indexRouter = require("./controllers/index");


app.use(express.json());
// GZIP compress resources served
app.use(compression());

app.use(cors("*"));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json({ limit: "50mb" }));

app.use(
  logger("dev")
);
/**
 * Start Express server.
 */

app.set("port", process.env.PORT || 6060);
const server = app.listen(app.get('port'), () => {
 	console.log(
 		'%s App is running at http://localhost:%d in %s mode',
 		chalk.green('✓'),
 		app.get('port'),
 		app.get('env')
 	);
 	console.log('Press CTRL-C to stop\n');
 });
//   console.log(
//     '%s App is running at http://localhost:%d in %s mode',
//     chalk.green('✓'),
//     app.get('port'),
//     app.get('env')
//   );
//   console.log('Press CTRL-C to stop\n');
// });

var https_options = {
  key: fs.readFileSync(path.join(__dirname, "ssl", "private.key")),
  cert: fs.readFileSync(path.join(__dirname, "ssl", "certificate.crt")),
  ca: fs.readFileSync(path.join(__dirname, "ssl", "ca_bundle.crt")),
};
//const sslServer = https
//  .createServer(https_options, app)
 // .listen(process.env.PORT || 6060, () =>
 //   console.log("secure server on port : 6060")
//	  );
app.use(
  logger("dev", {
    // skip: function (req, res) {
    // 	return res.statusCode < 400;
    // },
  })
);
// const sslServer = https
//   .createServer(https_options, app)
//   .listen(process.env.PORT || 6060, () =>
//     console.log("secure server on port : 6060")
//   );


// app.use(expressValidator());
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));
app.disable("x-powered-by");

app.use(
  "/",
  express.static(path.join(__dirname, "public"), { maxAge: 31557600000 })
);
app.use("/image", express.static(path.join(__dirname, "assets")));
app.use(function (req, res, next) {
  if (process.env.NODE_ENV === "dev") {
    console.log("req body", req.body);
    console.log("req query", req.query);
    console.log("authorization", req.headers.authorization);
  }
  next();
});

process.on("unhandledRejection", (reason, p) => {
  console.log("Unhandled Rejection at: Promise", p, "reason:", reason);
});
// Routes
app.use("/", indexRouter);

// if (process.env.ENVIRONMENT === 'development' || process.env.NODE_ENV === 'development') {
// 	let apiDoc = require('./api_docs/v1');
// 	app.use('/api-docs', apiDoc);
// }

/**
 * Error Handler.
 */
if (process.env.NODE_ENV === "development") {
  app.use(errorHandler());
}
