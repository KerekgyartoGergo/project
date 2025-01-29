const btnLogout =document.getElementsByClassName ('icon-logout')[0];
const btnMenuLogo = document.getElementsByClassName('menu-logo')[0];


btnLogout.addEventListener('click', ()=>{
    window.location.href='../webshop_frontend/index.html';
});
btnMenuLogo.addEventListener('click', ()=>{
    window.location.href='../webshop_frontend/home.html';
});

