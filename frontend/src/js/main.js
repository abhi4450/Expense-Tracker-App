// const axiosInstance = axios.create({
//   baseURL: "http://localhost:3000", // Replace with your backend server address
//   headers: {
//     "Content-Type": "application/json",
//     // Add any other headers you need
//   },
// });

const signupButton = document.getElementById("signup");
const nameInput = document.querySelector("#name");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#pass");

signupButton.addEventListener("click", submitHandler);

async function submitHandler(event) {
  event.preventDefault();

  const name = nameInput.value;
  const email = emailInput.value;
  const password = passwordInput.value;

  const userData = {
    name: name,
    email: email,
    password: password,
  };

  await storeDataToBackend(userData);
}

async function storeDataToBackend(userData) {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/users/signup",
      userData
    );
    console.log(response.data);
    // Handle success, e.g., redirect to a success page or update UI
  } catch (error) {
    console.error("Error:", error.response.data.message);
    // Display the error message in your UI, e.g., using an alert
    const msgDiv = document.querySelector("#msg");
    emailInput.nextElementSibling.textContent = `${error.response.data.message},`;
  }
}
