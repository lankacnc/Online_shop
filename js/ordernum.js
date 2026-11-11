function generateOrderNumber(){

    const now = new Date();

    const year = now.getFullYear();

    const month = String(now.getMonth()+1).padStart(2,"0");

    const day = String(now.getDate()).padStart(2,"0");

    const random = Math.floor(1000 + Math.random()*9000);

    return `TS-${year}${month}${day}-${random}`;

}

document.getElementById("order-number").textContent =
generateOrderNumber();