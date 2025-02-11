const btnReg =document.getElementsByClassName ('reg')[0];

btnReg.addEventListener('click', register);


document.addEventListener('keydown', function(event){
    if (event.key === 'Enter'){
        register();
    }
})


async function register(){
    const email =document.getElementById('email').value;
    const user_name =document.getElementById('name').value;
    const psw =document.getElementById('psw').value;
    const psw2 =document.getElementById('psw2').value;


    console.log(email, name, psw, psw2);



    if (psw!==psw2) {
        return alert('A két jelszó nem eggyezik!!')
    }


    const res =await fetch('http://127.0.0.1:3000/api/register', {
        method: 'POST',
        headers:{
            'content-type': 'application/json'
        },
        body: JSON.stringify({user_name, email, psw})
    });


    const data = await res.json();
    console.log(data);

    if (res.ok) {
        alert(data.message);
        window.location.href ='../webshop_frontend/login.html';
    } else if(data.errors){
        let errorMessage ='';
        for (let i = 0; i < data.errors.length; i++){
            errorMessage += `${data.errors[i].error}\n`
        }
        alert(errorMessage);
    }else if(data.error){
        alert(data.error);
    }else {
        alert('ismeretlen hiba')
    }
}