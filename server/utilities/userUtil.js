require('dotenv').config();
const JWT = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET_KEY || 'secret';
const rateLimit = require('express-rate-limit');
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login attempts, please try again later"
});

// if (!secretKey) {
//   throw new Error('JWT_SECRET_KEY is not defined in environment variables');
// }

function createTokenForUser(user) {
  const payload = {
    id: user._id,
    //email: user.email,
    role: user.role,
  };
  const options = {
    expiresIn: '1d',
  };
  const token = JWT.sign(payload, secretKey, options);
  return token;
};

function validateToken(token) {
  try {
    const payload = JWT.verify(token, secretKey);
    return payload;
  }
  catch (err) {
    console.error('Token validation error:', err);
    return null;
  }
};

const authenticateUser = (req, res, next) => {
  //  const authHeader = req.headers.authorization;
  //  if (!authHeader) {
  //      return res.status(401).json({ success: false, message: 'Authorization header is missing' });
  //  }
  //  const [type, token] = authHeader.split(' ');
  //  if (type !== 'Bearer' || !token) {
  //      return res.status(401).json({ success: false, message: 'Invalid auth header format' });
  //  }
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ success: false, message: 'Please Sign in first (Authorization token is missing)' });
  }
  try {
    const userPayload = validateToken(token);
    if (!userPayload) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    req.user = userPayload;
    res.locals.user = userPayload;
    next();
  }
  catch (err) {
    console.error('Error while validating token:', err);
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
};

const authorizeAdmin = (req, res, next) => {
  const user = req.user;
  if (!user || !user.role || user.role != 'Admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  next();
};

module.exports = {
  createTokenForUser,
  validateToken,
  authenticateUser,
  authorizeAdmin,
  loginLimiter,
}