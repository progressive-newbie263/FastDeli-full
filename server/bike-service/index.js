const express = require('express');
const cors = require('cors');
const app = express();
const port = 5003;

app.use(cors());

app.get('/', (req, res) => {
  res.send('Chào bạn đến với trang đặt xe máy!');
});

app.listen(port, () => {
  console.log(`Bike service running on port ${port}`);
});
