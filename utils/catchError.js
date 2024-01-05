const catchError = (res, error) => {
  console.log(error);
  return res.status(500).send({
    message: error.message || "Internal server error",
  });
};

module.exports = catchError;
