// Password Masking
function togglePassword() {
    var passwordInput = document.getElementById("pass");
    var eyeIcon = document.getElementById("eyeIcon");

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        eyeIcon.src = "Images/eye-slash.png";
    } else {
        passwordInput.type = "password";
        eyeIcon.src = "Images/eye.png";
    }
}

// Create a CAPTCHA
function generateCaptcha() {
    var captcha = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 6; i++) {
        captcha += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    document.getElementById("captchaDisplay").innerText = captcha;
    document.getElementById("captcha").value = ""; // Clear the input field
}

// Password Validation Function
function isValidPassword(password) {
    var minLength = 8;
    var specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/; // At least one special character
    var numberRegex = /[0-9]/; // At least one number

    if (password.length < minLength) {
        return "Password must be at least 8 characters long.";
    }
    if (!specialCharRegex.test(password)) {
        return "Password must contain at least one special character.";
    }
    if (!numberRegex.test(password)) {
        return "Password must contain at least one number.";
    }
    return ""; // Valid password
}

// Check login credentials
function checkLogin() {
    var user = document.getElementById("user").value;
    var pass = document.getElementById("pass").value;
    var userCaptcha = document.getElementById("captcha").value;
    var displayedCaptcha = document.getElementById("captchaDisplay").innerText;
    var loginMessage = document.getElementById("loginMessage");

    // Validate password
    var passwordError = isValidPassword(pass);
    if (passwordError) {
        loginMessage.style.display = "block";
        loginMessage.innerText = passwordError;
        return;
    }

    // Check CAPTCHA
    if (userCaptcha !== displayedCaptcha) {
        document.getElementById("loginMessage").style.display = "block";
        document.getElementById("loginMessage").innerText = "Invalid CAPTCHA. Please try again.";
        return;
    }

    // Check username and password
    if (user === "admin" && pass === "admin@123") {
        window.location.href = "home.html"; // Go to home page
    } else {
        document.getElementById("loginMessage").style.display = "block";
        document.getElementById("loginMessage").innerText = "Invalid username or password. Please try again.";
    }
}

// Array to store income entries
let totalIncome = 0;

// Function to add an income entry
function addIncome() {
    let month = document.getElementById("incomeMonth").value;
    let source = document.getElementById("incomeSource").value;
    let amount = parseFloat(document.getElementById("incomeAmount").value);

    // Validate the input
    if (!month || !source || amount <= 0 || isNaN(amount)) {
        alert("Please enter valid details for the income.");
        return;
    }

    // Update total income
    totalIncome += amount;

    // Update income display
    document.getElementById("currentIncome").innerText = totalIncome.toFixed(2);

    // Add income to the income list (optional)
    let incomeList = document.getElementById("incomeList");
    let listItem = document.createElement("li");
    listItem.classList.add("list-group-item");
    listItem.textContent = `${month} - ${source}: $${amount.toFixed(2)}`;
    incomeList.appendChild(listItem);

    // Clear input fields
    document.getElementById("incomeSource").value = "";
    document.getElementById("incomeAmount").value = "";
}

/************ Finance Tracker Functionality *************/
let transactions = [];
let charts = {
    expense: null,
    investment: null,
    savings: null,
};

// Transaction Management
function addIncome() {
    const month = document.getElementById("incomeMonth").value;
    const source = document.getElementById("incomeSource").value.trim();
    const amount = parseFloat(document.getElementById("incomeAmount").value);

    if (!validateTransaction(month, source, amount, "income")) return;

    transactions.push({
        type: "Income",
        month,
        category: source,
        amount,
    });

    updateBudget();
    updateTransactionList(
        "incomeList",
        transactions.filter((t) => t.type === "Income")
    );
    clearFormFields(["incomeSource", "incomeAmount"]);
}

function addExpense() {
    const month = document.getElementById("expenseMonth").value;
    const type = document.getElementById("expenseType").value;
    const category = document.getElementById("expenseCategory").value.trim();
    const amount = parseFloat(document.getElementById("expenseAmount").value);

    if (!validateTransaction(month, category, amount, "expense")) return;

    transactions.push({
        type,
        month,
        category,
        amount,
    });

    updateBudget();
    updateTransactionTable();
    clearFormFields(["expenseCategory", "expenseAmount"]);
}

