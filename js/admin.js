
// =====================================
// ADMIN DASHBOARD
// =====================================

let adminKey = "";
let allProducts = [];

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

const manualPdf1File = document.getElementById("manualPdf1File");
const manualPdf2File = document.getElementById("manualPdf2File");


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
// GOOGLE DRIVE FILE ID
// =====================================

function getDriveFileId(url) {

  const value = String(url || "").trim();

  if (!value) return "";

  const patterns = [
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/thumbnail\?[^#]*\bid=([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/uc\?[^#]*\bid=([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/open\?[^#]*\bid=([a-zA-Z0-9_-]+)/
  ];

  for (const pattern of patterns) {

    const match = value.match(pattern);

    if (match) {
      return match[1];
    }
  }

  // Allow direct Google Drive file ID

  if (/^[a-zA-Z0-9_-]{20,}$/.test(value)) {
    return value;
  }

  return "";
}


// =====================================
// IMAGE URL GENERATOR
// =====================================

function toDriveThumbnailUrl(url) {

  const id = getDriveFileId(url);

  if (!id) {
    return String(url || "").trim();
  }

  return `https://drive.google.com/thumbnail?id=${id}&sz=w1201`;
}


// =====================================
// PDF DOWNLOAD URL GENERATOR
// =====================================

function toDriveDownloadUrl(url) {

  const id = getDriveFileId(url);

  if (!id) {
    return String(url || "").trim();
  }

  return `https://drive.google.com/uc?export=download&id=${id}`;
}


// =====================================
// UPLOAD FILE TO GOOGLE DRIVE
// =====================================

async function uploadFileToDrive(file, fileType) {

  const base64 = await new Promise((resolve, reject) => {

    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);

    reader.onerror = () => {
      reject(new Error("Could not read selected file."));
    };

    reader.readAsDataURL(file);

  });

  const result = await sendAdminRequest({

    action: "uploadFile",

    adminKey: adminKey,

    fileName: file.name,

    contentType: file.type,

    fileData: base64,

    fileType: fileType

  });

  if (!result.success || !result.url) {
    throw new Error(result.error || "File upload failed.");
  }

  return result.url;
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

      <td>${escapeHTML(product.id)}</td>

      <td>
        <img
          src="${escapeHTML(product.image)}"
          alt="${escapeHTML(product.name)}">
      </td>

      <td>${escapeHTML(product.name)}</td>

      <td>
        Rs. ${Number(product.price).toLocaleString()}
      </td>

      <td>${escapeHTML(product.stock)}</td>

      <td>

        <button
          class="edit-btn"
          data-action="edit"
          data-id="${escapeHTML(product.id)}">
          Edit
        </button>

        <button
          class="delete-btn"
          data-action="delete"
          data-id="${escapeHTML(product.id)}">
          Delete
        </button>

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

    String(product.name).toLowerCase().includes(search) ||

    String(product.category).toLowerCase().includes(search)

  );

  renderAdminProducts(filtered);

});


// =====================================
// ADD PRODUCT FORM
// =====================================

document.getElementById("addProductBtn")
.addEventListener("click", () => {

  resetProductForm();

  document.getElementById("formTitle").textContent =
    "Add Product";

  productFormBox.hidden = false;

  productFormBox.scrollIntoView({
    behavior: "smooth"
  });

});


// =====================================
// RESET FORM
// =====================================

