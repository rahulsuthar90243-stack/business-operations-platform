


const roleMiddleware = (...allowedRoles) => {
  // allowedRoles = ["admin", "manager"] etc.


  return (req, res, next) => {
    const userRole = req.user?.role || req.user?.userRole;
    // console.log(userRole);

    // check user login
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!userRole) {
      return res.status(403).json({
        success: false,
        message: "User role not found.",
      });
    }

    console.log(allowedRoles)
    console.log(userRole)

    // User role allowed check
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    // Role allowed
    next();
  };
};

export default roleMiddleware;