function validateTransaction(date, category, amount, type) {
    if (!date || !category || amount <= 0 || isNaN(amount)) {
        alert(`Please enter valid ${type} details`);
        return false;
    }
    return true;
}

function clearFormFields(fields) {
    fields.forEach((field) => (document.getElementById(field).value = ""));
}

// Data Display Updates
function updateBudget() {
    const income = getTotal("Income");
    const expenses = getTotal("Expense");
    const investments = getTotal("Investment");
    const savings = getTotal("Savings");
    const remaining = income - (expenses + investments + savings);

    updateDisplayValues(income, expenses, investments, savings, remaining);
    updateProgressBars(income, expenses, investments, savings, remaining);
    updateCharts();
}

function getTotal(type) {
    return transactions.filter((t) => t.type === type).reduce((sum, t) => sum + t.amount, 0);
}

function updateDisplayValues(income, expenses, investments, savings, remaining) {
    document.getElementById("currentIncome").textContent = income.toFixed(2);
    document.getElementById("remainingBudget").textContent = remaining.toFixed(2);
    document.getElementById("totalIncome").textContent = `$${income.toFixed(2)}`;
    document.getElementById("totalExpenses").textContent = `$${expenses.toFixed(2)}`;
    document.getElementById("totalSavings").textContent = `$${savings.toFixed(2)}`;
    document.getElementById("remainingSummary").textContent = `$${remaining.toFixed(2)}`;
}

function updateProgressBars(income, expenses, investments, savings, remaining) {
    const total = Math.max(income, expenses + investments + savings);
    setProgress("incomeProgress", income, total);
    setProgress("expenseProgress", expenses, total);
    setProgress("remainingProgress", remaining, total);
    setProgress("savingsProgress", savings, total);
}

function setProgress(elementId, value, max) {
    const progress = (value / max) * 100 || 0;
    document.getElementById(elementId).style.width = `${progress}%`;
}

// Chart Management
function updateCharts() {
    updateExpenseChart();
    updateInvestmentChart();
    updateSavingsChart();
}

/************ Chart Configuration *************/
function createFinanceChartConfig(chartType, labels, data, colors, totalIncome, chartTotal) {
    return {
        type: chartType,
        data: {
            labels: labels,
            datasets: [
                {
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 1,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {position: "bottom"},
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const value = context.parsed;
                            const chartPercentage = chartTotal > 0 ? ((value / chartTotal) * 100).toFixed(1) + "%" : "0%";
                            const incomePercentage = totalIncome > 0 ? ((value / totalIncome) * 100).toFixed(1) + "%" : "0%";

                            return [`Category: ${context.label}`, `Amount: $${value.toFixed(2)}`, `Income Percentage: ${incomePercentage}`, `Chart Percentage: ${chartPercentage}`];
                        },
                    },
                },
            },
        },
    };
}

/************ Updated Chart Functions *************/
function updateExpenseChart() {
    const totalIncome = getTotal("Income");
    const expenses = transactions.filter((t) => t.type === "Expense");
    const categories = [...new Set(expenses.map((t) => t.category))];
    const data = categories.map((cat) => expenses.filter((t) => t.category === cat).reduce((sum, t) => sum + t.amount, 0));
    const chartTotal = data.reduce((a, b) => a + b, 0);

    toggleChartMessage("expenseChartMessage", data.length);

    if (charts.expense) charts.expense.destroy();

    const ctx = document.getElementById("expenseChart").getContext("2d");
    charts.expense = new Chart(ctx, createFinanceChartConfig("doughnut", categories, data, ["#780116", "#f7b538", "#db7c26", "#d8572a", "#c32f27"], totalIncome, chartTotal));
}

function updateInvestmentChart() {
    const totalIncome = getTotal("Income");
    const investments = transactions.filter((t) => t.type === "Investment");
    const categories = [...new Set(investments.map((t) => t.category))];
    const data = categories.map((cat) => investments.filter((t) => t.category === cat).reduce((sum, t) => sum + t.amount, 0));
    const chartTotal = data.reduce((a, b) => a + b, 0);

    toggleChartMessage("investmentChartMessage", data.length);

    if (charts.investment) charts.investment.destroy();

    const ctx = document.getElementById("investmentChart").getContext("2d");
    charts.investment = new Chart(ctx, createFinanceChartConfig("pie", categories, data, ["#03045e", "#0077b6", "#00b4d8", "#90e0ef", "#caf0f8"], totalIncome, chartTotal));
}

