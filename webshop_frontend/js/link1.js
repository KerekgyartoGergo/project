const btnLogout =document.getElementsByClassName ('icon-logout')[0];
const btnProfile =document.getElementsByClassName ('icon-user')[0];
const btnMenuLogo = document.getElementsByClassName('menu-logo')[0];


btnLogout.addEventListener('click', ()=>{
    window.location.href='../webshop_frontend/index.html';
});

btnProfile.addEventListener('click', ()=>{
    window.location.href='../webshop_frontend/profile.html';
});

btnMenuLogo.addEventListener('click', ()=>{
    window.location.href='../webshop_frontend/home.html';
});




document.addEventListener('DOMContentLoaded', function() {
    const footerColumns = document.querySelectorAll('.footer-column');

    footerColumns.forEach(column => {
        const title = column.querySelector('.footer-column-title');
        title.addEventListener('click', () => {
            column.classList.toggle('active');
        });
    });
});