import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'LiveSpace-super-secret-key';
// Generate token for a guest user
export function generateToken(userPayload) {
  return jwt.sign(userPayload, JWT_SECRET, { expiresIn: '7d' });
}

// REST middleware to verify token
export function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header provided.' });
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided.' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
}

// Socket.IO authentication middleware
export function socketAuthMiddleware(socket, next) {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error('Authentication error: Token required'));
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.user = decoded; // Attach user info to socket
    next();
  } catch (err) {
    return next(new Error('Authentication error: Invalid token'));
  }
}