function updateSavingsChart() {
    const totalIncome = getTotal("Income");
    const savings = transactions.filter((t) => t.type === "Savings");
    const categories = [...new Set(savings.map((t) => t.category))];
    const data = categories.map((cat) => savings.filter((t) => t.category === cat).reduce((sum, t) => sum + t.amount, 0));
    const chartTotal = data.reduce((a, b) => a + b, 0);

    toggleChartMessage("savingsChartMessage", data.length);

    if (charts.savings) charts.savings.destroy();

    const ctx = document.getElementById("savingsChart").getContext("2d");
    charts.savings = new Chart(ctx, createFinanceChartConfig("doughnut", categories, data, ["#00798c", "#30638e", "#003d5b", "#d1495b", "#efcfe3"], totalIncome, chartTotal));
}

/************ Modified Helper Functions *************/
function getTotal(type) {
    return transactions.filter((t) => t.type === type).reduce((sum, t) => sum + t.amount, 0);
}

function updateBudget() {
    const income = getTotal("Income");
    const expenses = getTotal("Expense");
    const investments = getTotal("Investment");
    const savings = getTotal("Savings");
    const remaining = income - (expenses + investments + savings);

    // Update displays
    document.getElementById("currentIncome").textContent = income.toFixed(2);
    document.getElementById("remainingBudget").textContent = remaining.toFixed(2);
    document.getElementById("totalIncome").textContent = `$${income.toFixed(2)}`;
    document.getElementById("totalExpenses").textContent = `$${expenses.toFixed(2)}`;
    document.getElementById("totalSavings").textContent = `$${savings.toFixed(2)}`;
    document.getElementById("remainingSummary").textContent = `$${remaining.toFixed(2)}`;

    // Update progress bars
    const total = Math.max(income, expenses + investments + savings);
    setProgress("incomeProgress", income, total);
    setProgress("expenseProgress", expenses, total);
    setProgress("remainingProgress", remaining, total);
    setProgress("savingsProgress", savings, total);

    // Update charts with fresh totalIncome value
    updateCharts();
}

function toggleChartMessage(messageId, hasData) {
    document.getElementById(messageId).style.display = hasData ? "none" : "block";
}

// Transaction Lists
function updateTransactionList(listId, transactions) {
    const list = document.getElementById(listId);
    list.innerHTML = transactions.map((t) => `<li class="list-group-item">${t.month} - ${t.category}: $${t.amount.toFixed(2)}</li>`).join("");
}

function updateTransactionTable() {
    const tableBody = document.getElementById("expenseTableBody");
    tableBody.innerHTML = transactions
        .map(
            (t) => `
            <tr>
                <td>${t.month}</td>
                <td>${t.type}</td>
                <td>${t.category}</td>
                <td>$${t.amount.toFixed(2)}</td>
            </tr>
        `
        )
        .join("");
}

// Initialization
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("expenseChart")) {
        initializeCharts();
        updateBudget();
        window.addEventListener("scroll", checkScroll);
    }
    generateCaptcha();
});

function initializeCharts() {
    ["expense", "investment", "savings"].forEach((type) => {
        const ctx = document.getElementById(`${type}Chart`).getContext("2d");
        charts[type] = new Chart(ctx, createEmptyChartConfig(type));
    });
}

function createEmptyChartConfig(type) {
    return {
        type: type === "savings" ? "bar" : "doughnut",
        data: {
            labels: [],
            datasets: [
                {
                    data: [],
                    backgroundColor: ["#eeeeee"],
                    borderWidth: 1,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {display: false},
                title: {display: true, text: "No Data Available"},
            },
        },
    };
}

function checkScroll() {
    document.querySelectorAll("section").forEach((section) => {
        if (isElementInViewport(section)) {
            section.classList.add("visible");
        }
    });
}

function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return rect.top <= window.innerHeight && rect.bottom >= 0;
}

// Logout
function logout() {
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = "index.html";
}
