import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import LeftPanel from './components/LeftPanel';
import RightPanel from './components/RightPanel';

function App() {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [order, setOrder] = useState([]);

  // Загружаем из localStorage один раз
  useEffect(() => {
    try {
      const saved = localStorage.getItem('million_items_app');
      if (saved) {
        const data = JSON.parse(saved);

        const ids = new Set(data.selectedIds || []);
        setSelectedIds(ids);

        const savedOrder = data.order || [];
        setOrder(savedOrder.filter(id => ids.has(id)));
      }
    } catch (err) {
      console.error('Ошибка загрузки:', err);
    }
  }, []);

  // Сохраняем при изменении
  useEffect(() => {
    const data = {
      selectedIds: Array.from(selectedIds),
      order: order
    };
    localStorage.setItem('million_items_app', JSON.stringify(data));
    
    console.log('Сохранено в localStorage:', data);
  }, [selectedIds, order]);

  // Выбрать элемент
  const handleSelectItem = async (itemId) => {
    if (selectedIds.has(itemId)) return;
    
    try {
      await fetch(`${process.env.REACT_APP_API_BASE_URL}/${itemId}/select`, { 
        method: 'POST' 
      });

      const newOrder = [...order, itemId];
      setOrder(newOrder);
      setSelectedIds(prev => new Set([...prev, itemId]));
      
      console.log('Элемент выбран:', itemId, 'Новый порядок:', newOrder);
    } catch (err) {
      console.error(err);
    }
  };

  // Убрать из выбранных
  const handleDeselectItem = async (itemId) => {
    if (!selectedIds.has(itemId)) return;
    
    try {
      await fetch(`${process.env.REACT_APP_API_BASE_URL}/${itemId}/select`, { 
        method: 'DELETE' 
      });

      const newOrder = order.filter(id => id !== itemId);
      setOrder(newOrder);
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });

      console.log('Элемент удален:', itemId, 'Новый порядок:', newOrder);
    } catch (err) {
      console.error(err);
    }
  };

  // Добавить элемент
  const handleAddItem = async (customId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customId })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        alert(`Ошибка добавления: ${data.error}`);
      }
      else {
        console.log('Элемент добавлен:', customId);
      }

    } catch (err) {
      alert(`Ошибка добавления: ${err.message}`);
    }
  };

  // Обновить порядок
  const handleReorder = (newOrder) => {
    // Фильтруем только те ID, которые есть в selectedIds
    const filteredOrder = newOrder.filter(id => selectedIds.has(id));
    setOrder(filteredOrder);
    
    console.log('Порядок обновлен:', filteredOrder);

    fetch(`${process.env.REACT_APP_API_BASE_URL}/selected/order`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: filteredOrder })
    }).catch(console.error);
  };

  return (
    <Container fluid className="app-container">
      <Row className="g-4" style={{ minHeight: '90vh' }}>
        <Col lg={6}>
          <LeftPanel
            selectedIds={selectedIds}
            onSelectItem={handleSelectItem}
            onAddItem={handleAddItem}
          />
        </Col>

        <Col lg={6}>
          <RightPanel
            selectedIds={selectedIds}
            order={order}
            onDeselectItem={handleDeselectItem}
            onReorder={handleReorder}
          />
        </Col>
      </Row>
    </Container>
  );
}

export default App;