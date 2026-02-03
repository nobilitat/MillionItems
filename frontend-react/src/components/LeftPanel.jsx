import { useState, useEffect, useRef } from "react";
import { Card, Form, Button, InputGroup } from "react-bootstrap";
import ItemCard from "./ItemCard";

const LeftPanel = ({ selectedIds, onSelectItem, onAddItem }) => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [newItemId, setNewItemId] = useState("");
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0); // Новое состояние

  const listRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Загрузка элементов
  const loadItems = async (reset = false) => {
    const currentOffset = reset ? 0 : offset;
    if (!reset && !hasMore) return;

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/available?offset=${currentOffset}&limit=20&search=${search}`
      );
      const data = await response.json();

      if (reset) {
        setItems(data.data);
      } else {
        setItems((prev) => [...prev, ...data.data]);
      }
      setTotalCount(data.pagination.total);
      setHasMore(data.pagination.hasMore);
      setOffset(currentOffset + data.data.length);
    } catch (error) {
      console.error("Ошибка загрузки:", error);
    }
  };

  useEffect(() => {
    setItems((prev) => {
      const filtered = prev.filter((item) => !selectedIds.has(item.id));
      loadItems(true);

      return filtered;
    });
  }, [selectedIds]);

  // Загрузка при поиске с задержкой
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setOffset(0);
      setHasMore(true);
      loadItems(true);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [search]);

  // Первая загрузка
  useEffect(() => {
    loadItems(true);
  }, []);

  // Инфинити-скролл
  useEffect(() => {
    const handleScroll = () => {
      if (!listRef.current || !hasMore) return;

      const { scrollTop, scrollHeight, clientHeight } = listRef.current;
      if (scrollHeight - scrollTop - clientHeight < 100) {
        loadItems();
      }
    };

    const element = listRef.current;
    if (!element) return;

    element.addEventListener("scroll", handleScroll);
    return () => element.removeEventListener("scroll", handleScroll);
  }, [hasMore, offset, search, items]);

  // Обработчик добавления
  const handleAdd = async () => {
    if (!newItemId.trim()) return;

    const id = parseInt(newItemId);
    if (isNaN(id) || id < 1) return;

    await onAddItem(id);
    setNewItemId("");
    setOffset(0);
    setHasMore(true);
    loadItems(true);
  };

  // Обработчик выбора
  const handleSelect = (item) => {
    onSelectItem(item.id);
  };

  return (
    <Card className="list-container">
      <div className="list-header">
        <h5 className="mb-0">
          Доступные элементы
          <span className="badge bg-primary ms-2">{totalCount}</span>
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

      <div ref={listRef} className="list-content">
        {items.map((item) => (
          <ItemCard
            key={`available_${item.id}`}
            item={item}
            isSelected={selectedIds.has(item.id)}
            onClick={() => handleSelect(item)}
            type="available"
          />
        ))}
      </div>

      <div className="list-footer">
        <InputGroup>
          <Form.Control
            type="number"
            placeholder="ID нового элемента"
            value={newItemId}
            onChange={(e) => setNewItemId(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAdd()}
            min="1"
          />
          <Button
            variant="success"
            onClick={handleAdd}
            disabled={!newItemId.trim()}
          >
            Добавить
          </Button>
        </InputGroup>
      </div>
    </Card>
  );
};

export default LeftPanel;
