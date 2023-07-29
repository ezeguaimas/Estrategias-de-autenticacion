const socket = io();

const updatedProducts = (products) => {
  const productsContainer = document.getElementById("RTProductsContainer");
  let productsHTML = "";

  products.forEach((product) => {
    const productHTML = `
    <ul>
        <li>
          <h2>${product.title}</h2>
          <p>${product.description}</p>
          <p>${product.price}</p>
          <p> Stock: ${product.stock}</p>
          <p>Categoría: ${product.category}</p>
        </li>
    </ul>
    `;

    productsHTML += productHTML;
  });

  productsContainer.innerHTML = productsHTML;
};

socket.on("updatedProducts", (products) => {
  updatedProducts(products);
});
