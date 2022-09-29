
document.getElementById('signIn_btn').addEventListener('click',(e)=>{
    e.preventDefault();
    const email= document.getElementById('email_input').value;
    const password=document.getElementById('password_input').value;

    if(email && password){
        axios.post('http://localhost:5000/user/sign_in',{email,password})
        .then(result=>{
            console.log(result)
            if(result.status===200){
                window.alert(result.data.msg);
                localStorage.setItem('token',result.data.token);
                window.location.href = '../chat/chat.html';
            }else{
                window.alert(result.data.msg)
            }
        })
        .catch(err =>console.log(err));
    }else{
        window.alert('please enter the all fields');
    }
})