function createNode(element) {
      return document.createElement(element);
  }

  function append(parent, el) {
    return parent.appendChild(el);
  }

  const ul = document.getElementById('currs');
  const url = 'https://free.currencyconverterapi.com/api/v5/currencies';
  fetch(url)
  .then((resp) => resp.json())
  .then(function(data) {
    let authors = data.results;
    return authors.map(function(author) {
      let option = createNode('option');
//           img = createNode('img'),
//           span = createNode('span');
//       img.src = author.picture.medium;
      option.innerHTML = `${author.name.first} ${author.name.last}`;
//       append(li, img);
//       append(li, span);
      append(ul, option);
    })
  })
  .catch(function(error) {
    console.log(JSON.stringify(error));
  });   
