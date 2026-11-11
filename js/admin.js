
// =====================================
// ADMIN DASHBOARD
// =====================================

let adminKey = "";
let allProducts = [];
let currentImage = "";

// =====================================
// ELEMENTS
// =====================================
const loginSection = document.getElementById("loginSection");
const dashboard = document.getElementById("dashboard");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const loginMessage = document.getElementById("loginMessage");

const productForm = document.getElementById("productForm");
const productFormBox = document.getElementById("productFormBox");
const productsTable = document.getElementById("productsTable");
const formMessage = document.getElementById("formMessage");

const imageFile = document.getElementById("imageFile");
const imagePreview = document.getElementById("imagePreview");

// =====================================
// SAFE HTML
// =====================================
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

// =====================================
// LOGIN
// =====================================

loginBtn.addEventListener("click", async () => {
  const key = document.getElementById("adminKey").value.trim();

  if (!key) {
    loginMessage.textContent = "Enter admin password";
    return;
  }

  loginBtn.disabled = true;
  loginMessage.textContent = "Checking...";

  try {
    await sendAdminRequest({
      action: "verify",
      adminKey: key
    });

    adminKey = key;
    loginSection.hidden = true;
    dashboard.hidden = false;
    logoutBtn.hidden = false;

    await loadAdminProducts();

  } catch (error) {
    loginMessage.textContent =
      "Login failed. Check your admin password.";
  } finally {
    loginBtn.disabled = false;
  }
});


// =====================================
// LOGOUT
// =====================================
logoutBtn.addEventListener("click", () => {
  adminKey = "";
  allProducts = [];

  dashboard.hidden = true;
  loginSection.hidden = false;
  logoutBtn.hidden = true;

  document.getElementById("adminKey").value = "";
  loginMessage.textContent = "";
});

// =====================================
// LOAD PRODUCTS
// =====================================
async function loadAdminProducts() {
  productsTable.innerHTML =
    '<tr><td colspan="6">Loading products...</td></tr>';

  try {
    allProducts = await getLankaCNCProducts();
    renderAdminProducts(allProducts);
  } catch (error) {
    productsTable.innerHTML =
      `<tr><td colspan="6">${escapeHTML(error.message)}</td></tr>`;
  }
}

// =====================================
// DISPLAY PRODUCTS
// =====================================
function renderAdminProducts(products) {
  if (!products.length) {
    productsTable.innerHTML =
      '<tr><td colspan="6">No products found</td></tr>';
    return;
  }

  productsTable.innerHTML = products.map(product => `
    <tr>
      <td>${product.id}</td>
      <td>
        <img src="${escapeHTML(product.image)}"
             alt="${escapeHTML(product.name)}">
      </td>
      <td>${escapeHTML(product.name)}</td>
      <td>Rs. ${Number(product.price).toLocaleString()}</td>
      <td>${product.stock}</td>
      <td>
        <button class="edit-btn"
          data-action="edit"
          data-id="${product.id}">Edit</button>

        <button class="delete-btn"
          data-action="delete"
          data-id="${product.id}">Delete</button>
      </td>
    </tr>
  `).join("");
}

// =====================================
// SEARCH PRODUCTS
// =====================================
document.getElementById("searchProducts")
  .addEventListener("input", event => {
    const search = event.target.value.toLowerCase();

    const filtered = allProducts.filter(product =>
      product.name.toLowerCase().includes(search) ||
      product.category.toLowerCase().includes(search)
    );

    renderAdminProducts(filtered);
  });

// =====================================
// OPEN ADD PRODUCT FORM
// =====================================
document.getElementById("addProductBtn")
  .addEventListener("click", () => {
    resetProductForm();
    document.getElementById("formTitle").textContent = "Add Product";
    productFormBox.hidden = false;
    productFormBox.scrollIntoView({ behavior: "smooth" });
  });

// =====================================
// RESET FORM
// =====================================
function resetProductForm() {
  productForm.reset();

  document.getElementById("productId").value = "";
  document.getElementById("active").checked = true;

  currentImage = "";
  document.getElementById("image").value = "";

  imagePreview.src = "";
  imagePreview.hidden = true;

  formMessage.textContent = "";
}

// =====================================
// CANCEL FORM
// =====================================
document.getElementById("cancelBtn")
  .addEventListener("click", () => {
    productFormBox.hidden = true;
    resetProductForm();
  });

