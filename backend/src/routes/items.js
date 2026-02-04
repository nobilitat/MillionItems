const express = require('express');
const router = express.Router();

// Получение доступных элементов
router.get('/available', async (req, res) => {
  try {
    const { offset = 0, limit = 20, search = '' } = req.query;

    const cacheKey = `available_${offset}_${limit}_${search}`;

    const items = await req.queue.addToQueue('get', cacheKey, {
      fn: () => req.storage.getAvailableItems(
        parseInt(offset),
        parseInt(limit),
        search
      )
    });

    // Для инфинити-скролла нужно знать общее количество
    const total = req.storage.getStats().totalItems - req.storage.data.selected.items.size;

    res.json({
      success: true,
      data: items,
      pagination: {
        offset: parseInt(offset),
        limit: parseInt(limit),
        total,
        hasMore: (parseInt(offset) + parseInt(limit)) < total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Получение выбранных элементов
router.get('/selected', async (req, res) => {
  try {
    const items = await req.queue.addToQueue('get', 'all_selected', {
      fn: () => req.storage.getSelectedItems()
    });
    
    res.json({
      success: true,
      data: items,
      pagination: {
        total: req.storage.data.selected.items.size
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Добавление нового элемента
router.post('/', async (req, res) => {
  try {
    const { customId } = req.body;

    const newItem = await req.queue.addToQueue('add', customId);
    res.json({
      success: true,
      data: newItem
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Добавление элемента в выбранные
router.post('/:id/select', async (req, res) => {
  try {
    const { id } = req.params;
    await req.queue.addToQueue('update', parseInt(id), { action: 'select' });

    res.json({
      success: true,
      message: `Item ${id} added to selected`
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Удаление из выбранных
router.delete('/:id/select', async (req, res) => {
  try {
    const { id } = req.params;
    await req.queue.addToQueue('update', parseInt(id), { action: 'deselect' });

    res.json({
      success: true,
      message: `Item ${id} removed from selected`
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Обновление порядка выбранных (Drag&Drop)
router.put('/selected/order', async (req, res) => {
  try {
    const { order } = req.body; // [id1, id2, id3, ...]

    if (!Array.isArray(order)) {
      throw new Error('Order must be an array');
    }

    await req.queue.addToQueue('update', order.map(id => parseInt(id)), { action: 'reorder' });

    res.json({
      success: true,
      message: 'Order updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;