var IP = "http://localhost:8000/api";

document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("productId");
  if (!productId) {
    alert("Product ID is missing");
    return;
  }
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("No token found in localStorage");
    return;
  }
  fetch(`${IP}/Product/ById?Id=${productId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((product) => {
      const container = document.querySelector(".products-container");

      const card = document.createElement("div");
      card.classList.add("container", "my-4");
      card.innerHTML = `
      <div class="card">        
            <div class="row g-0">
                  <div class="col-md-4">
                    <img src="${product.imageUrl}" class="ms-5 img-fluid rounded-start" alt="No Product Image">
                  </div>
                <div class="col-md-8">
                    <div class="card-body">
                        <h5 class="card-title" id="product-title">${product.productName}</h5>
                        <p class="card-text" id="product-description">${product.description}</p>
                        <h6 class="card-subtitle mb-2 text-muted" id="product-price">₹${product.price}</h6>
                        <div class="col">
                          <button id="remove" class="btn border">-</button>
                          <button id="cartItemNumber" class="btn border">0</button>
                          <button id="add" class="btn border">+</button>
                          <button id="addCartToItem"  class="btn btn-secondary ms-4">Add to Cart</button>
                        </div>
                        <p id="quantity-insufficient" style="color: red;"> </p>
                    </div>
                </div>
            </div>
            <div class="mt-5 px-5" py-5>
              <h5>Review</h5>
                    <p id="review-container"></p>
                    <div class="text-center">
                      <p id="review-error"> </p>
                    </div> 
                </div>
            </div>
      </div> `;
      container.appendChild(card);
      GetReviews(parseInt(productId));
      const cartNumberButton = document.getElementById("cartItemNumber");
      let cartNumber = parseInt(cartNumberButton.innerText);

      document.getElementById("remove").addEventListener("click", function () {
        document.getElementById("quantity-insufficient").innerText = "";
        cartNumber = Math.max(0, cartNumber - 1);
        cartNumberButton.innerText = cartNumber;
      });

      document
        .getElementById("addCartToItem")
        .addEventListener("click", async function () {
          const response = await fetch(`${IP}/ShoppingCart`, {
            method: "POST",
            body: JSON.stringify({
              userID: parseInt(localStorage.getItem("username")),
              cartID: parseInt(localStorage.getItem("username")),
              productID: parseInt(product.productID),
              quantity: parseInt(cartNumber),
            }),
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          const data = await response.json();
          console.log(data);
        });

      document.getElementById("add").addEventListener("click", function () {
        if (cartNumber > product.stock) {
          document.getElementById("quantity-insufficient").innerText =
            "Quantity is insufficient";
        } else {
          cartNumber++;
        }
        cartNumberButton.innerText = cartNumber;
      });
    })
    .catch((error) => console.error("Error fetching products:", error));
});

function GetReviews(productId) {
  const token = localStorage.getItem("token");
  fetch(`${IP}/Review/product/${productId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((reviews) => {
      if (reviews["$values"].length == 0) {
        document.getElementById("review-error").innerHTML = "No Reviews Found";
      }

      document.getElementById("review-container").innerHTML = reviews[
        "$values"
      ].map(
        (review) => `
      <div class="ps-4 pt-4 card col-12">
        <p class="row-2"><b>UserId :</b> ${review.userID}</p>
        <p class="row-2"><b>Rating :</b> ⭐️ ${review.rating}</p>
        <p class="row-2"><b>Comment :</b> ${review.comment}</p>
      </div>`
      );
    });
}
