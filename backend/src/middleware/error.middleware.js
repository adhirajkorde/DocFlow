const errorHandler = (err, req, res, next) => {
  // Handle JSON parse errors from body-parser
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: { message: 'Invalid JSON payload format', code: 'PARSE_ERROR' }
    });
  }

  // Handle Prisma unique constraint errors
  if (err.code === 'P2002') {
    const target = err.meta?.target || 'field';
    return res.status(400).json({
      error: { message: `Unique constraint failed on ${target}`, code: 'UNIQUE_CONSTRAINT_ERROR' }
    });
  }

  const statusCode = err.statusCode || 500;
  // Mask 500 errors in production
  const message = statusCode === 500 && process.env.NODE_ENV === 'production' 
    ? 'Internal Server Error' 
    : err.message || 'Internal Server Error';
    
  const code = err.code || (statusCode === 500 ? 'SERVER_ERROR' : 'ERROR');

  const response = {
    error: {
      message,
      code,
    }
  };

  if (process.env.NODE_ENV !== 'production' && statusCode === 500) {
    console.error(err);
    response.error.stack = err.stack;
  } else if (statusCode === 500) {
    console.error(err); // Still log 500s to server logs
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
