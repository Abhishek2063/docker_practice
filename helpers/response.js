function successResponse(data, message, statusCode = 200) {
    return {
      success: true,
      message,
      data,
      status_code: statusCode,
    };
  }
  
  function errorResponse(message, statusCode = 500) {
    return {
      success: false,
      error: message,
      status_code: statusCode,
    };
  }
  
  module.exports = {
    successResponse,
    errorResponse,
  };
  