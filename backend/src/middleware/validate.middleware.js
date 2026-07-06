const validate = (schema) => (req, res, next) => {
  try {
    const validatedData = schema.parse(req.body);
    req.body = validatedData;
    next();
  } catch (error) {
    const formattedErrors = {};
    if (error && (error.issues || error.errors)) {
      const issues = error.issues || error.errors;
      issues.forEach(err => {
        const path = err.path ? err.path.join('.') : '';
        if (path) {
          formattedErrors[path] = err.message;
        } else {
          formattedErrors['body'] = err.message;
        }
      });
    } else {
      console.error(error);
    }
    return res.status(400).json({
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        fields: formattedErrors
      }
    });
  }
};

module.exports = validate;
