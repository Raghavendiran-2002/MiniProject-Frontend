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
        if (order.status != "pending") {
          var cancelButtonDisabled = order.status == "Paid" ? "" : "disabled";
          var payButtonDisabled = order.status == "Cancelled" ? "" : "disabled";
        }
        let orderItemsHtml = "";
        order.orderItems["$values"].forEach((item) => {
          orderItemsHtml += `
          <div class="card mx-3 my-3 px-1 py-1 text-center">
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

        // Payment
        document
          .getElementById(`pay-${order.orderID}`)
          .addEventListener("click", function () {
            var myModal = new bootstrap.Modal(
              document.getElementById("payment"),
              {
                keyboard: false,
              }
            );
            myModal.show();
          });

        document
          .getElementById("pay-now")
          .addEventListener("click", function () {
            placeOrder(order);
          });

        // Cancel
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
                document.getElementById(`status-${order.orderID}`).innerText =
                  "Status: " + data["status"];
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
