const multer = require('multer');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedExtensions = /\.(txt|md)$/i;
  const allowedMimetypes = /text\/plain|text\/markdown|application\/octet-stream|application\/rtf/;

  const hasValidExtension = allowedExtensions.test(file.originalname);
  
  if (hasValidExtension) {
    cb(null, true);
  } else {
    const error = new Error('Unsupported file type. Only .txt and .md files are allowed.');
    error.statusCode = 400;
    cb(error, false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  }
});

const handleUpload = (req, res, next) => {
  const uploadSingle = upload.single('file');
  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        const error = new Error('File is too large. Maximum size is 2MB.');
        error.statusCode = 400;
        return next(error);
      }
      const error = new Error(err.message);
      error.statusCode = 400;
      return next(error);
    } else if (err) {
      return next(err);
    }
    
    if (!req.file) {
      const error = new Error('No file provided.');
      error.statusCode = 400;
      return next(error);
    }
    
    next();
  });
};

module.exports = handleUpload;
