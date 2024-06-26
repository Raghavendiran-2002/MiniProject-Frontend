// var IP="http://localhost:8000/api";
var IP = "https://backend.raghavendiran.cloud/api";


async function validateForm(event) {
  event.preventDefault();

  document.getElementById("nameError").innerText = "";
  document.getElementById("passwordError").innerText = "";
  document.getElementById("emailError").innerText = "";
  document.getElementById("addressError").innerText = "";
  document.getElementById("phoneError").innerText = "";
  document.getElementById("roleError").innerText = "";
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const fullname = document.getElementById("fullname").value.trim();
  const email = document.getElementById("email").value.trim();
  const address = document.getElementById("address").value.trim();
  const phonenumber = document.getElementById("phonenumber").value.trim();
  const role = document.getElementById("role").value.trim();

  let isValid = true;

  if (fullname === "") {
    document.getElementById("fullnameError").innerText =
      "Fullname is required.";
    document.getElementById("fullname").style.borderColor = "red";
    isValid = false;
  }
  let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email === "") {
    document.getElementById("emailError").innerText = "Email is required.";
    document.getElementById("email").style.borderColor = "red";
    isValid = false;
  } else if (!emailRegex.test(email)) {
    document.getElementById("emailError").innerText = "Enter a valid email.";
    document.getElementById("email").style.borderColor = "red";
    isValid = false;
  }
  if (address === "") {
    document.getElementById("addressError").innerText = "Address is required.";
    document.getElementById("address").style.borderColor = "red";
    isValid = false;
  }
  let phoneRegex = /^[0-9]{10}$/;
  if (phonenumber === "") {
    document.getElementById("phoneError").innerText =
      "Phone number is required";
    document.getElementById("phonenumber").style.borderColor = "red";
  } else if (phoneRegex.test(phonenumber)) {
    document.getElementById("phoneError") = "Enter a valid 10-digit phone number";
    document.getElementById("phonenumber").style.borderColor = "red";
  }

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
  if(role === ""){
    document.getElementById("roleError").innerText = "Role is required.";
    document.getElementById("role").style.borderColor = "red";
    isValid = false;
  }
  else if(role != "Admin" && role != "User"){
    document.getElementById("roleError").innerText = "Invalid Role : User / Admin";
    document.getElementById("role").style.borderColor = "red";
    isValid = false;
  }

  if (isValid) {
    try {
      const response = await fetch(
        `${IP}/UserLoginRegister/Register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fullname,username, password, email, address, phonenumber, role }),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      await response.json();
      

      alert("Registered successful!");
    } catch (error) {
      console.error("Error:", error);
      document.getElementById("incorrectUsernamePassword").innerText =
        "Incorrect username or password.";
      document.getElementById("incorrectUsernamePassword").style.color = "red";
    }
  }
}
