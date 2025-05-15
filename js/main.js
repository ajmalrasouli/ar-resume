window.addEventListener('DOMContentLoaded', (event) => {
    getVisitCount();
});

const apiGateway = 'https://gkt25sgaaa.execute-api.us-east-2.amazonaws.com/Prod/visitor/'; 

const getVisitCount = () => {
    let count = 0;
    fetch(apiGateway, {
        mode: 'cors',
    })
    .then(response => {
        return response.json()
    })
    .then(res => {
        const count = res.Attributes.visitcount;
        document.getElementById('counter').innerText =count;
        document.getElementById('visitorElem').style.display = 'block';
    })
    return count;
}