const express = require('express');
const cors = require('cors');
const config = require('./config/config');

//food category routes
const foodCategoryRoutes = require('./routes/foodCategories');
const restaurantRoutes = require('./routes/restaurants');
const foodRoutes = require('./routes/foods');
const orderRoutes = require('./routes/orders');
// const categoryRoutes = require('./routes/categories');
// const bannerRoutes = require('./routes/banners');
// const featuredItemRoutes = require('./routes/featuredItems');

const app = express();


// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/categories', foodCategoryRoutes);
app.use('/api/orders', orderRoutes);
// app.use('/api/categories', categoryRoutes);
// app.use('/api/banners', bannerRoutes);
// app.use('/api/featured-items', featuredItemRoutes);

app.get('/food-service/restaurants/:id');
app.get('/', (req, res) => {
  res.json({ message: 'API is running...' });
});



// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Đã xảy ra lỗi server!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});


// Start server
const PORT = config.port || 5001;
app.listen(PORT, () => {
  console.log(`Server running in ${config.env} mode on port ${PORT}`);
});