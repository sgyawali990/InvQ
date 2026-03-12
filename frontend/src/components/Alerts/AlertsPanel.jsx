export default function AlertsPanel({ inventory }) {
  const lowStock = inventory.filter((i) => i.quantity <= 5);
  const expiringSoon = inventory.filter((i) => {
    const expiryDate = new Date(i.expiration);
    const today = new Date();
    const diffDays = (expiryDate - today) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  });

  return (
    <div className="alerts">
      {lowStock.length > 0 && (
        <div className="alert low-stock">
          <h3>Low Stock</h3>
          {lowStock.map((item) => (
            <p key={item.id}>{item.name} ({item.quantity} left)</p>
          ))}
        </div>
      )}

      {expiringSoon.length > 0 && (
        <div className="alert expiration">
          <h3>Expiring Soon</h3>
          {expiringSoon.map((item) => (
            <p key={item.id}>{item.name} expires on {item.expiration}</p>
          ))}
        </div>
      )}
    </div>
  );
}