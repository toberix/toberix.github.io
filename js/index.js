(function () {
    'use strict';
    
    var view_connector = {
        container: document.querySelector('section')
    };

    window.onload = ()=> {
        view_connector.currenciesRetrival();
    };


    document.getElementById('convert').addEventListener('click', function () {
        view_connector.currencyConversion();
        view_connector.accessDatabase();
    });



    view_connector.currencyConversion = () => {
        const fromCurrency = document.getElementById('currencyFrom').value.substr(0, 3);
        const toCurrency = document.getElementById('currencyTo').value.substr(0, 3);
        let amt = document.getElementById('amount').value;
        const query = fromCurrency + '_' + toCurrency;
        const url = 'https://free.currencyconverterapi.com/api/v5/convert?q=' + query;
        console.log(url);
        var index;
        fetch(url)
            .then(function (response) {
                let results = response.json();
                return results;
            })
            .then(function (json) {
                console.log('parsed json', json);
                console.log(query);
                let val = json.results[query].val;
                console.log(val);
                index = db.transaction('currencies', 'readwrite').objectStore('currencies');
                index.put({
                    id: query,
                    rate: val
                });
                index.onsuccess = () => {
                    console.log('[Transaction] ALL DONE!');
                };
                if (val) {
                    let total = val * amt;
                    document.getElementById('outputAmt').value = Math.round(total * 100) / 100;
                }
            })
            .catch(function (ex) {
                index = db.transaction('currencies').objectStore('currencies').index('rate');
                console.log(index.getAll(query));
                console.log(index.getAll(query).id);
            });
    };


view_connector.populateCountries = (json) =>{
        let list_of_countries = [];
        for (let item in json.results) {
            let currencyName = json.results[item].currencyName;
            list_of_countries.push(`${item} (${currencyName})`);
        }
        var selectfrom = document.getElementById('currencyFrom');
        for (let value in list_of_countries.sort()) {
            selectfrom.options[selectfrom.options.length] = new Option(list_of_countries[value], list_of_countries[value]);
        }
        var select = document.getElementById('currencyTo');
        for (let value in list_of_countries.sort()) {
            select.options[select.options.length] = new Option(list_of_countries[value], list_of_countries[value]);
        }
    };


    var db;
    view_connector.accessDatabase = () => {
        if (!navigator.serviceWorker) { 
            return Promise.resolve();
        } //This point I chech if the browser support service worker, if not he should resolve the promise
        var request = self.indexedDB.open('currency', 1);
        request.onsuccess = function (event) {
            db = event.target.result; 
        };
        request.onupgradeneeded = (event) => {
            db = event.target.result;
            var store = db.createObjectStore('currencies', {keyPath: 'id'});
            store.createIndex('rate', 'id', {unique: true});
        };
    };


// data are cached to the browser to reduce network usage
    view_connector.currenciesRetrival = () => {
        var url = 'https://free.currencyconverterapi.com/api/v5/currencies';
        if ('caches' in window) {
            console.log('your data is loaded from caches');
            caches.match(url).then(function (response) {
                if (response) {
                    response.json().then(function updateFromCache(json) {
                        view_connector.populateCountries(json);
                    });
                }
            });
        }
        
        fetch(url).then(function (response) {
                let results = response.json();
                return results;
            })
            .then(function (json) {
                view_connector.populateCountries(json);
            })
            .catch(function (ex) {
                console.log('could not parsed the data', ex);
            });
    };


     if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('js/serviceworker.js').then(function () {
            console.log('Service Worker Registered');
            if (!navigator.serviceWorker.controller) {
                return;
            }
        });
    }

    
})();
