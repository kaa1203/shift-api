import { CustomError } from "./errorMiddleware.js";

const checkAccountType = (req, _res, next) => {
  const accountType = req.user?.accountType;

  if (!["super admin", "admin"].includes(accountType))
    return next(new CustomError("Unauthorized access", 403));

  next();
};

export default checkAccountType;
