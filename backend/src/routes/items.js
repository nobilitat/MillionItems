const express = require('express');
const router = express.Router();

// Получение доступных элементов
router.get('/available', (req, res) => {
  try {
    const { offset = 0, limit = 20, search = '' } = req.query;
    
    const items = req.storage.getAvailableItems(
      parseInt(offset),
      parseInt(limit),
      search
    );
    
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
router.get('/selected', (req, res) => {
  try {
    const { offset = 0, limit = 20, search = '' } = req.query;
    
    const items = req.storage.getSelectedItems(
      parseInt(offset),
      parseInt(limit),
      search
    );
    
    res.json({
      success: true,
      data: items,
      pagination: {
        offset: parseInt(offset),
        limit: parseInt(limit),
        total: req.storage.data.selected.items.size,
        hasMore: (parseInt(offset) + parseInt(limit)) < req.storage.data.selected.items.size
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
router.post('/', (req, res) => {
  try {
    const { customId } = req.body;
    const newItem = req.storage.addItem(customId);
    
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
router.post('/:id/select', (req, res) => {
  try {
    const { id } = req.params;
    req.storage.addToSelected(parseInt(id));
    
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
router.delete('/:id/select', (req, res) => {
  try {
    const { id } = req.params;
    req.storage.removeFromSelected(parseInt(id));
    
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
router.put('/selected/order', (req, res) => {
  try {
    const { order } = req.body; // [id1, id2, id3, ...]
    
    if (!Array.isArray(order)) {
      throw new Error('Order must be an array');
    }
    
    req.storage.updateSelectedOrder(order.map(id => parseInt(id)));
    
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