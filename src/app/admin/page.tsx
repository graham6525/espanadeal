"use client";

import { useEffect, useState } from "react";

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  total: number;
  status: string;
}

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les données depuis Turso via notre API
  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await fetch("/api/orders");
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setOrders(orders.map((order) => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ));
      }
    } catch (error) {
      alert("No se pudo actualizar el estado.");
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("¿Está seguro de que desea eliminar este pedido del historial?")) return;

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setOrders(orders.filter((order) => order.id !== orderId));
      }
    } catch (error) {
      alert("No se pudo eliminar el pedido.");
    }
  };

  if (loading) {
    return <div className="admin-container"><p>Cargando pedidos desde Turso...</p></div>;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1 className="admin-title"><i className="fas fa-user-shield"></i> Panel de Control - Administración</h1>
        <span className="admin-badge">{orders.length} Pedido(s) recibido(s)</span>
      </div>

      {orders.length === 0 ? (
        <div className="admin-empty-state">
          <i className="fas fa-inbox admin-empty-icon"></i>
          <h2>No hay ningún pedido registrado aún</h2>
          <p>Las compras realizadas por los clientes aparecerán automáticamente aquí.</p>
        </div>
      ) : (
        <div className="admin-orders-list">
          {orders.map((order) => (
            <div key={order.id} className="admin-order-card">
              <div className="admin-card-header">
                <div className="admin-order-info-group">
                  <span className="admin-label">ID de Pedido: </span>
                  <strong className="admin-order-id">#{order.id}</strong>
                </div>
                <div className="admin-order-info-group">
                  <span className="admin-label">Fecha: </span>
                  <strong className="admin-order-date">{order.date}</strong>
                </div>
                <div className="admin-order-info-group">
                  <span className="admin-label">Estado: </span>
                  <span className={`admin-status-pill status-${order.status.toLowerCase().replace(/\s+/g, "-")}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="admin-card-body">
                <h4 className="admin-section-subtitle">Artículos comprados :</h4>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Categoría</th>
                      <th>Precio unitario</th>
                      <th className="text-center">Cantidad</th>
                      <th className="text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map((item) => (
                      <tr key={item.id}>
                        <td className="product-name-cell">{item.name}</td>
                        <td className="product-cat-cell">{item.category}</td>
                        <td>{item.price} €</td>
                        <td className="text-center">x{item.quantity}</td>
                        <td className="text-right subtotal-cell">{(item.price * item.quantity).toLocaleString()} €</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="admin-card-footer">
                <div className="admin-status-control">
                  <span className="control-label">Cambiar estado del pedido:</span>
                  <select 
                    value={order.status} 
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="admin-select"
                  >
                    <option value="Pendiente de pago">Pendiente de pago</option>
                    <option value="Pagado">Pagado (Recibo Validado)</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>

                <div className="admin-actions-summary">
                  <div className="admin-total-amount">
                    <span>Monto Total a Recibir: </span>
                    <strong className="total-price-display">{order.total.toLocaleString()} €</strong>
                  </div>
                  <button onClick={() => handleDeleteOrder(order.id)} className="admin-delete-btn" title="Eliminar historial">
                    <i className="far fa-trash-alt"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}