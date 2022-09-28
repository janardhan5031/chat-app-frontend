
const name = document.getElementById('name_input');

document.getElementById('main_container').addEventListener('click',(e)=>{

    // removing the existing password contect from field
    if(e.target.id==='password_input'){e.target.value=''}

    // sign button click evet handling
    if(e.target.id==='signUp_btn'){
        e.preventDefault();
        const name= document.getElementById('name_input').value;
        const email= document.getElementById('email_input').value;
        const number= document.getElementById('number_input').value;
        const password=document.getElementById('password_input').value;

        if(name && email && number && password){
            axios.post('http://localhost:5000/user/sign_up',{name,email,number,password})
            .then((result)=>{
                console.log(result);
                if(result.status ===203){
                    window.alert(result.data.msg)
                }
                else{
                    window.alert(result.data.msg);
                }
            })
            .catch(err => console.log(err));
        }else{
            window.alert('please enter the all fields');
        }
        console.log('clicked')

    }

})