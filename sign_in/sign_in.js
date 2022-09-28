
document.getElementById('signIn_btn').addEventListener('click',()=>{
    const email= document.getElementById('email_input');
    const password=document.getElementById('password_input');

    if(email && password){
        axios.post('http://localhost:5000/user/sign_in',{email,password})
        .then(result=>{
            console.log(result);
        })
        .catch(err =>console.log(err));
    }else{
        window.alert('please enter the all fields');
    }
})