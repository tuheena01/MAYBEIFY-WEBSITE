export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const initializePayment = async ({ 
  amount, 
  name, 
  email, 
  description = 'Payment for Maybeify',
  onSuccess,
  onError
}) => {
  const res = await loadRazorpayScript();

  if (!res) {
    alert('Razorpay SDK failed to load. Check your internet connection.');
    return;
  }

  // 1. Create order on server
  const orderRes = await fetch('/api/razorpay/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount }),
  });

  const orderData = await orderRes.json();

  if (orderData.error) {
    alert(orderData.error);
    return;
  }

  // 2. Open Razorpay Checkout
  const options = {
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Use public key for frontend
    amount: orderData.amount,
    currency: orderData.currency,
    name: "Maybeify",
    description: description,
    image: "/logo.png", // Replace with your logo
    order_id: orderData.id,
    handler: async function (response) {
      // 3. Verify payment on server
      const verifyRes = await fetch('/api/razorpay/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        }),
      });

      const verifyData = await verifyRes.json();

      if (verifyData.success) {
        if (onSuccess) onSuccess(response);
      } else {
        if (onError) onError(verifyData.message);
      }
    },
    prefill: {
      name: name,
      email: email,
    },
    theme: {
      color: "#d4af37", // Gold theme for Maybeify
    },
  };

  const paymentObject = new window.Razorpay(options);
  paymentObject.open();
};
