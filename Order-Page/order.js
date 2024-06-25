var IP = "http://localhost:8000/api";
document.addEventListener("DOMContentLoaded", () => {
  const ordersContainer = document.getElementById("orders-container");
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("No token found in localStorage");
    return;
  }
  fetch(`${IP}/Order/GetUserOrders?userId=1`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      ordersContainer.innerHTML = "";
      data["$values"].forEach((order) => {
        const orderCard = document.createElement("div");
        orderCard.className = "col-md-6 order-card";
        orderCard.innerHTML = `
          <div class="card">
            <div id="card-body" class="card-body">
              <h5 class="card-title">Order #${order.orderID} </h5>
              <p class="card-text"><b>Date: </b> ${order.orderDate}</p>
              <p class="card-text"><b>Shipping Address: </b> $${order.shippingAddress}</p>

              <p class="card-text"><b>Total: </b> $${order.totalAmount}</p>
              <p class="text-end"><b>Status: </b> ${order.status}</p>
              <button class="btn btn-primary" id="cancel-${order.orderID}">Cancel Order</button>
            </div>
          </div>
        `;
        ordersContainer.appendChild(orderCard);

        document
          .getElementById(`cancel-${order.orderID}`)
          .addEventListener("click", function () {
            fetch(`${IP}/Order?orderId=${order.orderID}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            })
              .then((response) => {
                if (response.ok) {
                  return response.json();
                }
                throw new Error("Failed to cancel order");
              })
              .then((data) => {
                console.log("Order cancelled:", data);
              })
              .catch((error) => {
                console.error("Error cancelling order:", error);
              });
          });
      });
    })
    .catch((error) => {
      console.error("Error fetching orders:", error);
      ordersContainer.innerHTML =
        '<p class="text-danger">Failed to load orders.</p>';
    });
});
