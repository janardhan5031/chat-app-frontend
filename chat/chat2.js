

// activating and de-activating add group member to group container
const add_btn = document.getElementById('add_group_member');
const add_container = document.getElementById('add_group_members_container');

add_btn.addEventListener('click',(e)=>{
    e.preventDefault();
    console.log('jani')

    if(add_container.classList.contains('active')){
        add_container.classList.remove('active');
        add_btn.innerText = 'ADD';
        add_btn.style.color = 'black'
    }else{
        add_container.classList.add('active');
        add_btn.innerText = '✕';
        add_btn.style.color = 'red'
    }
    
})

