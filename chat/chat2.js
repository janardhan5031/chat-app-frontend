const group_controll_icon = document.getElementById('group_controll');
    const add_container = document.getElementById('add_group_members_container');
    const admin_controlls = document.getElementById('admin_controlls');
    const chat_history = document.getElementById('chat_history');
    
    group_controll_icon.addEventListener('click',async (e)=>{
        e.preventDefault();
        //console.log('jani')
    
        if(add_container.classList.contains('active')){
            add_container.classList.remove('active');
            admin_controlls.classList.remove('active');
            group_controll_icon.innerText = 'controlls';
            group_controll_icon.style.color = 'black'
            chat_history.style.height ='100%'
    
        }else{
            admin_controlls.classList.add('active');
            chat_history.style.height ='91%';
            add_container.classList.add('active');
            group_controll_icon.innerText = '✕';
            group_controll_icon.style.color = 'red'


        }
        
    })