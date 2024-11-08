// import React, { useState } from 'react';

// function CancelSubscription() {
//   const [subscriptionId, setSubscriptionId] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleCancelSubscription = async () => {
//     setLoading(true);

//     try {
//       const response = await fetch('http://localhost:5001/stripe/cancel-subscription', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           subscriptionId: subscriptionId,  // Subscription ID to be canceled
//         }),
//       });

//       const result = await response.json();

//       if (result.success) {
//         alert(`Subscription ${subscriptionId} canceled successfully!`);
//       } else {
//         alert(`Failed to cancel subscription: ${result.message}`);
//       }
//     } catch (error) {
//       alert(`Error: ${error.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div>
//       <input
//         type="text"
//         value={subscriptionId}
//         onChange={(e) => setSubscriptionId(e.target.value)}
//         placeholder="Enter subscription ID"
//         required
//       />
//       <button onClick={handleCancelSubscription} disabled={loading}>
//         {loading ? 'Processing...' : 'Cancel Subscription'}
//       </button>
//     </div>
//   );
// }

// export default CancelSubscription;
