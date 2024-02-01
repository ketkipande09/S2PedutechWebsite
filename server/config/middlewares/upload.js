const multer = require('multer');
const DIR_PATH = './assets/image';
const DIR_PATH_EDU = './assets/eventImage';
const DIR_PATH_COURSE = './assets/courseImage';
const DIR_PATH_SLIDER = "./assets/sliderImage";
const DIR_PATH_PDF = './assets/pdf'
const DIR_PATH_LOGO = './assets/logo';
const DIR_PATH_CLIENT = './assets/client';
const DIR_PATH_PLACEMENT = './assets/placement';
const imageFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png"

  ) {
    cb(null, true);
  } else if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    console.log("file.mimetype", file.mimetype);
    cb(null, false);
  }
};
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // console.log('upload file...................', JSON.stringify(file));
    // console.log('file file...................', JSON.stringify(req.file), req.body.key);
    if (req.body.key == 'image') {
      cb(null, DIR_PATH);
    } else if (req.body.key == 'event') {
      cb(null, DIR_PATH_EDU);
    } else if (req.body.key == "course") {
      cb(null, DIR_PATH_COURSE);
    } else if (req.body.key == "slider") {
      console.log("slider", DIR_PATH_SLIDER);
      cb(null, DIR_PATH_SLIDER);
    } else if (req.body.key == 'pdf') {
      cb(null, DIR_PATH_PDF);
      console.log('DIR_PATH_PDF', DIR_PATH_PDF);
    } else if (req.body.key == 'logo') {
      console.log("logo");
      cb(null, DIR_PATH_LOGO);
      console.log('DIR_PATH_LOGO', DIR_PATH_LOGO);
    } else if (req.body.key == 'client') {
      console.log("client");
      cb(null, DIR_PATH_CLIENT);
      console.log('DIR_PATH_CLIENT', DIR_PATH_CLIENT);
    } else if (req.body.key == 'placement') {
      console.log("placement");
      cb(null, DIR_PATH_PLACEMENT);
      console.log('DIR_PATH_PLACEMENT', DIR_PATH_PLACEMENT);
    }
    else {
      cb(null, DIR_PATH);
    }
  },
  filename: (req, file, cb) => {
    // console.log("filename", filename);
    cb(null, `${Date.now()}-bezkoder-${file.originalname}`);

  },
});

var uploadFile = multer({ storage: storage, fileFilter: imageFilter });
// console.log("uploadFile", uploadFile);
module.exports = uploadFile;
