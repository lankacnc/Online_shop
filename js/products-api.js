


const PRODUCTS_API_URL =
  "https://script.google.com/macros/s/AKfycbzZiGUGFm_nBkTWVVpDDYlbOgB-Cr8KPcEdtZn9n400-ZhI6Thh9KhMOiq3PseW-yMn/exec";

// =====================================
// GET PRODUCTS FROM GOOGLE SHEETS
// =====================================
async function getLankaCNCProducts() {
  const response = await fetch(
    PRODUCTS_API_URL + "?t=" + Date.now(),
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error("Unable to load products");
  }

  const data = await response.json();

  if (!Array.isArray(data.products)) {
    throw new Error(data.error || "Invalid product data");
  }

  return data.products;
}

// =====================================
// SEND ADMIN REQUEST
// =====================================
async function sendAdminRequest(payload) {
  const response = await fetch(PRODUCTS_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Server request failed");
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Request failed");
  }

  return result;
}

// =====================================
// CREATE PRODUCT SLUG
// =====================================
function createSlug(name) {
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
