const menuBtn = document.getElementById("menu-toggle");
const navMenu = document.getElementById("nav-menu");

menuBtn.addEventListener("click", () => {

    navMenu.classList.toggle("active");

    if(navMenu.classList.contains("active")){
        menuBtn.innerHTML =
        '<i class="fa-solid fa-xmark"></i>';
    }else{
        menuBtn.innerHTML =
        '<i class="fa-solid fa-bars"></i>';
    }

});

document.querySelectorAll("#nav-menu a").forEach(link=>{

    link.addEventListener("click",()=>{

        navMenu.classList.remove("active");

        menuBtn.innerHTML =
        '<i class="fa-solid fa-bars"></i>';

    });

});