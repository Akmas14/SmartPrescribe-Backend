const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader?.startsWith("Bearer "))
    return res.status(401).json({ message: "Unauthoried" });
  const test = authHeader
  const test2 = authHeader.split(" ")
  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: err.message });
    req.Role = decoded.UserInfo.Role;
    req.userId = decoded.UserInfo.userid;
    req.email = decoded.UserInfo.Email;
    req.phone = decoded.UserInfo.PhoneNumber;
    req.FullName = decoded.UserInfo.FullName;
    next();
  });
};



module.exports = authenticate;