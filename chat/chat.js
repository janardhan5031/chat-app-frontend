

const token = localStorage.getItem('token');
// if user is not logged in, then redirecting him to login page
if(!token){
    window.alert('you are not logged in. pls login first')
    window.location.href = '../sign_in/sign_in.html';
}


// getting all the messages from the backend on page reloads
window.addEventListener('DOMContentLoaded', (e)=>{
    getAllUsers();  
    getAllGroups();
})

// getting all users on reloading a page from backend
function getAllUsers(){
    const token = localStorage.getItem('token');
    
    // calling backend to get all users 
    axios.get(`http://localhost:5000/user/getAllUsers`,{headers:{"authorization":token}})
    .then(result =>{
        console.log(result);

        // storing the members list in local storage
        localStorage.setItem('contacts',JSON.stringify(result.data)) 

        // displaying all uses in users panal
        displayAllUsers(result.data);

        // displaying the first user profile details in chat box module
        display_user_details_in_chat_module(result.data[0].id)

        // getting the first user conversation
        getConversation(result.data[0].id);

        // storing the current user name in local storage for further processing
        localStorage.setItem('contact_name',result.data[0].name)

    })  
    .catch(err => console.log(err));

}

// getting all groups on reload from backend
async function getAllGroups(){
    const token = localStorage.getItem('token');

    console.log(' call backend for groups list')

    axios.get(`http://localhost:5000/group/get-all`,{headers:{"authorization":token}})
    .then(result =>{
        if(result.status === 201){
            console.log(result)

            // storing the groups in local storage
            localStorage.setItem('groups',JSON.stringify(result.data.groups))

            // showing groups in user interface
            result.data.groups.forEach( (group)=>{

                showing_group_in_interface( group.id , group.groupName )
            })
        }
    })
    .catch(err => console.log(err));
}

// displaying the all users
function displayAllUsers(list){
    
    // displaying all uses in users panal
    const members_list = document.getElementById('members_table').firstElementChild;

    members_list.innerHTML='';

    list.forEach(data=>{

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
        
    })

}

// showing a particular person's convesation by click on him
document.getElementById('members_table').addEventListener('click', async(e)=>{

    //console.log(e.target.parentElement.parentElement.classList.contains('groupConversation'))

    // if the clicked element is group element, store group activation, id in LS
    if(e.target.parentElement.parentElement.classList.contains('groupConversation')){
        const groupId = e.target.parentElement.parentElement.id;
    }

    if(e.target.parentElement.parentElement.classList.contains('profile')){
        //console.log(e.target.parentElement.parentElement)
        const recieving_person_id = e.target.parentElement.parentElement.id;

        display_user_details_in_chat_module(recieving_person_id)

        // storing the contact name in local storage 
        let contact_name;
        JSON.parse(localStorage.getItem('contacts')).forEach(member =>{
            if(member.id === parseInt(recieving_person_id)){
                contact_name = member.name;
            }
        })

        localStorage.setItem('contact_name',contact_name);

        await getConversation(recieving_person_id);
    }
})

// displaying a particular person's profile data in chat module
function display_user_details_in_chat_module(userId){

    const child = document.getElementById(userId);
   
    const dp = child.children[0].children[0].src;
    const name = child.children[1].children[0].innerText;

    const parent = document.getElementById('contact_profile');
    parent.innerHTML = `
    <div class="profile" >
        <div class="profile_img" id="profile_img">
            <img src=${dp} alt="">
        </div>
        <div>
            <h4>${name}</h4>
            <p>last seed at</p>
        </div>
    </div>`;

}

// getting a parson's conversation
async function getConversation(recieving_person_id){

    // removing the existing msgs from display
    const chat_parent = document.getElementById('chat_table');
    chat_parent.innerHTML ='';

    // storign the child_user id in local storage 
    localStorage.setItem('send_to',recieving_person_id)

    // first read all msgs from the local storage and displayi then in frontend
    const old_msgs = JSON.parse(localStorage.getItem('old_msgs'));
    if(!old_msgs){      // if there are no msgs in LS, get all msgs from backend and store in LS ans showing them to client

        return await getMsgsFromBackend()

    }else{                 // else read all msgs from LS and then get new msgs from backend
        await displayingMessages(old_msgs);
    }
    
    
    
    // getting new msgs from backend for every second
    setInterval(()=>{

        
        //getMsgsFromBackend();
        
    },1000)
    
}