function resetProductForm() {

  productForm.reset();

  document.getElementById("productId").value = "";

  document.getElementById("active").checked = true;

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

    formMessage.textContent =
      "Please select an image file.";

    imageFile.value = "";

    return;
  }

  if (file.size > 5 * 1024 * 1024) {

    formMessage.textContent =
      "Image must be smaller than 5 MB.";

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
// PDF VALIDATION
// =====================================

function validatePdf(file) {

  if (!file) return;

  const isPdf =
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf");

  if (!isPdf) {
    throw new Error("Please select a PDF file.");
  }

  if (file.size > 20 * 1024 * 1024) {
    throw new Error("PDF must be smaller than 20 MB.");
  }

}


// =====================================
// CONVERT PASTED IMAGE URL
// =====================================

document.getElementById("image")
.addEventListener("change", event => {

  const url = event.target.value.trim();

  const converted = toDriveThumbnailUrl(url);

  event.target.value = converted;

  if (converted) {

    imagePreview.src = converted;

    imagePreview.hidden = false;

  }

});


// =====================================
// CONVERT PASTED PDF URLS
// =====================================

["manualPdf1", "manualPdf2"].forEach(id => {

  document.getElementById(id)
  .addEventListener("change", event => {

    event.target.value =
      toDriveDownloadUrl(event.target.value);

  });

});


// =====================================
// SAVE PRODUCT
// =====================================

productForm.addEventListener("submit", async event => {

  event.preventDefault();

  const saveBtn = document.getElementById("saveBtn");

  saveBtn.disabled = true;

  formMessage.textContent =
    "Uploading files and saving product...";

  try {

    // IMAGE

    let imageUrl = toDriveThumbnailUrl(
      document.getElementById("image").value
    );

    const selectedImage = imageFile.files[0];

    if (selectedImage) {

      imageUrl = await uploadFileToDrive(
        selectedImage,
        "image"
      );

    }


    // PDF 1

    let manualPdf1 = toDriveDownloadUrl(
      document.getElementById("manualPdf1").value
    );

    const pdf1 = manualPdf1File.files[0];

    if (pdf1) {

      validatePdf(pdf1);

      manualPdf1 = await uploadFileToDrive(
        pdf1,
        "pdf"
      );

    }


    // PDF 2

    let manualPdf2 = toDriveDownloadUrl(
      document.getElementById("manualPdf2").value
    );

    const pdf2 = manualPdf2File.files[0];

    if (pdf2) {

      validatePdf(pdf2);

      manualPdf2 = await uploadFileToDrive(
        pdf2,
        "pdf"
      );

    }


    // SIZE OPTIONS

    let options = [];

    const optionsText =
      document.getElementById("options").value.trim();

    if (optionsText) {

      options = JSON.parse(optionsText);

      if (!Array.isArray(options)) {
        throw new Error("Options must be a JSON array.");
      }

    }


    // PRODUCT DATA

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

      manualPdf1: manualPdf1,

      manualPdf2: manualPdf2,

      options: options,

      active: document.getElementById("active").checked

    };


    if (!product.name || !product.category || !product.price) {

      throw new Error("Please complete required fields.");

    }


    // SEND TO GOOGLE SHEETS

    const result = await sendAdminRequest({

      action: "save",

      adminKey: adminKey,

      product: product

    });

    if (!result.success) {

      throw new Error(result.error || "Could not save product.");

    }


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

  const product = allProducts.find(item =>
    Number(item.id) === id
  );

  if (!product) return;

  if (button.dataset.action === "edit") {

    editProduct(product);

  }

  if (button.dataset.action === "delete") {

    await removeProduct(id);

  }

});


// =====================================
// EDIT PRODUCT
// =====================================

function editProduct(product) {

  resetProductForm();

  document.getElementById("formTitle").textContent =
    "Edit Product";

  document.getElementById("productId").value = product.id;

  document.getElementById("name").value = product.name || "";

  document.getElementById("category").value = product.category || "";

  document.getElementById("image").value = product.image || "";

  document.getElementById("oldPrice").value = product.oldPrice || "";

  document.getElementById("price").value = product.price || "";

  document.getElementById("discount").value = product.discount || "";

  document.getElementById("rating").value = product.rating || "";

  document.getElementById("stock").value = product.stock || 0;

  document.getElementById("description").value =
    product.description || "";

  document.getElementById("manualPdf1").value =
    product.manualPdf1 || "";

  document.getElementById("manualPdf2").value =
    product.manualPdf2 || "";

  document.getElementById("options").value =
    JSON.stringify(product.options || [], null, 2);

  document.getElementById("active").checked =
    product.active !== false;

  if (product.image) {

    imagePreview.src = toDriveThumbnailUrl(product.image);

    imagePreview.hidden = false;

  }

  productFormBox.hidden = false;

  productFormBox.scrollIntoView({
    behavior: "smooth"
  });

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
