/**********DOM For Sign UP**************/

const signupButton = document.getElementById("signup");
const nameInput = document.querySelector("#name");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#pass");

signupButton.addEventListener("click", userSignupHandler);

async function userSignupHandler(event) {
  event.preventDefault();

  const name = nameInput.value;
  const email = emailInput.value;
  const password = passwordInput.value;

  const userData = {
    name: name,
    email: email,
    password: password,
  };

  await storeUserToBackend(userData);
}

async function storeUserToBackend(userData) {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/user/signup",
      userData
    );
    console.log(response.data);
    // Handle success, e.g., redirect to a success page or update UI
  } catch (error) {
    console.log("Error:", error.response.data.message);
    // Display the error message in your UI, e.g., using an alert

    emailInput.nextElementSibling.textContent = `${error.response.data.message}`;
  }
}
