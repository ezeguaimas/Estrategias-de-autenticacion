const form = document.getElementById("resetPasswordForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const obj = {};
  data.forEach((value, key) => (obj[key] = value));
  const response = await fetch("/api/sessions/restartPassword", {
    method: "PUT",
    body: JSON.stringify(obj),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const result = await response.json();
  if (result.status === 1) {
    alert(result, { message: "Contraseña restaurada" });
    window.location.href = "/login";
  } else {
    alert(result, { message: "Error al restaurar la contraseña" });
  }
});
