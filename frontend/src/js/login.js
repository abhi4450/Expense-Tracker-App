/************DOM FOR Login ****************/
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#pass");
const loginButton = document.querySelector("#login");

loginButton.addEventListener("click", UserLoginHandler);

function UserLoginHandler(event) {
  const email = emailInput.value;
  const password = passwordInput.value;

  const loginUserData = {
    email: email,
    password: password,
  };

  checkForUserInBackend(loginUserData);
}

async function checkForUserInBackend(loginUserData) {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/user/login",
      loginUserData
    );
    console.log(response.data);
    // Handle success, e.g., redirect to a success page or update UI
  } catch (error) {
    console.log("Error:", error.response.data.message);
    // Display the error message in your UI, e.g., using an alert
  }
}
