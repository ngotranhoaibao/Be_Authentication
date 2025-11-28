export const successResponse = (res, data, message, statusCode = 200) => {
  res.status(statusCode).json({ success: true, message, data });
};

export const errorResponse = (res, status, message, errorCode = null) => {
  res.status(status).json({ success: false, message, errorCode });
};
