const express = require('express');
const cors = require('cors');
require('dotenv').config();

const ItemStorage = require('./storage/ItemStorage');
const itemsRouter = require('./routes/items');

const app = express();
const PORT = process.env.PORT || 3001;

const storage = new ItemStorage();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  req.storage = storage;
  next();
});

app.use('/api/items', itemsRouter);

app.get('/health', (req, res) => {
  const stats = req.storage.getStats ? req.storage.getStats() : {};
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    ...stats
  });
});


app.listen(PORT, () => {
  console.log(`\nServer running on http://localhost:${PORT}`);
  console.log(`Server health on http://localhost:${PORT}/health`);
  console.log(`Get items on http://localhost:${PORT}/api/items/available?offset=0&limit=20`);
  console.log(`Select item on http://localhost:${PORT}/api/items/{id}/select`);
  console.log(`Search item by Id on http://localhost:${PORT}/api/items/available?offset=0&limit=5&search={id}`);
});