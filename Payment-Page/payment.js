// Define the backend API endpoint
var IP = "https://backend.raghavendiran.cloud/api";

// Event listener for DOM content loaded
document.addEventListener("DOMContentLoaded", () => {
  const paymentsContainer = document.getElementById("payments-container");
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("No token found in localStorage");
    return;
  }
  fetchPayments(paymentsContainer, token);
});

// Function to fetch payments from the backend
function fetchPayments(paymentsContainer, token) {
  const userId = localStorage.getItem("username");
  const url = `${IP}/Payment/PaymentByUser?userId=${userId}`;
  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  fetch(url, options)
    .then((response) => response.json())
    .then((data) => {
      paymentsContainer.innerHTML = "";
      data["$values"].forEach((payment) => {
        const paymentCard = createPaymentCard(payment);
        paymentsContainer.appendChild(paymentCard);
      });
    })
    .catch((error) => {
      console.error("Error fetching payments:", error);
      paymentsContainer.innerHTML =
        '<p class="text-danger">No payments available.</p>';
    });
}

// Function to create a payment card element
function createPaymentCard(payment) {
  const paymentCard = document.createElement("div");
  paymentCard.className = "col-md-6 my-3 payment-card";
  paymentCard.innerHTML = `
    <div class="card">
      <div id="card-body" class="card-body">
        <h5 class="card-title">Payment #${payment.paymentID}</h5>
        <p class="card-text"><b>Order ID: </b> ${payment.orderID}</p>
        <p class="card-text"><b>Date: </b> ${payment.paymentDate}</p>
        <p class="card-text"><b>Amount: </b> $${payment.amount}</p>
        <p class="card-text"><b>Method: </b> ${payment.paymentMethod}</p>
        <p class="text-end"><b>Status: </b> ${payment.status}</p>
      </div>
    </div>
  `;
  return paymentCard;
}
