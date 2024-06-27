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
    const row = createCartItemRow(item);
    cartItemsContainer.appendChild(row);
    total += item.quantity * item["product"].price;
  });

  document.getElementById("total-price").textContent = `Total: $${total.toFixed(
    2
  )}`;
}

function createCartItemRow(item) {
  const row = document.createElement("tr");
  row.setAttribute("data-item-id", item.cartItemID);

  row.appendChild(createImageCell(item));
  row.appendChild(createNameCell(item));
  row.appendChild(createQuantityCell(item));
  row.appendChild(createPriceCell(item));
  row.appendChild(createTotalCell(item));
  row.appendChild(createRemoveCell(item));

  return row;
}

function createImageCell(item) {
  const imgCell = document.createElement("td");
  const img = document.createElement("img");
  img.src = item["product"].imageUrl || "https://via.placeholder.com/50";
  img.alt = "Product Image";
  imgCell.appendChild(img);
  return imgCell;
}

function createNameCell(item) {
  const nameCell = document.createElement("td");
  nameCell.textContent = item["product"].productName;
  return nameCell;
}

function createQuantityCell(item) {
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
  return qtyCell;
}

function createPriceCell(item) {
  const priceCell = document.createElement("td");
  priceCell.textContent = `$${item["product"].price.toFixed(2)}`;
  return priceCell;
}

function createTotalCell(item) {
  const totalCell = document.createElement("td");
  const itemTotal = item.quantity * item["product"].price;
  totalCell.textContent = `$${itemTotal.toFixed(2)}`;
  return totalCell;
}

function createRemoveCell(item) {
  const removeCell = document.createElement("td");
  const removeButton = document.createElement("button");
  removeButton.className = "btn btn-danger btn-sm";
  removeButton.textContent = "Remove";
  removeButton.addEventListener("click", () => removeItem(item.cartItemID));
  removeCell.appendChild(removeButton);
  return removeCell;
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
      updateTotalPriceDisplay();
    })
    .catch((error) => console.error("Error removing item:", error));
}

function updateTotalPriceDisplay() {
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
  document.getElementById("total-price").textContent = `Total: $${total.toFixed(
    2
  )}`;
}

document
  .getElementById("place-order-now")
  .addEventListener("click", function () {
    if (OrderItem.length == 0) {
      alert("Cart is Empty");
      return;
    }
    placeOrder();
  });

function placeOrder() {
  fetch(`${IP}/Order?userId=${username}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
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
      return response.json();
    })
    .then((data) => {
      removeCartItem(username);
      document.querySelector("#SuccessfullyPlaceOrder .modal-body").innerText =
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
      document.querySelector("#SuccessfullyPlaceOrder .modal-body").innerText =
        error.data.message;

      console.error("Error fetching data:", error);
    });
}

function removeCartItem(itemId) {
  fetch(`${IP}/ShoppingCart/DeleteCartByUserId?Id=${itemId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}
