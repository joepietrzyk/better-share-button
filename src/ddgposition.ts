document.body.style.border = "5x solid red";

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

if (urlParams.has('q')) {
    const searchQuery = urlParams.get('q');
    
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (this.responseXML) {
            let results = Array.from(this.responseXML.getElementsByClassName('result'))
                .map(result => result.getElementsByClassName('result__a')[0].getAttribute('href'));
            results = results.filter(results => results!.startsWith('https://duckduckgo.com/y.js'));
            applyResults(results);
        }
        
    };
    
    xhr.onerror = function () {
        console.log('An error occurred');
    };
    
    xhr.open('GET', 'https://duckduckgo.com/html/?q=' + searchQuery, true);
    xhr.responseType = 'document';
    xhr.send();
}

/**
 * Applies the result of the DuckDuckGo query
 * @param results the results of the DuckDuckGo request
 */
function applyResults(results: (string | null)[]) {
    console.log(results);
    
    const googleResults = Array.from(document.getElementsByClassName('r'))
        .map(results => results.getElementsByTagName('a')[0]);
    
    for (const gResult of googleResults) {
        let url = gResult.getAttribute('href');
        if (url && url.startsWith(window.location.origin + '/url')) {
            const urlParams = new URLSearchParams(url);
            if (urlParams.has('url')) {
                url = urlParams.get('url');
            }
        }
        
        const ddgPosition = results.findIndex((element) => element === url);
        
        if (ddgPosition >= 0) {
            gResult.insertAdjacentHTML('beforeend', '<div style="background-color: #de5833; ' +
                'position: absolute; top:0; right: 0"><p style="font-size: 15px; color: white; margin: 0;' +
                ' padding: 2px 9px 2px 9px;">' + (ddgPosition + 1) + '</p></div>');
        }
    }
}
