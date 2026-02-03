import React, { useState, useEffect } from 'react';
import { Card, Form, InputGroup } from 'react-bootstrap';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import SortableItem from './SortableItem';

const RightPanel = ({ selectedIds, order, onDeselectItem, onReorder }) => {

    const [items, setItems] = useState([]);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
            distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Загрузка элементов при изменении selectedIds
    useEffect(() => {
        const loadItems = async () => {
            if (selectedIds.size === 0) {
                setItems([]);
                return;
            }
            
            setIsLoading(true);
            
            try {
                const selectedArray = Array.from(selectedIds);
                console.log('Загрузка элементов для ID:', selectedArray);
                
                const response = await fetch(
                   `${process.env.REACT_APP_API_BASE_URL}/selected?ids=${Array.from(selectedIds).join(',')}`
                );
                
                if (!response.ok) {
                    throw new Error('Ошибка загрузки');
                }
                
                const data = await response.json();
                console.log('Получены выбранные элементы:', data.data);

                const filteredItems = data.data.filter(item => 
                    selectedIds.has(item.id)
                );
                
                console.log('Отфильтрованные элементы:', filteredItems);

                const sortedItems = filteredItems.sort((a, b) => {
                    const indexA = order.indexOf(a.id);
                    const indexB = order.indexOf(b.id);
                    
                    // Если оба есть в order, сортируем по order
                    if (indexA !== -1 && indexB !== -1) {
                    return indexA - indexB;
                    }
                    
                    // Если только один есть в order, он идет первым
                    if (indexA !== -1) return -1;
                    if (indexB !== -1) return 1;
                    
                    // Иначе сортируем по ID
                    return a.id - b.id;
                });
                
                setItems(sortedItems);
                console.log('Установлены элементы:', sortedItems.map(item => item.id));
            } catch (error) {
                console.error('Ошибка загрузки:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadItems();
    }, [selectedIds, order]);

    const filteredItems = search 
        ? items.filter(item => item.id.toString().includes(search))
        : items;

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (!over) return;

        if (active.id !== over.id) {
            setItems((currentItems) => {
            const oldIndex = currentItems.findIndex(item => item.id === active.id);
            const newIndex = currentItems.findIndex(item => item.id === over.id);

            if (oldIndex === -1 || newIndex === -1) return currentItems;

            const newItems = arrayMove(currentItems, oldIndex, newIndex);

            const newOrder = newItems.map(item => item.id);
            onReorder(newOrder);
            
            return newItems;
            });
        }
    };

    // Обработчик удаления
    const handleRemove = (itemId) => {
        onDeselectItem(itemId);
    };

    return (
    <Card className="list-container">
        <div className="list-header">
        <h5 className="mb-0">
            Выбранные элементы
            <span className="badge bg-success ms-2">{selectedIds.size}</span>
        </h5>
        </div>

        <div className="list-header border-top-0">
        <InputGroup>
            <InputGroup.Text>
            <i className="bi bi-search"></i>
            </InputGroup.Text>
            <Form.Control
            type="text"
            placeholder="Поиск по ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            />
        </InputGroup>
        </div>

        <div className="list-content" style={{ overflowY: 'auto', maxHeight: '70vh' }}>
        {isLoading ? (
            <div className="text-center text-muted py-5">
            Загрузка...
            </div>
        ) : selectedIds.size === 0 ? (
            <div className="text-center text-muted py-5">
            Нет выбранных элементов
            </div>
        ) : filteredItems.length === 0 ? (
            <div className="text-center text-muted py-5">
            {search ? 'Ничего не найдено' : 'Загрузка элементов...'}
            </div>
        ) : (
            <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
            >
            <SortableContext
                items={filteredItems.map(item => item.id)}
                strategy={verticalListSortingStrategy}
            >
                {filteredItems.map(item => (
                <SortableItem
                    key={`selected_${item.id}`}
                    item={item}
                    onRemove={handleRemove}
                />
                ))}
            </SortableContext>
            </DndContext>
        )}
        </div>
    </Card>
    );
};

export default RightPanel;