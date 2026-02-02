import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableItem = ({ item, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
    userSelect: 'none',
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onRemove(item.id);
  };

  const handleClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="item-card selected draggable-item"
      {...attributes}
      {...listeners}
      onClick={handleClick}
    >
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <span className="me-2 text-muted">
            <i className="bi bi-grip-vertical"></i>
          </span>
          <span className="badge bg-success me-2">
            {item.id}
          </span>
          <span>{item.name}</span>
        </div>
        
        <button
          className="btn btn-lg btn-outline-danger"
          onClick={handleRemove}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <i className="bi bi-x"></i>
        </button>
      </div>
    </div>
  );
};

export default SortableItem;