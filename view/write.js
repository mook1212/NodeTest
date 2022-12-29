
let date = new Date()

document.querySelector('.ok').addEventListener('click',()=>{

    let title = document.getElementById('title').value
    let content = document.getElementById('content').value


    $.post('/writing',{
        date : date ,
        title : title ,
        content : content,
    }).done((res)=>{
        alert('작성완료')
        console.log(res);
    })
})

document.querySelector('.back').addEventListener('click',()=>{
    location.href = '/'
})