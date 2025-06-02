require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV,
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE,
  defaultAvatarUrl: process.env.DEFAULT_AVATAR_URL || 'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg'
};