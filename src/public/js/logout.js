const logoutButton = document.querySelector(".logout");
logoutButton.addEventListener("click", logout);

async function logout() {
  const response = await fetch("/api/sessions/logout", {
    method: "POST",
  });
  const result = await response.json();
  if (result.status === 1) {
    window.location.replace("/login");
  } else {
    alert("Error en el logout");
  }
}