// getting new msgs from backend for one - one conversation
async function getMsgsFromBackend(){
    
    let last_msg_id = JSON.parse(localStorage.getItem('last_msg_id'));
    if(!last_msg_id){
        last_msg_id = 0;
    }
    //console.log('jani ==='+ last_msg_id)
    const token = localStorage.getItem('token');
    const recieving_person_id = localStorage.getItem('send_to')

    console.log(last_msg_id)
    await axios.get(`http://localhost:5000/chat/get-all?send_to=${recieving_person_id}&last_msg_id=${last_msg_id}`,{headers:{"authorization":token}})
    .then((result)=>{
        
        console.log(result);
        
        if(result.status ===201){
            
            // stroing the  previous and new msgs in local storages
            const new_msgs = result.data;
            const old_msgs = JSON.parse(localStorage.getItem('old_msgs'));
            
            //localStorage.removeItem('old_msgs');
            if(!old_msgs){
                localStorage.setItem('old_msgs',JSON.stringify(new_msgs));
            }else{ 
                localStorage.setItem('old_msgs',JSON.stringify(old_msgs.concat(new_msgs)))
            }

            // displaying the new msg in frontend
            displayingMessages(result.data);
           
        }else if(result.status ===203){
            //window.alert(result.data.msg);
            console.log(result.data.msg+'  but i am on duty! ');
        }else{
            window.alert('something went wrong');
        }

    })
    .catch(err=>console.log(err));

}

// displaying the msgs in user interfase
async function displayingMessages(array){

    //console.log('jani')

    const chat_parent = document.getElementById('chat_table');
    //chat_parent.innerHTML='';

    const parent_user = parseInt(JSON.parse(localStorage.getItem('user_data')).id);
    const child_user = parseInt(localStorage.getItem('send_to'))
    //console.log(child_user)

    const flt_array = await array.filter((data =>{
        //console.log(data.userId)
        if(data.send_to == child_user || data.send_to ==  parent_user 
            && data.userId == parent_user || data.userId ==child_user){
            return data;
        }
    }))
    
    console.log('filtered array',flt_array)

    flt_array.forEach((data,index)=>{
        
        // checking the conversation blongs to respective people or group 

        const parent_user = JSON.parse(localStorage.getItem('user_data'));
            
        // check the msg is blongs to parent_user or child_user by id stored in the local storage
        // if id is matched with the parent id then that msg is belongs to parent else chlid
        if(data.userId===JSON.parse(parent_user.id)){

            //console.log(data)
            const ele =`
            <tr class="parent_user">
                <td class="p_user"><p>You</p></td>  
                <td class="p_msg"><p>${data.msg}</p></td>
            </tr>`;
            
            chat_parent.innerHTML+=ele;
        }else{

            // reading the contact_name from local storage 
            const contact_name= localStorage.getItem('contact_name');
            //console.log(contact_name)

            const ele =`
            <tr class="child_user">
                <td class="p_user"><p>${contact_name}</p></td>
                <td class="p_msg"><p>${data.msg}</p></td>
            </tr>`;
            chat_parent.innerHTML+=ele;
        }
        

    })

    
    if(flt_array.length>0){
        // storing the last msg id in LS
        localStorage.setItem('last_msg_id',flt_array[flt_array.length-1].id);
    }
    if(flt_array.length===0){
        localStorage.setItem('last_msg_id',0)
    }
    
}


// sending message to a active person in the interface
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

        // displaying the new msg will triggered by setTimeInterval function

        // removing the text from the input field
        document.getElementById('chat_text').value ='';
    })  
    .catch(err =>console.log(err));

})  



// activeting new group container by click in '+' btn
document.getElementById('add_group').addEventListener('click',(e)=>{
    document.getElementById('add_new_group_container').classList.add('active');

})
// de-activating new group container by click on close btn
document.getElementById('close_btn').addEventListener('click',()=>{
    document.getElementById('add_new_group_container').classList.remove('active');
})

// addin new group by click on add group
document.getElementById('add_group_name').addEventListener('click',(e) =>{
    e.preventDefault();

    const token = localStorage.getItem('token');
    const groupName= document.getElementById('add_group_value').value;
    console.log(groupName)

    axios.post(`http://localhost:5000/group/create-group`,{groupName},{headers:{"authorization":token}})
    .then(result=>{
        console.log(result);

        if(result.status === 200){

            // showing the group in interface
            showing_group_in_interface(result.data.group_member[0].groupId,result.data.groupName)

            window.alert('successfully created a new group')

            // after successfull group creation, close that group creation container
            document.getElementById('add_new_group_container').classList.remove('active');

        }   
    })
    .catch(err => console.log(err));

});

function showing_group_in_interface(groupId,groupName){
    
    const members_list = document.getElementById('members_table');

    const ele = `
    <tr>
        <td>
            <div class="profile groupConversation" id=${groupId} >
                <div class="profile_img" id="profile_img">
                    <img src="https://media.istockphoto.com/photos/close-up-red-seed-of-micky-mouse-flower-with-blur-background-picture-id1415625631?b=1&k=20&m=1415625631&s=170667a&w=0&h=h0aMS--ulXT5E1p9OCHe2sPQZs99Qy2xwpUTQeR9u5g=" alt="">
                </div>
                <div>
                    <h4>${groupName}</h4>
                    <p>last seed at</p>
                </div>
            </div>
        </td>
    </tr>`
    members_list.innerHTML += ele;

}