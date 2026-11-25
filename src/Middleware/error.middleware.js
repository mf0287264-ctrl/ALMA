const errorHandler = (error, req, res, next) => {
  if (res.headersSent) return next(error);
  let status = Number(error.statusCode || error.status || 500);
  if (status < 400 || status > 599) status = 500;
  if (error.name === 'MulterError' || error.name === 'ValidationError' || error.name === 'CastError') status = 400;
  if (error.code === 11000) status = 409;
  if (status >= 500) console.error('Request failed', { name: error.name, code: error.code, requestId: req.requestId });
  const message = status >= 500 ? 'The request could not be completed. Please try again.' : error.code === 11000 ? 'An account or resource with these details already exists.' : error.message || 'Invalid request.';
  return res.status(status).json({ success: false, message, error: message, request_id: req.requestId });
};
export default errorHandler;
