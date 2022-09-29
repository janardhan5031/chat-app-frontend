const token = localStorage.getItem('token');
if(!token){
    window.alert('you are not logged in. pls login first')
    window.location.href = '../sign_in/sign_in.html';
}

document.getElementById('send_btn').addEventListener('click',(e)=>{
    e.preventDefault();
    const msg = document.getElementById('chat_text').value;
    const token= localStorage.getItem('token');

    //console.log(msg,'       ', token)
    axios.post('http://localhost:5000/chat/send',{msg},{headers:{"authorization":token}})
    .then(result=>{
        //console.log(result);

        // getting the table with id
        const chat_parent = document.getElementById('chat_table').firstElementChild;
        
        // msg is successfully stored in database, then show it in interface
        if(result.status ===201){
            const ele =`
            <tr class="parent_user">
                <td class="p_user"><p>You</p></td>
                <td class="p_msg"><p>${result.data.msg}</p></td>
            </tr>`
            chat_parent.innerHTML +=ele;
            
            // removing the text from the input field
            document.getElementById('chat_text').value ='';
        }else{
            window.alert('unable to send your message');
        }
    })  
    .catch(err =>console.log(err));

})