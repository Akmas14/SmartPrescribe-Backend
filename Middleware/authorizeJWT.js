const authorize = (Role) => {
    return (req, res, next) => {
        if (!Role.includes(req.Role)) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      next();
    };
  };
  
  module.exports = authorize;