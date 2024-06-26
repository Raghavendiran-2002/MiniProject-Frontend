var IP = "http://localhost:8000/api";

document.addEventListener("DOMContentLoaded", () => {
  const ordersContainer = document.getElementById("orders-container");
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("No token found in localStorage");
    return;
  }
  fetchOrders(token, ordersContainer);
});

function fetchOrders(token, ordersContainer) {
  fetch(`${IP}/Order/GetUserOrders?userId=1`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => renderOrders(data, ordersContainer, token))
    .catch((error) => {
      console.error("Error fetching orders:", error);
      ordersContainer.innerHTML =
        '<p class="text-danger">Failed to load orders.</p>';
    });
}

function renderOrders(data, ordersContainer, token) {
  ordersContainer.innerHTML = "";
  data["$values"].forEach((order) => {
    renderOrder(order, ordersContainer, token);
  });
}

function renderOrder(order, ordersContainer, token) {
  if (order.status != "pending") {
    var cancelButtonDisabled = order.status == "Paid" ? "" : "disabled";
    var payButtonDisabled = order.status == "Cancelled" ? "" : "disabled";
  }
  let orderItemsHtml = "";
  order.orderItems["$values"].forEach((item) => {
    orderItemsHtml += `
      <div class="card mx-3 my-3 px-1 py-1 text-center" id="order-${order.orderID}-product-${item.productID}">
          <p class="card-text">
              <b>Product ID:</b> ${item.productID}
              <b>Quantity:</b> ${item.quantity}
              <b>Unit Price:</b> $${item.unitPrice} 
          </p>
      </div>`;
  });

  const orderCard = document.createElement("div");
  orderCard.className = "col-md-6 order-card";
  orderCard.innerHTML = `
    <div class="card">
      <div id="card-body" class="card-body">
        <h5 class="card-title">Order #${order.orderID} </h5>
        <p class="card-text"><b>Date: </b> ${order.orderDate}</p>
        <p class="card-text"><b>Shipping Address: </b> $${order.shippingAddress}</p>
        <p class="card-text"><b>Total: </b> $${order.totalAmount}</p>
        ${orderItemsHtml}
        <p class="text-end" id="status-${order.orderID}"><b>Status: </b> ${order.status}</p>
        <button class="btn btn-danger ${cancelButtonDisabled}" id="cancel-${order.orderID}">Cancel Order</button>
        <button class="btn btn-success ${payButtonDisabled}" id="pay-${order.orderID}">Pay Order</button>
      </div>
    </div>`;

  ordersContainer.appendChild(orderCard);
  setupOrderItemEventListeners(order);
  setupPaymentAndCancellation(order, token);
}

function setupOrderItemEventListeners(order) {
  order.orderItems["$values"].forEach((item) => {
    document
      .getElementById(`order-${order.orderID}-product-${item.productID}`)
      .addEventListener("click", () => reviewProduct(item));
  });
}

function reviewProduct(item) {
  var reviewModal = new bootstrap.Modal(
    document.getElementById("reviewModal"),
    { keyboard: false }
  );
  reviewModal.show();
  document.getElementById("reviewForm").onsubmit = (e) =>
    submitReview(e, item, reviewModal);
}

function submitReview(e, item, reviewModal) {
  e.preventDefault();
  var reviewText = document.getElementById("reviewText").value;
  var rating = document.getElementById("rating").value;

  if (rating < 0 || rating > 5 || !reviewText.trim()) {
    alert("Please enter a valid review and rating between 0 and 5.");
    return;
  }

  fetch(`${IP}/Review?userId=${localStorage.getItem("username")}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({
      productID: parseInt(item.productID),
      comment: reviewText,
      rating: parseInt(rating),
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      reviewModal.hide();
      var successModal = new bootstrap.Modal(
        document.getElementById("reviewSuccessModal"),
        {
          keyboard: false,
        }
      );
      successModal.show();
    })
    .catch((error) => {
      console.error("Error submitting review:", error);
    });
}

function setupPaymentAndCancellation(order, token) {
  document
    .getElementById(`pay-${order.orderID}`)
    .addEventListener("click", () => showPaymentModal(order));

  document
    .getElementById("pay-now")
    .addEventListener("click", () => placeOrder(order));

  document
    .getElementById(`cancel-${order.orderID}`)
    .addEventListener("click", () => cancelOrder(order, token));
}

function showPaymentModal(order) {
  var myModal = new bootstrap.Modal(document.getElementById("payment"), {
    keyboard: false,
  });
  myModal.show();
}

function placeOrder(order) {
  var form = document.getElementById("payment-form");
  var amountInput = document.getElementById("amount");
  var paymentMethodInput = document.getElementById("payment-method");
  var isValid = true;

  amountInput.classList.remove("is-invalid");
  paymentMethodInput.classList.remove("is-invalid");

  if (!amountInput.value.trim()) {
    amountInput.classList.add("is-invalid");
    isValid = false;
  }

  if (!paymentMethodInput.value.trim()) {
    paymentMethodInput.classList.add("is-invalid");
    isValid = false;
  }

  if (isValid) {
    var paymentModal = new bootstrap.Modal(document.getElementById("payment"));
    paymentModal.hide();
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found in localStorage");
      return;
    }
    fetch(`${IP}/Payment?userId=${localStorage.getItem("username")}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderID: parseInt(order.orderID),
        amount: document.getElementById("amount").value,
        paymentMethod: document.getElementById("payment-method").value,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data["paymentID"] === undefined) {
          document.querySelector(
            "#SuccessfullyPayment .modal-body"
          ).innerText = `Payment is unsuccessfully\n${data["message"]}`;
        } else {
          document.querySelector("#SuccessfullyPayment .modal-body").innerText =
            "Payment is successfully\nYour Payment Id : " + data["paymentID"];
        }
        paymentModal.hide();
        var myModal = new bootstrap.Modal(
          document.getElementById("SuccessfullyPayment"),
          {
            keyboard: false,
          }
        );
        myModal.show();
      })
      .catch((error) => {
        document.querySelector("#SuccessfullyPayment .modal-body").innerText =
          "Payment is unsuccessfully\n  " + data.message;
        var myModal = new bootstrap.Modal(
          document.getElementById("SuccessfullyPayment"),
          {
            keyboard: false,
          }
        );
        myModal.show();
      });
    paymentModal.hide();
  }
}

function cancelOrder(order, token) {
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
      document.getElementById(`status-${order.orderID}`).innerText =
        "Status: " + data["status"];
    })
    .catch((error) => {
      console.error("Error cancelling order:", error);
    });
}
