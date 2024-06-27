// var IP="http://localhost:8000/api";
var IP = "https://backend.raghavendiran.cloud/api";

function clearErrors() {
  document.getElementById("nameError").innerText = "";
  document.getElementById("passwordError").innerText = "";
  document.getElementById("emailError").innerText = "";
  document.getElementById("addressError").innerText = "";
  document.getElementById("phoneError").innerText = "";
  document.getElementById("roleError").innerText = "";
}

function validateField(fieldId, errorId, errorMessage, condition) {
  if (condition) {
    document.getElementById(errorId).innerText = errorMessage;
    document.getElementById(fieldId).style.borderColor = "red";
    return false;
  }
  return true;
}

async function validateForm(event) {
  event.preventDefault();

  clearErrors();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const fullname = document.getElementById("fullname").value.trim();
  const email = document.getElementById("email").value.trim();
  const address = document.getElementById("address").value.trim();
  const phonenumber = document.getElementById("phonenumber").value.trim();
  const role = document.getElementById("role").value.trim();

  let isValid = true;

  isValid =
    validateField(
      "fullname",
      "fullnameError",
      "Fullname is required.",
      fullname === ""
    ) && isValid;
  let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  isValid =
    validateField("email", "emailError", "Email is required.", email === "") &&
    isValid;
  isValid =
    validateField(
      "email",
      "emailError",
      "Enter a valid email.",
      !emailRegex.test(email)
    ) && isValid;
  isValid =
    validateField(
      "address",
      "addressError",
      "Address is required.",
      address === ""
    ) && isValid;
  let phoneRegex = /^[0-9]{10}$/;
  isValid =
    validateField(
      "phonenumber",
      "phoneError",
      "Phone number is required",
      phonenumber === ""
    ) && isValid;
  isValid =
    validateField(
      "phonenumber",
      "phoneError",
      "Enter a valid 10-digit phone number",
      !phoneRegex.test(phonenumber)
    ) && isValid;
  isValid =
    validateField(
      "username",
      "nameError",
      "Username is required.",
      username === ""
    ) && isValid;
  isValid =
    validateField(
      "username",
      "nameError",
      "Username must be at least 5 characters long.",
      username.length < 5
    ) && isValid;
  isValid =
    validateField(
      "password",
      "passwordError",
      "Password is required.",
      password === ""
    ) && isValid;
  isValid =
    validateField(
      "password",
      "passwordError",
      "Password must be at least 8 characters long.",
      password.length < 8
    ) && isValid;
  isValid =
    validateField("role", "roleError", "Role is required.", role === "") &&
    isValid;
  isValid =
    validateField(
      "role",
      "roleError",
      "Invalid Role : User / Admin",
      role !== "Admin" && role !== "User"
    ) && isValid;

  if (isValid) {
    try {
      const response = await fetch(`${IP}/UserLoginRegister/Register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullname,
          username,
          password,
          email,
          address,
          phonenumber,
          role,
        }),
      });

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
