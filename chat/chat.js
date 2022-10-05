

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
    .then(async (result) =>{
        console.log(result);

        // storing the members list in local storage
        localStorage.setItem('contacts',JSON.stringify(result.data)) 

        // displaying all uses in users panal
        displayAllUsers(result.data);

        
        // storiing the group flag as false becase we are first displaying one - one conversataion
        if(result.data.length > 0){
            await flag();

            // displaying the first user profile details in chat box module
            await display_user_details_in_chat_module(result.data[0].name)

        }

        // getting the first user conversation
        getConversation(result.data[0].id);

        // storing the current user name in local storage for further processing
        localStorage.setItem('contact_name',result.data[0].name)

    })  
    .catch(err => console.log(err));

}

async function flag(){
    localStorage.setItem('isgroup',false)
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
document.getElementById('members_table').addEventListener('click',(e)=>{

    //console.log(e.target.parentElement.parentElement.classList.contains('groupConversation'))

    // if the clicked element is group element, store group activation, id in LS
    if(e.target.parentElement.parentElement.classList.contains('groupConversation')){
        const parent = e.target.parentElement.parentElement;
        localStorage.setItem('isgroup',true);
        localStorage.setItem('send_to',parent.id);
        
        conversaion_name = parent.children[1].children[0].innerText;
        console.log(conversaion_name)
        localStorage.setItem('contact_name',conversaion_name);

        display_user_details_in_chat_module(conversaion_name)


        getConversation(parent.id);
    }else{

        const parent = e.target.parentElement.parentElement;
        localStorage.setItem('isgroup',false);
        localStorage.setItem('send_to',parent.id);
        
        conversaion_name = parent.children[1].children[0].innerText;
        console.log(conversaion_name)
        localStorage.setItem('contact_name',conversaion_name);

        display_user_details_in_chat_module(conversaion_name)

       
        getConversation(parent.id);
    }

})

// displaying a particular person's profile data in chat module
async function display_user_details_in_chat_module(conversaion_name){
   
    const parent = document.getElementById('contact_profile');

    const ele =`
    <div class="add_group_member" >
    <button type="button" id="group_controll">controlls</button>
    </div>`;

    button = await JSON.parse(localStorage.getItem('isgroup')) ? ele : '';

    parent.innerHTML = `
    <div class="profile" id=" usr_id">
        <div class="profile_img" id="profile_img">
            <img src="https://media.istockphoto.com/photos/close-up-red-seed-of-micky-mouse-flower-with-blur-background-picture-id1415625631?b=1&k=20&m=1415625631&s=170667a&w=0&h=h0aMS--ulXT5E1p9OCHe2sPQZs99Qy2xwpUTQeR9u5g=" alt="">
        </div>
        <div>
            <h4>${conversaion_name}</h4>
            <p>last seed at</p>
        </div>
        ${button}
    </div>`
    if(JSON.parse(localStorage.getItem('isgroup'))){

        await get_group_members_from_backend();

        await group_controlls();
    }

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

    getMsgsFromBackend();
    
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

    const path = JSON.parse(localStorage.getItem('isgroup')) ? 'get-grp-msgs' : 'get-all' ;

    console.log(last_msg_id)
    await axios.get(`http://localhost:5000/chat/${path}?send_to=${recieving_person_id}&last_msg_id=${last_msg_id}`,{headers:{"authorization":token}})
    .then(async(result)=>{
        
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
            await displayingMessages(result.data);
           
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

    let flt_array;
    if(JSON.parse(localStorage.getItem('isgroup'))){
        flt_array = await array.filter((data =>{
            //console.log(data.userId)
            if(data.groupId == child_user){
                return data;
            }
        }))
    }else{

        flt_array = await array.filter((data =>{
            //console.log(data.userId)
            if(data.send_to == child_user || data.send_to ==  parent_user 
                && data.userId == parent_user || data.userId ==child_user && !data.groupId){
                return data;
            }
        }))
    }
    
    //console.log('filtered array',flt_array)

    await flt_array.forEach((data,index)=>{
        

        ///console.log(data.groupId)
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

            // if msg is from group, then find the who send it to group else read the contact name from LS
            const userId = data.userId;
            let contact;
            JSON.parse(localStorage.getItem('contacts')).forEach((data)=> {
                if(data.id ==userId){ contact = data.name}
            })

            // reading the contact_name from local storage 
            const contact_name= JSON.parse(localStorage.getItem('isgroup')) ? contact : localStorage.getItem('contact_name');
            console.log(contact_name)

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

    const path = JSON.parse(localStorage.getItem('isgroup')) ? 'chat/send-to-grp' : 'chat/send' ;
    //console.log(msg,'       ', token)

    axios.post(`http://localhost:5000/${path}?send_to=${send_to}`,{msg},{headers:{"authorization":token}})
    .then(result=>{
        console.log(result);

        // displaying the new msg will triggered by setTimeInterval function and store that msg in LS

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

// showing all groups in user contacts table
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


// getting active group members from backend
async function get_group_members_from_backend(){
    const groupId = localStorage.getItem('send_to');
    const token = localStorage.getItem('token');

    // getting the all users of respective active group
    axios.get(`http://localhost:5000/group/get-members?groupId=${groupId}`,{headers:{"authorization":token}})
    .then(result=>{
        console.log(result)
        if(result.status ===200){
            localStorage.setItem('group_members',JSON.stringify(result.data))
        }else{
            window.alert('something went wrong. please try again later ')
        }
    })
    .catch(err => console.log(err))

}


// activating and de-activating add group member to group container
async function group_controlls(){

    const group_controll_icon = document.getElementById('group_controll');
    const add_container = document.getElementById('add_group_members_container');
    const admin_controlls = document.getElementById('admin_controlls');
    const chat_history = document.getElementById('chat_history');
    
    group_controll_icon.addEventListener('click',async (e)=>{
        e.preventDefault();
        //console.log('jani')
    
        if(add_container.classList.contains('active')){
            // de-activaating left container to show members
            add_container.classList.remove('active');
            // second top container to show the admin controlls
            admin_controlls.classList.remove('active');
            group_controll_icon.innerText = 'controlls';
            group_controll_icon.style.color = 'black'
            chat_history.style.height ='100%'
    
        }else{
            // activating the left conatiner to show members and compressing the chat container accordingly
            add_container.classList.add('active');
            chat_history.style.height ='91%';
            // activating admin controller container
            admin_controlls.classList.add('active');
            group_controll_icon.innerText = '✕';
            group_controll_icon.style.color = 'red'

        }

        // listening all events at admin controlls container 
        admin_controlls.addEventListener('click',async (e)=>{

            let key;
            // if admin click on add button, the he can be able to add member to group by sowing the member in left container
            if(e.target.id ==='add_member') key ='add_new_member'

            // removing the existing member from the group
            else if(e.target.id ==='remove_member')  key ='remove_member'

            // adding the existing member as admin to group
            else if(e.target.id==='add_admin')   key ='add_admin'

            // removing the admin status of member from group
            else if(e.target.id === 'remove_admin')  key='remove_admin'
            
            await show_members_in_left_container(key);
            await update_member_status_in_container(key);

        })


        
    })
}

// showing the memgers to add into the group
async function show_members_in_left_container(key){
    const container = document.getElementById('add_group_members_container');
    container.innerHTML = '';

    //console.log('janiq')

    // existing group member's ids list
    const group_members = new Set(JSON.parse(localStorage.getItem('group_members')).map( member => member.userId));
   
    console.log(group_members)

    // all contacts list in LS
    const contacts = JSON.parse(localStorage.getItem('contacts'));
    // if the given key => add_new_member (i.e add new members to group)
    if(key==='add_new_member'){
        contacts.forEach( (member) =>{
            // compaing all members in contact list with group members list and showing who are not in group 
            if(!group_members.has(member.id)){
                //console.log(member.id )
                // before showing the members, we need to clear the container
                container.innerHTML += element(member.id, member.name);
            }
        })
    }
    // if the key => remove_member (i.e remove existing member from the group)
    else if(key ==='remove_member'){
        console.log(JSON.parse(localStorage.getItem('group_members')))
        JSON.parse(localStorage.getItem('group_members')).forEach(member =>{
            // checking the member is not a current user/ admin of the group
            if(member.userId !== JSON.parse(localStorage.getItem('user_data')).id){
                // if the user is member is exist in group, search that user with userId from group in contacts list in LS
                // show him the left container
                contacts.forEach(user =>{
                    console.log(user)
                    if(user.id === member.userId){
                        container.innerHTML += element(user.id,user.name)
                    }
                })
            }
        })
    }

    // adding existing user as admin to group
    else if(key ==='add_admin'){
        JSON.parse(localStorage.getItem('group_members')).forEach(member =>{
            if(!member.isadmin){
                return contacts.forEach(user =>{

                    if(user.id === member.userId){

                        return container.innerHTML += element(user.id, user.name);
                    }
                })
            }
        })
    }

    else if(key === 'remove_admin'){
        JSON.parse(localStorage.getItem('group_members')).forEach(member =>{
            if(member.isadmin){
                console.log(member)
                const list = contacts.filter(user => user.id === member.userId);
                if(list.length>0){
                    list.forEach(user =>{
                        return container.innerHTML += element(user.id, user.name);
                    })
                }else{
                    window.alert('no memer matched to this operation')
                }
                
            }
        })
    }

    function element(id,name){
        return `
        <div class="group_member_ele" id=${id}>
            <label for=${id}>
                <div class="profile_img">
                    <img src="https://media.istockphoto.com/photos/close-up-red-seed-of-micky-mouse-flower-with-blur-background-picture-id1415625631?b=1&k=20&m=1415625631&s=170667a&w=0&h=h0aMS--ulXT5E1p9OCHe2sPQZs99Qy2xwpUTQeR9u5g=" alt="">
                </div>
            </label>
            <div class="contact_name">
                <h4>${name}</h4>
            </div>
            <div class="selection_div" id="check">
                <input type="checkbox" id=${id}>
            </div>
        </div>`

    }
}

// adding the member by click on check box to the group and showing the status of request
async function update_member_status_in_container(key){

    const main_container = document.getElementById('add_group_members_container');

    main_container.addEventListener('click',async (e)=>{

        //console.log('jani')
        e.preventDefault();

        //console.log(e.target.parentElement.parentElement.parentElement.children[2].children[0])
        const event = e.target.parentElement.parentElement;
        let parent;
        let check;
        if(event.parentElement.className ==='group_member_ele'){
            parent =event.parentElement;
            check = event.parentElement.children[2].children[0];
          
        }else if(event.className === 'group_member_ele'){
            parent=event;
            check = event.children[2].children[0];
        }
        check.checked = true;
        check.parentElement.parentElement.children[1].children[0].innerText +=' is added'
        console.log(check.checked)
        setTimeout(()=>{
            check.disabled =true
            parent.style.transform ='translatex(150%)'  
        },3000)
        
           
        await update_group_in_backend(key,check.id)
        
    })

}

async function update_group_in_backend(key, userId){
    const token = localStorage.getItem('token');
    const groupId = localStorage.getItem('send_to');

    await axios.post(`http://localhost:5000/group/${key}`,{groupId,userId},{headers:{"authorization":token}})
    .then((result)=>{
        //console.log(result)
        window.alert(result.data.msg)
    })
    .catch(err => console.log(err))

}