// =====================================
// IMAGE PREVIEW
// =====================================
imageFile.addEventListener("change", () => {
  const file = imageFile.files[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    formMessage.textContent = "Please select an image file.";
    imageFile.value = "";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    formMessage.textContent = "Image must be smaller than 5 MB.";
    imageFile.value = "";
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    imagePreview.src = reader.result;
    imagePreview.hidden = false;
  };

  reader.readAsDataURL(file);
});

// =====================================
// UPLOAD IMAGE TO GOOGLE DRIVE
// =====================================
async function uploadImageToDrive(file) {
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;

    reader.readAsDataURL(file);
  });

  const result = await sendAdminRequest({
    action: "uploadImage",
    adminKey: adminKey,
    fileName: file.name,
    contentType: file.type,
    fileData: base64
  });

  return result.image;
}

// =====================================
// SAVE PRODUCT
// =====================================
productForm.addEventListener("submit", async event => {
  event.preventDefault();

  const saveBtn = document.getElementById("saveBtn");
  saveBtn.disabled = true;
  formMessage.textContent = "Saving product...";

  try {
    let imageUrl = document.getElementById("image").value.trim();

    const selectedFile = imageFile.files[0];

    if (selectedFile) {
      imageUrl = await uploadImageToDrive(selectedFile);
    }

    let options = [];

    const optionsText = document.getElementById("options").value.trim();

    if (optionsText) {
      options = JSON.parse(optionsText);

      if (!Array.isArray(options)) {
        throw new Error("Options must be a JSON array.");
      }
    }

    const product = {
      id: document.getElementById("productId").value || 0,
      name: document.getElementById("name").value.trim(),
      category: document.getElementById("category").value,
      image: imageUrl,
      oldPrice: document.getElementById("oldPrice").value,
      price: document.getElementById("price").value,
      discount: document.getElementById("discount").value.trim(),
      rating: document.getElementById("rating").value.trim(),
      stock: document.getElementById("stock").value,
      description: document.getElementById("description").value.trim(),
      manualPdf1: document.getElementById("manualPdf1").value.trim(),
      manualPdf2: document.getElementById("manualPdf2").value.trim(),
      options: options,
      active: document.getElementById("active").checked
    };

    if (!product.name || !product.category || !product.price) {
      throw new Error("Please complete required fields.");
    }

    const result = await sendAdminRequest({
      action: "save",
      adminKey: adminKey,
      product: product
    });

    formMessage.textContent =
      "Product saved successfully. ID: " + result.id;

    resetProductForm();
    productFormBox.hidden = true;

    await loadAdminProducts();

  } catch (error) {
    formMessage.textContent = error.message;
  } finally {
    saveBtn.disabled = false;
  }
});

// =====================================
// EDIT / DELETE BUTTONS
// =====================================
productsTable.addEventListener("click", async event => {
  const button = event.target.closest("button[data-action]");

  if (!button) return;

  const id = Number(button.dataset.id);
  const action = button.dataset.action;

  const product = allProducts.find(item => item.id === id);

  if (!product) return;

  if (action === "edit") {
    editProduct(product);
  }

  if (action === "delete") {
    await removeProduct(id);
  }
});

// =====================================
// EDIT PRODUCT
// =====================================
function editProduct(product) {
  resetProductForm();

  document.getElementById("formTitle").textContent = "Edit Product";

  document.getElementById("productId").value = product.id;
  document.getElementById("name").value = product.name;
  document.getElementById("category").value = product.category;
  document.getElementById("image").value = product.image;
  document.getElementById("oldPrice").value = product.oldPrice;
  document.getElementById("price").value = product.price;
  document.getElementById("discount").value = product.discount;
  document.getElementById("rating").value = product.rating;
  document.getElementById("stock").value = product.stock;
  document.getElementById("description").value = product.description;
  document.getElementById("manualPdf1").value = product.manualPdf1;
  document.getElementById("manualPdf2").value = product.manualPdf2;
  document.getElementById("options").value =
    JSON.stringify(product.options || [], null, 2);

  document.getElementById("active").checked = true;

  currentImage = product.image;

  if (product.image) {
    imagePreview.src = product.image;
    imagePreview.hidden = false;
  }

  productFormBox.hidden = false;
  productFormBox.scrollIntoView({ behavior: "smooth" });
}

// =====================================
// DELETE PRODUCT
// =====================================
async function removeProduct(id) {
  if (!confirm("Are you sure you want to delete this product?")) {
    return;
  }

  try {
    await sendAdminRequest({
      action: "delete",
      adminKey: adminKey,
      id: id
    });

    await loadAdminProducts();

  } catch (error) {
    alert(error.message);
  }
}
