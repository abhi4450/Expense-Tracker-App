const commonHeaders = {
  Authorization: localStorage.getItem("token"),
  // Add any other common headers here
};

const expenseInput = document.querySelector("#exp");
const descInput = document.querySelector("#desc");
const catInput = document.querySelector("#category");
const addButton = document.querySelector("#addExp");
const listItem = document.querySelector("#itemList");

window.addEventListener("DOMContentLoaded", async () => {
  try {
    result = await fetchExpenses();
    if (result.success) {
      if (result.status === 200) {
        console.log(result.data.expenses);
        displayExpenses(result.data.expenses);
      }
    }
  } catch (error) {
    console.error("Unexpected error:", error);
  }
});

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
        const resp = await fetchExpenses();
        await displayExpenses(resp.data.expenses);
      } else {
        console.warn("Unexpected status code:", result.status);
      }
    }
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

async function saveExpensesToBackend(expenseData) {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/expense/addexpense",
      expenseData,
      { headers: commonHeaders }
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

async function fetchExpenses() {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      "http://localhost:3000/api/expense/getExpenses",

      {
        headers: commonHeaders,
      }
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

async function displayExpenses(expenses) {
  if (expenses.length > 0) {
    listItem.innerHTML = "";

    expenses.forEach((expense) => {
      const newli = document.createElement("li");
      newli.classList.add(
        "list-group-item",
        "list-group-item-light",
        "text-center"
      );

      const spanElement = document.createElement("span");
      spanElement.classList.add("float-start");
      spanElement.innerHTML = `&#9997;`;
      newli.append(spanElement);

      newli.append(
        `${expense.expense_amount}-${expense.description}-${expense.category}`
      );

      const deleteButton = document.createElement("button");
      deleteButton.classList.add(
        "btn",
        "btn-outline-danger",
        "btn-sm",
        "ms-2",
        "float-end",
        "delete"
      );
      deleteButton.innerText = "Delete";

      newli.appendChild(deleteButton);
      listItem.append(newli);

      deleteButton.addEventListener("click", async () => {
        try {
          const result = await deleteExpense(expense.id);
          if (result.success) {
            deleteButton.parentElement.remove();
            console.log(result.message);
          }
        } catch {
          console.log(error);
        }
      });
    });
  } else {
    const headingElement = document.createElement("p");
    headingElement.textContent = "No Expenses To Show.";
    headingElement.classList.add("text-center", "my-3", "h5");
    listItem.append(headingElement);
  }
}

async function deleteExpense(expenseId) {
  try {
    const response = await axios.delete(
      `http://localhost:3000/api/expense/deleteExpense/${expenseId}`,
      {
        headers: commonHeaders,
      }
    );
    return { success: true, message: "Item deleted successfully" };
  } catch (error) {
    return {
      success: false,
      error: error.response.data.message,
      status: error.response.status,
    };
  }
}
