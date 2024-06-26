var IP = "http://localhost:8000/api";

document.addEventListener("DOMContentLoaded", function () {
  localStorage.clear();
});

async function validateForm(event) {
  event.preventDefault();

  document.getElementById("nameError").innerText = "";
  document.getElementById("passwordError").innerText = "";

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  let isValid = true;

  if (username === "") {
    document.getElementById("nameError").innerText = "Username is required.";
    document.getElementById("username").style.borderColor = "red";

    isValid = false;
  } else if (username.length < 1) {
    document.getElementById("nameError").innerText =
      "Username must be at least 5 characters long.";
    document.getElementById("username").style.borderColor = "red";
    isValid = false;
  }

  if (password === "") {
    document.getElementById("passwordError").innerText =
      "Password is required.";
    document.getElementById("password").style.borderColor = "red";

    isValid = false;
  } else if (password.length < 3) {
    document.getElementById("passwordError").innerText =
      "Password must be at least 8 characters long.";
    document.getElementById("password").style.borderColor = "red";
    isValid = false;
  }

  if (isValid) {
    try {
      const response = await fetch(`${IP}/UserLoginRegister/Login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: username, password: password }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      const role = localStorage.setItem("role", data.role);
      localStorage.setItem("username", data.userID);

      if (data.role === "Admin") {
        window.location.href = "../Admin-Page/admin-page.html";
      } else if (data.role === "User") {
        window.location.href = "../Home-Page/home.html";
      } else {
        window.location.href = "../Landing-Page/landing.html";
      }
    } catch (error) {
      console.error("Error:", error);
      document.getElementById("incorrectUsernamePassword").innerText =
        "Incorrect username or password.";
      document.getElementById("incorrectUsernamePassword").style.color = "red";
    }
  }
}
