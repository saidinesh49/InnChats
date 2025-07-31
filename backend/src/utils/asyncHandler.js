const asyncHandler = (wrappedFunction) => {
  return async (req, res, next) => {
    try {
      await wrappedFunction(req, res, next);
    } catch (error) {
      const StatusCode = error?.StatusCode || 500;
      const message = error?.message || "Something went wrong";
      res.status(StatusCode).json({
        success: true,
        message: message,
      });
    }
  };
};

export { asyncHandler };
