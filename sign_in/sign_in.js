
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
                
                // storing the user credentails in local storage
                localStorage.setItem('token',result.data.token);
                localStorage.setItem('user_data',JSON.stringify(result.data.data));

                // after successfull sign in , redirecting him to chat board
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