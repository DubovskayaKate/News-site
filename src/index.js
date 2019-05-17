
import './style.css'
import './images/img1.jpg'

let  lastUsedUrl = '';
let page = 0;
let alreadyNewsDisplayed = 0;
const loadButton = '#main-load-bn';
const errorLabel = '#main-errorLabel';
const promosionImg = '#main-img';

controller_loadSources();

document.querySelector(loadButton).addEventListener('click', () => {
    controller_appendNews();
  });

document.querySelector('#main-sources').addEventListener('click', (event) =>{
    controller_loadNewsByUrl(`everything?sources=${event.target.id}&pageSize=5&page=1&`);
});
document.querySelector('#main-search-bn').addEventListener('click', 
    () => {
        if(document.querySelector('#main-search-input').value.length > 0){
            controller_loadNewsByUrl(`everything?q=${document.querySelector('#main-search-input').value}&pageSize=5&page=1&`);
    }
});
document.querySelector('#main-search-input').addEventListener('keyup', 
    function(event) { // () => VS function
        event.preventDefault();
        if (event.keyCode === 13) {
            document.querySelector('#main-search-bn').click();
    }
});


function view_hideElement(element) {
    document.querySelector(element).style.display = 'none';
};

function view_showElement(element){
    document.querySelector(element).style.display = 'unset';
}


function view_createSourceItem(id, name){
    document.querySelector('#main-sources').innerHTML += '<div class"btn__sources"><button id="' +id + '">' + name + '</button></div> '; // ES6 `${}`
}

function view_createNewsItem(html, data){
    html.querySelector('.news-item__content__img').style.backgroundImage = `url(${data.urlToImage ? data.urlToImage : './src/images/img1.jpg'})`;
    html.querySelector('.news-item__content__title').textContent = data.title;
    html.querySelector('.news-item__content__source').textContent = data.source.name;
    html.querySelector('.news-item__content__text').textContent = data.description;
    html.querySelector('.news-item__content__link').setAttribute('href', data.url);
    return html;
}

// let controller = {
//     loadSorces: function() {

//     }
// }
function controller_loadSources(){
    const url = 'https://newsapi.org/v2/sources?apiKey=f8e8d035014546dd9789f8527d1fe4d3&category=technology&country=us';
    const request = new Request(url);
    fetch(request)
        .then( (response) => response.json())
        .then(
            function(data) {
                for (let i = 0; i < data.sources.length; i++) {
                    view_createSourceItem(data.sources[i].id, data.sources[i].name);
                }
        });
}

function controller_loadNewsByUrl(urlPart){

    view_hideElement(loadButton);
    view_hideElement(promosionImg);
    view_hideElement(errorLabel);
    const url = 'https://newsapi.org/v2/' + urlPart + 'apiKey=f8e8d035014546dd9789f8527d1fe4d3';
    const request = new Request(url);
    fetch(request)
        .then( (response) => response.json())
        .then(function(data) {  
            const newsBlock = document.querySelector('#main-newsContent');
            newsBlock.innerHTML = '';
            let newsCount = data.articles.length;
            if(newsCount == 0){
                view_showElement(errorLabel);
                view_showElement(promosionImg);
                view_hideElement(loadButton);
                return;
            }      
            let block = model_createNewsBlock(newsCount, data.articles);
            newsBlock.appendChild(block);
            if(newsCount < 5)
                view_hideElement(loadButton);
            else
                view_showElement(loadButton);

            lastUsedUrl = url;
            page = 2;
            alreadyNewsDisplayed = newsCount;
    });
  }

function controller_appendNews(){
    lastUsedUrl = lastUsedUrl.replace(new RegExp('page=.*&'), 'page=' + page + '&');
    const request = new Request(lastUsedUrl);

    fetch(request)
        .then( (response) => response.json() )
        .then(
            function(data) {
                let newsCount = data.articles.length;
                if(newsCount == 0) {
                    view_hideElement(loadButton);
                    return;
                }     

                let block = model_createNewsBlock(newsCount, data.articles);                
                document.querySelector('#main-newsContent').appendChild(block);

                alreadyNewsDisplayed += newsCount;
                page++;

                if(newsCount < 5 || alreadyNewsDisplayed == 40){
                    view_hideElement(loadButton);
                }
        });
}


function model_createNewsBlock(newsCount, data){
    const place = document.createDocumentFragment();
    const news_item = document.querySelector('#template-news-item');

    for (let i = 0; i < newsCount; i++) {
        let item = 
        (news_item.content) 
        ? news_item.content.cloneNode(true).querySelector('.news-item') 
        : news_item.querySelector('.news-item').cloneNode(true);

        let child = view_createNewsItem(item, data[i]);
        place.appendChild(child);
        
    }
    
    return place;
}