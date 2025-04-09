function getById(id) {
  return document.getElementById(id);
}

const password = getById("password");
const confirmPassword = getById("confirm-password");
const form = getById("form");
const container = getById("container");
const loader = getById("loader");
const button = getById("submit");
const error = getById("error");
const success = getById("success");

error.style.display = "none";
success.style.display = "none";
container.style.display = "none";

let token, userId;
const passwordRegex =
  /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#\$%\^&\*])[a-zA-Z\d!@#\$%\^&\*]+$/;

window.addEventListener("DOMContentLoaded", async () => {
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });

  token = params.token;
  userId = params.userId;

  const res = await fetch("/api/auth/verify-password-reset-token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify({ token, userId }),
  });

  if (!res.ok) {
    const { error: err } = await res.json();
    loader.innerText = err;
    return;
  }

  loader.style.display = "none";
  container.style.display = "block";
});

function handleError(err) {
  success.style.display = "none";
  error.innerText = err;
  error.style.display = "block";
}

function handleSuccess(message) {
  success.style.display = "block";
  error.style.display = "none";
  success.innerText = message;
}

async function handleSubmit(e) {
  e.preventDefault();

  if (!password.value.trim()) {
    return handleError("Password is required");
  }

  if (!passwordRegex.test(password.value)) {
    return handleError(
      "Password must contain at least one letter, one number, and one special character"
    );
  }

  if (password.value !== confirmPassword.value) {
    return handleError("Passwords do not match");
  }

  button.disabled = true;

  button.innerText = "Please wait...";

  const res = await fetch("/api/auth/reset-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify({ token, userId, password: password.value }),
  });

  button.disabled = false;
  button.innerText = "Reset Password";

  if (!res.ok) {
    const { error: err } = await res.json();
    return handleError(err);
  }

  handleSuccess("Successfully Reset Password");
  password.value = "";
  confirmPassword.value = "";
}

form.addEventListener("submit", handleSubmit);
