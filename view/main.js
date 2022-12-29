

document.querySelector('.login').addEventListener('click',()=>{
    location.href = '/login'
})

document.querySelector('.write').addEventListener('click', () => {

    let id = localStorage.getItem('id')
    if (id) {
        location.href = `/write?id=${id}`
    } else {
        alert('로그인 해주세요')
    }

})

// 게시글 목록
$.ajax({
    url: '/post-list',
    method: 'GET',
}).done((res) => {

    // 게시판
    const contents = document.querySelector("#notice-list");
    const buttons = document.querySelector(".notice-paging");

    const numOfContent = res.length;
    const maxContent = 5;
    const maxButton = 5;
    const maxPage = res.length / 5 + 1;
    let page = 1;


    // 게시판 글 조회
    const makeContent = (id) => {
        const content = document.createElement("li");
        content.classList.add("content");

        $('#notice-list').append(`
        <div class="notice-test" >
            <p class="list-num">${res.length + 1 - id}</p>
            <p data-id='${res[id - 1]._id}' id='text${id}' class='text' style="cursor: pointer">${res[id - 1].title}</p>
            
            <p class='list-name'>${res[id - 1].name}</p>
        </div>
        `)

        document.getElementById(`text${id}`).addEventListener('click', (e) => {
            console.log(e.target.dataset.id);
        })
        return content;
    };

    const makeButton = (id) => {
        const button = document.createElement("button");
        button.classList.add("button");
        button.dataset.num = id;
        button.innerText = id;
        button.addEventListener("click", (e) => {
            Array.prototype.forEach.call(buttons.children, (button) => {
                if (button.dataset.num) button.classList.remove("active");
            });
            e.target.classList.add("active");
            renderContent(parseInt(e.target.dataset.num));
        });
        return button;
    };

    const prev = document.createElement("button");
    const next = document.createElement("button");

    const renderContent = (page) => {
        // 목록 리스트 초기화
        while (contents.hasChildNodes()) {
            contents.removeChild(contents.lastChild);
        }
        // 글의 최대 개수를 넘지 않는 선에서, 화면에 최대 10개의 글 생성
        for (let id = (page - 1) * maxContent + 1; id <= page * maxContent && id <= numOfContent; id++) {
            contents.appendChild(makeContent(id));
        }
    };

    const renderButton = (page) => {
        // 버튼 리스트 초기화
        while (buttons.hasChildNodes()) {
            buttons.removeChild(buttons.lastChild);
        }
        // 화면에 최대 5개의 페이지 버튼 생성
        for (let id = page; id < page + maxButton && id <= maxPage; id++) {
            buttons.appendChild(makeButton(id));
        }
        // 첫 버튼 활성화(class="active")
        buttons.children[0].classList.add("active");

        buttons.prepend(prev);
        buttons.append(next);

        // 이전, 다음 페이지 버튼이 필요한지 체크
        if (page - maxButton < 1) buttons.removeChild(prev);
        if (page + maxButton > maxPage) buttons.removeChild(next);
    };

    const render = (page) => {
        renderContent(page);
        renderButton(page);
    };
    render(page);

    const goPrevPage = () => {
        page -= maxButton;
        render(page);
    };

    const goNextPage = () => {
        page += maxButton;
        render(page);
    };

    prev.classList.add("button", "prev");
    prev.innerHTML = '<ion-icon name="chevron-back-outline"></ion-icon>';
    prev.addEventListener("click", goPrevPage);

    next.classList.add("button", "next");
    next.innerHTML = '<ion-icon name="chevron-forward-outline"></ion-icon>';
    next.addEventListener("click", goNextPage);



})






// $('.chat').click((e) => {
//     console.log(e.target.dataset.name);

//     $.post('/chat-produce', {
//         me: localStorage.getItem('id'),
//         id: e.target.dataset.id,
//         name: e.target.dataset.name
//     })
//         .done((res) => {
//             alert('생성완료')
//             location.href = '/chat'
//         })
// })