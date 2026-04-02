const jwt = require('jsonwebtoken');
const { sharedPool } = require('../../food-service/config/db');

const driverAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.header('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Missing auth token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    if (!decoded || decoded.role !== 'driver') {
      return res.status(403).json({ success: false, message: 'Forbidden: driver role required' });
    }

    const userId = decoded.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Invalid token payload' });
    }

    const userQuery = `
      SELECT user_id, full_name, phone_number, avatar_url, role, is_active
      FROM users
      WHERE user_id = $1 AND role = 'driver' AND is_active = true
      LIMIT 1
    `;
    const userRes = await sharedPool.query(userQuery, [userId]);
    if (userRes.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Driver account inactive or not found' });
    }

    req.user = userRes.rows[0];
    req.userId = userRes.rows[0].user_id;
    next();
  } catch (err) {
    const msg = err?.message || 'Unauthorized';
    return res.status(401).json({ success: false, message: msg });
  }
};

module.exports = driverAuth;

