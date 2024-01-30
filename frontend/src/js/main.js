const expenseInput = document.querySelector("#exp");
const descInput = document.querySelector("#desc");
const catInput = document.querySelector("#category");
const addButton = document.querySelector("#addExp");

addButton.addEventListener("click", expenseHandler);

async function expenseHandler(event) {
  event.preventDefault();

  const expense_amount = expenseInput.value;
  const description = descInput.value;
  const category = catInput.value;

  const expenseData = {
    expense_amount: expense_amount,
    description: description,
    category: category,
  };
  try {
    const result = await saveExpensesToBackend(expenseData);
    if (result.success) {
      if (result.status === 201) {
        alert(result.data.message);
      } else {
        console.warn("Unexpected status code:", result.status);
      }
    }
  } catch (error) {
    console.error("Unexpected error:", err);
  }
}

async function saveExpensesToBackend(expenseData) {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/expense/addexpense",
      expenseData
    );
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response.data.message,
      status: error.response.status,
    };
  }
}
