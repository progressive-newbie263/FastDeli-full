const express = require('express');
const cors = require('cors');
const app = express();
const port = 5002;

app.use(cors());

app.get('/', (req, res) => {
  res.send('Chào bạn đến với trang vận chuyển!');
});

app.listen(port, () => {
  console.log(`Delivery service running on port ${port}`);
});
