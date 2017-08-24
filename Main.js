var express = require('express');
var app = express();
var path = require('path');
var fs = require('fs');
var $ = jQuery = require('jquery');
require('jquery-csv');

// respond with "hello world" when a GET request is made to the homepage
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
  getItemLevels(names, realms);

  var sample = './ilvlData.csv';
fs.readFile(sample, 'UTF-8', function(err, csv) {
  $.csv.toArrays(csv, {}, function(err, data) {
    for(var i=0, len=data.length; i<len; i++) {
      console.log(data[i]);
    }
  });
});

})

app.listen(3000, function () {
  console.log('Server is listening on port 3000')
})


var names = ['tankadinn', 'kaol', 'brightsidesh'];
var realms = ['darkspear', 'darkspear', 'darkspear'];
var ilvls = [0, 0, 0];
















app.get('/getinfo', function(req, res){
	console.log('getinfo');
})


function getItemLevels(names, realms){
	for(i = 0; i < names.length; i++){
		characterRequest(names[i], realms[i])
		};
	}


function characterRequest(charName, charRealm){
	const blizzard = require('blizzard.js').initialize({ apikey: 'ce8c5e2zj8t8q2ebjck9y73usfp2zpt9'});

	blizzard.wow.character(['items'], { origin: 'us', realm: charRealm, name: charName })
  		.then(response => {
    	//console.log(charName + ': ' + response.data.items.averageItemLevelEquipped);
    	callback(response.data.items.averageItemLevelEquipped);
  });
}

/*const blizzard = require('blizzard.js').initialize({ apikey: 'ce8c5e2zj8t8q2ebjck9y73usfp2zpt9'});

blizzard.wow.character(['items'], { origin: 'us', realm: 'darkspear', name: 'tankadinn' })
  .then(response => {
    console.log(response.data.items.averageItemLevelEquipped);
  });*/