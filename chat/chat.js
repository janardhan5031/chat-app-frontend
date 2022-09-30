const token = localStorage.getItem('token');
// if user is not logged in, then redirecting him to login page
if(!token){
    window.alert('you are not logged in. pls login first')
    window.location.href = '../sign_in/sign_in.html';
}


// getting all the messages from the backend on page reloads
window.addEventListener('DOMContentLoaded', (e)=>{
    getAllUsers();  
})

// getting all users on reloading a page
function getAllUsers(){
    const token = localStorage.getItem('token');
    
    // calling backend to get all users 
    axios.get(`http://localhost:5000/user/getAllUsers`,{headers:{"authorization":token}})
    .then(result =>{
        console.log(result);

        // displaying all uses in users panal
        const members_list = document.getElementById('members_table').firstElementChild;
        
        members_list.innerHTML='';

        const current_user = JSON.parse(localStorage.getItem('user_data'));

        let flag=true;
        result.data.forEach(data=>{
            if(data.id !== current_user.id){
                const ele = `
                <tr>
                    <td>
                        <div class="profile" id=${data.id} >
                            <div class="profile_img" id="profile_img">
                                <img src="https://media.istockphoto.com/photos/close-up-red-seed-of-micky-mouse-flower-with-blur-background-picture-id1415625631?b=1&k=20&m=1415625631&s=170667a&w=0&h=h0aMS--ulXT5E1p9OCHe2sPQZs99Qy2xwpUTQeR9u5g=" alt="">
                            </div>
                            <div>
                                <h4>${data.name}</h4>
                                <p>last seed at</p>
                            </div>
                        </div>
                    </td>
                </tr>`
                members_list.innerHTML += ele;

                // getting the first chile_user chat
                if(flag){
                    getConversation(data.id);
                    flag=false;
                }
            }
        })


    })  
    .catch(err => console.log(err));

}

// showing a particular person's convesation by click on him
document.getElementById('members_table').addEventListener('click',(e)=>{

    //console.log(e.target.parentElement.parentElement)
    if(e.target.parentElement.parentElement.className ==='profile'){
        const recieving_person_id = e.target.parentElement.parentElement.id;
        getConversation(recieving_person_id);
    }
})

// getting a parson's conversation
function getConversation(recieving_person_id){

    axios.get(`http://localhost:5000/chat/get-all?send_to=${recieving_person_id}`,{headers:{"authorization":token}})
    .then((result)=>{

        // storign the child_user id in local storage 
        localStorage.setItem('send_to',recieving_person_id)

        console.log(result);
        const chat_parent = document.getElementById('chat_table').firstElementChild;
        chat_parent.innerHTML ='';

        if(result.status ===201){
            result.data.forEach((data)=>{
                
                // check the msg is blongs to parent_user or child_user by id stored in the local storage
                // if id is matched with the parent id then that msg is belongs to parent else chlid
                const parent_user = JSON.parse(localStorage.getItem('user_data'));
                if(data.userId===JSON.parse(parent_user.id)){
                    const ele =`
                    <tr class="parent_user">
                        <td class="p_user"><p>You</p></td>
                        <td class="p_msg"><p>${data.msg}</p></td>
                    </tr>`;
                    chat_parent.innerHTML+=ele;
                }else{
                    const ele =`
                    <tr class="child_user">
                        <td class="p_user"><p>child name</p></td>
                        <td class="p_msg"><p>${data.msg}</p></td>
                    </tr>`;
                    chat_parent.innerHTML+=ele;
                }

            })
        }else if(result.status ===203){
            window.alert(result.data.msg);
        }else{
            window.alert('something went wrong');
        }

    })
    .catch(err=>console.log(err));  
}


// sending message to a particular person
document.getElementById('send_btn').addEventListener('click',(e)=>{
    e.preventDefault();
    const msg = document.getElementById('chat_text').value;
    const token= localStorage.getItem('token');
    const send_to = localStorage.getItem('send_to');
    console.log(send_to)

    //console.log(msg,'       ', token)

    axios.post(`http://localhost:5000/chat/send?send_to=${send_to}`,{msg},{headers:{"authorization":token}})
    .then(result=>{
        console.log(result);

        // getting the table with id
        const chat_parent = document.getElementById('chat_table').firstElementChild;
        
        // msg is successfully stored in database, then show it in interface
        if(result.status ===201){

            // appending the new sent msg in interface
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