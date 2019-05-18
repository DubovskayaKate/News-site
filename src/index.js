
import './style.css'
import './images/img1.jpg'

let  lastUsedUrl = '';
let page = 0;
let alreadyNewsDisplayed = 0;
const loadButton = '#main-load-bn';
const errorLabel = '#main-errorLabel';
const promosionImg = '#main-img';

let view = {
    hideElement:  (element) => {
        document.querySelector(element).style.display = 'none';
    },

    showElement : (element) => {
        document.querySelector(element).style.display = 'unset';
    },


    createSourceItem : (id, name) => {
        document.querySelector('#main-sources').innerHTML += `<div class"btn__sources"><button id="${id}">${name}</button></div> `; 
    },

    createNewsItem : (html, data) => {
        html.querySelector('.news-item__content__img').style.backgroundImage = `url(${data.urlToImage ? data.urlToImage : './src/images/img1.jpg'})`;
        html.querySelector('.news-item__content__title').textContent = data.title;
        html.querySelector('.news-item__content__source').textContent = data.source.name;
        html.querySelector('.news-item__content__text').textContent = data.description;
        html.querySelector('.news-item__content__link').setAttribute('href', data.url);
        return html;
    }
}

let controller =  {

    loadSources : () => {
        const url = 'https://newsapi.org/v2/sources?apiKey=f8e8d035014546dd9789f8527d1fe4d3&category=technology&country=us';
        const request = new Request(url);
        fetch(request)
            .then( (response) => response.json())
            .then(
                (data) => {
                    for (let i = 0; i < data.sources.length; i++) {
                        view.createSourceItem(data.sources[i].id, data.sources[i].name);
                    }
            });
    },

    loadNewsByUrl : (urlPart) => {
        view.hideElement(loadButton);
        view.hideElement(promosionImg);
        view.hideElement(errorLabel);
        const url = `https://newsapi.org/v2/${urlPart}apiKey=f8e8d035014546dd9789f8527d1fe4d3`;
        const request = new Request(url);
        fetch(request)
            .then( (response) => response.json())
            .then((data) => {  
                const newsBlock = document.querySelector('#main-newsContent');
                newsBlock.innerHTML = '';
                let newsCount = data.articles.length;
                if(newsCount == 0){
                    view.showElement(errorLabel);
                    view.showElement(promosionImg);
                    view.hideElement(loadButton);
                    return;
                }      
                let block = model.createNewsBlock(newsCount, data.articles);
                newsBlock.appendChild(block);
                if(newsCount < 5)
                    view.hideElement(loadButton);
                else
                    view.showElement(loadButton);

                lastUsedUrl = url;
                page = 2;
                alreadyNewsDisplayed = newsCount;
            });
    },

    appendNews: () => {
        lastUsedUrl = lastUsedUrl.replace(new RegExp('page=.*&'), `page=${page}&`);
        const request = new Request(lastUsedUrl);

        fetch(request)
            .then( (response) => response.json() )
            .then(
                (data) => {
                    let newsCount = data.articles.length;
                    if(newsCount == 0) {
                        view.hideElement(loadButton);
                        return;
                    }     

                    let block = model.createNewsBlock(newsCount, data.articles);                
                    document.querySelector('#main-newsContent').appendChild(block);

                    alreadyNewsDisplayed += newsCount;
                    page++;

                    if(newsCount < 5 || alreadyNewsDisplayed == 40){
                        view.hideElement(loadButton);
                    }
            });
    }
}

let model = {
    createNewsBlock : (newsCount, data) =>{
        const place = document.createDocumentFragment();
        const news_item = document.querySelector('#template-news-item');

        for (let i = 0; i < newsCount; i++) {
            let item = 
            (news_item.content) 
            ? news_item.content.cloneNode(true).querySelector('.news-item') 
            : news_item.querySelector('.news-item').cloneNode(true);

            let child = view.createNewsItem(item, data[i]);
            place.appendChild(child);
            
        }        
        return place;
    }
}

controller.loadSources();

document.querySelector(loadButton).addEventListener('click', () => {
    controller.appendNews();
  });

document.querySelector('#main-sources').addEventListener('click', (event) =>{
    controller.loadNewsByUrl(`everything?sources=${event.target.id}&pageSize=5&page=1&`);
});

document.querySelector('#main-search-bn').addEventListener('click', 
    () => {
        if(document.querySelector('#main-search-input').value.length > 0){
            controller.loadNewsByUrl(`everything?q=${document.querySelector('#main-search-input').value}&pageSize=5&page=1&`);
    }
});

document.querySelector('#main-search-input').addEventListener('keyup', 
    (event) => { 
        event.preventDefault();
        if (event.keyCode === 13) {
            document.querySelector('#main-search-bn').click();
    }
});

