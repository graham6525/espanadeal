"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CartPage() {
  // Le "as any" force TypeScript à accepter 'clearCart' même s'il manque dans ton interface de type locale
  const { cart, clearCart, updateQuantity, removeFromCart } = useCart() as any;
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentOrderRef, setCurrentOrderRef] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const totalPrice = cart.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const orderRef = Math.floor(100000 + Math.random() * 900000).toString();
    setCurrentOrderRef(orderRef);

    const newOrder = {
      id: orderRef,
      date: new Date().toLocaleString("es-ES"),
      items: cart,
      total: totalPrice
    };

    try {
      // Envoi direct vers la base de données Turso via notre API
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder),
      });

      if (response.ok) {
        setShowPaymentModal(true);
      } else {
        alert("Hubo un error al procesar el pedido en el servidor.");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión. Inténtelo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowPaymentModal(false);
    if (typeof clearCart === "function") {
      clearCart();
    }
    router.push("/");
  };

  if (cart.length === 0 && !showPaymentModal) {
    return (
      <div className="cart-empty-container">
        <i className="fas fa-shopping-bag empty-icon"></i>
        <h2>Su carrito está vacío</h2>
        <p>Parece que aún no ha añadido ningún producto.</p>
        <Link href="/" className="btn-back-home">Continuar comprando</Link>
      </div>
    );
  }

  return (
    <div className="cart-page-container">
      <h1 className="page-title">Mi Carrito ({cart.length})</h1>
      <div className="cart-content-wrapper">
        <div className="cart-items-list">
          {cart.map((item: any) => (
            <div key={item.id} className="cart-item-card">
              <div className="cart-item-img-wrapper">
                <img src={item.image} alt={item.name} className="cart-item-img" />
              </div>
              <div className="cart-item-details">
                <span className="cart-item-cat">{item.category}</span>
                <h3 className="cart-item-name">{item.name}</h3>
                <p className="cart-item-unit-price">Precio unitario: {item.price} €</p>
              </div>
              <div className="cart-item-quantity">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} type="button">-</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} type="button">+</button>
              </div>
              <div className="cart-item-actions">
                <p className="cart-item-subtotal">{(item.price * item.quantity).toLocaleString()} €</p>
                <button onClick={() => removeFromCart(item.id)} className="btn-remove-item" type="button">
                  <i className="far fa-trash-alt"></i>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary-card">
          <h3>Resumen del pedido</h3>
          <div className="summary-row"><span>Subtotal</span><span>{totalPrice.toLocaleString()} €</span></div>
          <div className="summary-row"><span>Envío</span><span className="free-shipping">Gratis</span></div>
          <div className="summary-divider"></div>
          <div className="summary-row total-row"><span>Total</span><span>{totalPrice.toLocaleString()} €</span></div>
          <button className="btn-checkout" onClick={handleCheckout} disabled={isSubmitting} type="button">
            {isSubmitting ? "Procesando..." : "Lanzar una commande / Tramitar pedido"}
          </button>
        </div>
      </div>

      {showPaymentModal && (
        <div className="payment-modal-overlay">
          <div className="payment-modal-card">
            <div className="payment-modal-header">
              <i className="fas fa-university payment-header-icon"></i>
              <h2>Instrucciones de Pago</h2>
              <p>Su pedido ha sido registrado con éxito. Siga los pasos a continuación para realizar el pago.</p>
            </div>
            <div className="payment-modal-details">
              <strong className="payment-method-title">Pago por transferencia bancaria</strong>
              <p><strong>Beneficiario:</strong> Jean Dupont</p>
              <p><strong>IBAN:</strong> FR76 XXXX XXXX XXXX XXXX XXXX XXX</p>
              <p><strong>BIC:</strong> XXXXXXXX</p>
              <p className="payment-reference-row"><strong>Referencia:</strong> Pedido #{currentOrderRef}</p>
            </div>
            <div className="payment-modal-notice">
              <i className="fas fa-info-circle"></i> 
              Después de realizar le pago, debe enviar el recibo por correo electrónico a <strong>support@deal-espana.com</strong>.
            </div>
            <button onClick={handleCloseModal} className="btn-modal-confirm" type="button">Entendido y Confirmar</button>
          </div>
        </div>
      )}
    </div>
  );
}  