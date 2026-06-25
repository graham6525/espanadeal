"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { cart, clearCart, updateQuantity, removeFromCart } = useCart() as any;
  const [showSuccessPopup, setShowSuccessPopup] = useState(false); // Premier popup : Succès
  const [showPaymentModal, setShowPaymentModal] = useState(false); // Deuxième popup : Paiement
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
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder),
      });

      if (response.ok) {
        // Étape 1 : On affiche d'abord le popup de succès
        setShowSuccessPopup(true);
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

  // Passer du popup de succès au modal de paiement
  const handleProceedToPayment = () => {
    setShowSuccessPopup(false);
    setShowPaymentModal(true);
  };

  const handleCloseModal = () => {
    setShowPaymentModal(false);
    if (typeof clearCart === "function") {
      clearCart();
    }
    router.push("/");
  };

  if (cart.length === 0 && !showPaymentModal && !showSuccessPopup) {
    return (
      <div className="cart-empty-container">
        <i className="fas fa-shopping-bag empty-icon"></i>
        <h2>Su carrito está vacío</h2>
        <p>Parece que aún no ha añadido ningún producto.</p>
        <Link href="/" className="btn-back-home">Continuar comprando</Link>
      </div>
    );
  }
  const [bankInfo, setBankInfo] = useState({ beneficiary: "Cargando...", iban: "Cargando...", bic: "Cargando..." });

useEffect(() => {
  fetch("/api/bank-details")
    .then((res) => res.json())
    .then((data) => {
      if (data.beneficiary) setBankInfo(data);
    })
    .catch(console.error);
}, []);

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

      {/* 1. POPUP DE SUCCÈS (PREMIER PLAN DIRECT) */}
      {showSuccessPopup && (
        <div className="payment-modal-overlay" style={{ zIndex: 9999 }}>
          <div className="payment-modal-card" style={{ textAlign: "center", padding: "40px 30px" }}>
            <div style={{ fontSize: "50px", color: "#2ecc71", marginBottom: "20px" }}>
              <i className="fas fa-check-circle animate-bounce"></i>
            </div>
            <h2 style={{ fontSize: "24px", color: "#2c3e50", marginBottom: "10px" }}>¡Pedido Enviado con Éxito!</h2>
            <p style={{ color: "#7f8c8d", marginBottom: "25px", fontSize: "16px" }}>
              Su pedido <strong>#{currentOrderRef}</strong> ha sido registrado en nuestro sistema correctamente.
            </p>
            <button 
              onClick={handleProceedToPayment}
              className="btn-modal-confirm"
              style={{ background: "#2ecc71", border: "none", width: "100%" }}
              type="button"
            >
              Ver instrucciones de pago <i className="fas fa-arrow-right" style={{ marginLeft: "8px" }}></i>
            </button>
          </div>
        </div>
      )}

      {/* 2. MODAL DE INSTRUCTIONS DE PAIEMENT */}
      {showPaymentModal && (
        <div className="payment-modal-overlay" style={{ zIndex: 9998 }}>
          <div className="payment-modal-card">
            <div className="payment-modal-header">
              <i className="fas fa-university payment-header-icon"></i>
              <h2>Instrucciones de Pago</h2>
              <p>Siga los pasos a continuación para realizar el pago de su pedido por transferencia.</p>
            </div>
            <div className="payment-modal-details">
  <strong className="payment-method-title">Pago por transferencia bancaria</strong>
  <p><strong>Beneficiario:</strong> {bankInfo.beneficiary}</p>
  <p><strong>IBAN:</strong> {bankInfo.iban}</p>
  <p><strong>SWIFT/BIC:</strong> {bankInfo.bic}</p>
  <p className="payment-reference-row"><strong>Referencia:</strong> Pedido #{currentOrderRef}</p>
</div>
            <div className="payment-modal-notice">
              <i className="fas fa-info-circle"></i> 
              Después de realizar el pago, debe enviar el recibo por correo electrónico a <strong>support@deal-espana.com</strong>.
            </div>
            <button onClick={handleCloseModal} className="btn-modal-confirm" type="button">Entendido y Confirmar</button>
          </div>
        </div>
      )}
    </div>
  );
}