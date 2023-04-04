const jwt = require('jsonwebtoken');

// set token secret and expiration date
const secret = 'mysecretsshhhhh';
const expiration = '2h';

module.exports = {
  // function for our authenticated routes
  authMiddleware: function ({ req, res, next }) {
    // allows token to be sent via headers
    console.log(req);

    const token = req.headers.authorization?.split(' ')[1] || '';

    if (!token) {
      return res.status(400).json({ message: 'You have no token!' });
    }

    // verify token and get user data out of it
    try {
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      req.user = data;
    } catch {
      console.log('Invalid token');
      return res.status(400).json({ message: 'invalid token!' });
    }

    // send to next endpoint
    next();
  },
  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };

    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
  authMiddleware: ({ req, context = {} }) => {
    const token = req.headers.authorization?.split(' ').pop() || '';
    if (!token) {
      return context;
    }

    try {
      const { data } = jwt.verify(token, secret);
      context.user = data;
    } catch (err) {
      console.log(err);
    }

    return context;
  },
};
