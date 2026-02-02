const ItemCard = ({ item, isSelected, onClick, type }) => {
  return (
    <div
      className={`item-card ${type} ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <span className="badge bg-primary me-2">
            {item.id}
          </span>
          <span>{item.name}</span>
        </div>
        
        {isSelected && type === 'available' && (
          <i className="bi bi-check-circle-fill text-success"></i>
        )}
      </div>
    </div>
  );
};

export default ItemCard;