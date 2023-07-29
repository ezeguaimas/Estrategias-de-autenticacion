const addListeners = () => {
  const addToCartButtons = document.querySelectorAll(".addToCart");
  addToCartButtons.forEach((button) => {
    button.addEventListener("click", addToCart);
  });
};

const addToCart = async (event) => {
  const productId = event.target.dataset.id;

  let cartId;
  try {
    const response = await fetch("/api/carts/", {
      method: "POST",
    });
    const data = await response.json();
    cartId = data.cart._id;
  } catch (error) {
    return alert("Error al crear un nuevo carrito");
  }
  try {
    const response = await fetch(`/api/carts/${cartId}/product/${productId}`, {
      method: "POST",
    });
    const result = await response.json();
    if (result.status === 1) {
      alert(`Producto agregado al carrito ${cartId} exitosamente!`);
    } else {
      alert("Error al agregar el producto al carrito");
    }
  } catch (error) {
    console.error("Error al agregar el producto al carrito:", error);
    alert("Error al agregar el producto al carrito");
  }
};
addListeners();
