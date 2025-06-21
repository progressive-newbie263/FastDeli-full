const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const uploadRoute = require('./routes/avatarRoutes')

// Create Express app
const app = express();

// Enable CORS
app.use(cors());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'API is running...' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// cập nhật ảnh đại diện + lưu trữ vào cloudinary
app.use('/api/upload', uploadRoute);

// Start server
const PORT = config.port || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${config.env} mode on port ${PORT}`);
});