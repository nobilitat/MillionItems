const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const QueueManager = require('./storage/QueueManager')
const ItemStorage = require('./storage/ItemStorage');
const itemsRouter = require('./routes/items');

const app = express();
const PORT = process.env.PORT || 3001;

const storage = new ItemStorage();
const queueManager = new QueueManager(storage);

app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../../frontend-react/build');
  app.use(express.static(frontendPath));
}

app.use((req, res, next) => {
  req.storage = storage;
  req.queue = queueManager;
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

if (process.env.NODE_ENV === 'production') {
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend-react/build/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`\nServer running on http://localhost:${PORT}`);
  console.log(`Server health on http://localhost:${PORT}/health`);
  console.log(`Get items on http://localhost:${PORT}/api/items/available?offset=0&limit=20`);
  console.log(`Select item on http://localhost:${PORT}/api/items/{id}/select`);
  console.log(`Search item by Id on http://localhost:${PORT}/api/items/available?offset=0&limit=5&search={id}`);
});