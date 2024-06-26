// var IP = "http://localhost:8000/api";
var IP = "https://backend.raghavendiran.cloud/api";

const username = localStorage.getItem("username");
const token = localStorage.getItem("token");

let OrderItem = [];

document.addEventListener("DOMContentLoaded", () => {
  fetchCartItems(username);
});

function fetchCartItems(username) {
  fetch(`${IP}/ShoppingCart/GetCartByUserId?Id=${username}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      populateCart(data["shoppingCartItems"]["$values"]);
    })
    .catch((error) => console.error("Error fetching cart data:", error));
}

function populateCart(data) {
  const cartItemsContainer = document.getElementById("cart-items");
  cartItemsContainer.innerHTML = "";

  let total = 0;

  data.forEach((item) => {
    OrderItem.push({
      productID: item["product"].productID,
      quantity: item.quantity,
    });
    const row = document.createElement("tr");
    row.setAttribute("data-item-id", item.cartItemID);

    const imgCell = document.createElement("td");
    const img = document.createElement("img");
    img.src = item["product"].imageUrl || "https://via.placeholder.com/50";
    img.alt = "Product Image";
    imgCell.appendChild(img);

    const nameCell = document.createElement("td");
    nameCell.textContent = item["product"].productName;

    const qtyCell = document.createElement("td");
    const qtyInput = document.createElement("input");
    qtyInput.type = "number";
    qtyInput.className = "form-control";
    qtyInput.value = item.quantity;
    qtyInput.min = "1";
    qtyInput.addEventListener("change", () =>
      updateTotalPrice(
        parseInt(item["product"].productID),
        parseInt(qtyInput.value),
        parseInt(item["cartItemID"]),
        qtyInput
      )
    );
    qtyCell.appendChild(qtyInput);

    const priceCell = document.createElement("td");
    priceCell.textContent = `$${item["product"].price.toFixed(2)}`;

    const totalCell = document.createElement("td");
    const itemTotal = item.quantity * item["product"].price;
    total += itemTotal;
    totalCell.textContent = `$${itemTotal.toFixed(2)}`;

    const removeCell = document.createElement("td");
    const removeButton = document.createElement("button");
    removeButton.className = "btn btn-danger btn-sm";
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", () => removeItem(item.cartItemID));
    removeCell.appendChild(removeButton);

    row.appendChild(imgCell);
    row.appendChild(nameCell);
    row.appendChild(qtyCell);
    row.appendChild(priceCell);
    row.appendChild(totalCell);
    row.appendChild(removeCell);

    cartItemsContainer.appendChild(row);
  });

  document.getElementById("total-price").textContent = `Total: $${total.toFixed(
    2
  )}`;
}

function updateTotalPrice(itemId, newQuantity, cartItemId, inputField) {
  const token = localStorage.getItem("token");
  fetch(`${IP}/ShoppingCart`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      cartItemID: cartItemId,
      cartID: parseInt(localStorage.getItem("username")),
      userID: parseInt(localStorage.getItem("username")),
      productID: parseInt(itemId),
      quantity: newQuantity,
    }),
  }).then((response) => {
    console.log(
      JSON.stringify({
        cartItemID: cartItemId,
        cartID: parseInt(localStorage.getItem("username")),
        userID: parseInt(localStorage.getItem("username")),
        productID: parseInt(itemId),
        quantity: newQuantity,
      })
    );
    if (!response.ok) {
      inputField.style.borderColor = "red";
      throw new Error("Network response was not ok");
    }
    inputField.style.borderColor = "green";
    return response.json();
  });
}

function removeItem(itemId) {
  fetch(`${IP}/ShoppingCart?cartId=${itemId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      const row = document.querySelector(`tr[data-item-id="${itemId}"]`);
      if (row) {
        row.remove();
      }

      let total = 0;
      document.querySelectorAll("#cart-items tr").forEach((row) => {
        const priceCell = row.children[3];
        const totalCell = row.children[4];
        const price = parseFloat(priceCell.textContent.replace("$", ""));
        const quantity = parseInt(row.querySelector("input").value);
        const itemTotal = price * quantity;
        total += itemTotal;
        totalCell.textContent = `$${itemTotal.toFixed(2)}`;
      });
      document.getElementById(
        "total-price"
      ).textContent = `Total: $${total.toFixed(2)}`;
    })
    .catch((error) => console.error("Error removing item:", error));
}

document
  .getElementById("place-order-now")
  .addEventListener("click", function () {
    if (OrderItem.length == 0) {
      alert("Cart is Empty");
      return;
    }
    fetch(`${IP}/Order?userId=${username}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbXBJZCI6IjEiLCJyb2xlIjoiQWRtaW4iLCJleHAiOjE3MTkzNzkzNDJ9.eCcwD3pdqz_WfQ6NGKLCM_DlitK3Y3Okv2FI3AywycY`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        shippingAddress: document.getElementById("shippingAddress").value,
        orderItems: OrderItem,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          document.querySelector(
            "#SuccessfullyPlaceOrder .modal-body"
          ).innerText = response.data.message;
        }
      })
      .then((data) => {
        removeCartItem(username);
        document.querySelector(
          "#SuccessfullyPlaceOrder .modal-body"
        ).innerText =
          "your Order ID : " + data["orderID"] + " is Placed successfully";

        var checkoutModal = new bootstrap.Modal(
          document.getElementById("checkout"),
          {
            keyboard: false,
          }
        );
        checkoutModal.show();
      })
      .catch((error) => {
        document.querySelector(
          "#SuccessfullyPlaceOrder .modal-body"
        ).innerText = error.data.message;

        console.error("Error fetching data:", error);
      });
  });

function removeCartItem(itemId) {
  fetch(`${IP}/ShoppingCart/DeleteCartByUserId?Id=${itemId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}
