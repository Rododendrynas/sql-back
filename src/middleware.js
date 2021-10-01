const jwt = require('jsonwebtoken');

const { jwtSecret } = require('./config');

module.exports = {
  isLoggedIn: async (req, res, next) => {
    try {
      const payload = jwt.verify(
        req.headers.authorization.split(' ')[1],
        jwtSecret,
      );
      req.user = payload;

      return next();
    } catch (err) {
      return res.status(401).send({ err: 'Unauthorized. Invalid token' });
    }
  },
};
