var express = require('express');
var app = express();
var path = require('path');
var fs = require('fs');
var $ = jQuery = require('jquery');
require('jquery-csv');

// respond with inde.html when page is loaded
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
})

app.listen(3000, function () {
  console.log('Server is listening on port 3000')
})


var names = ['tankadinn', 'kaol', 'brightsidesh'];
var realms = ['darkspear', 'darkspear', 'darkspear'];
var ilvls = [0, 0, 0];

//called when document is ready
app.get('/pullTable', function(req, res){
	//pulls up each entry in our csv file and stores it in an array
	var csvFilePath = './ilvlData.csv';
	fs.readFile(csvFilePath, 'UTF-8', function(err, csv) {
		$.csv.toArrays(csv, {}, function(err, data) {
			//each line in data[] is an entry
			var entries = data.length;
			var finalJSON = [];
			for(i = 0; i < entries; i++){
				var element = data[i].toString().split(',');
				var tempJSON = [{name: element[0], realm: element[1], ilvl: element[2]}];
				finalJSON = finalJSON.concat(tempJSON);
			}
			res.json(finalJSON);

			//var element = data[0].toString().split(',');
			//res.json({name: element[0], realm: element[1], ilvl: element[2]});
    	});
  	});
})

app.get('/update', function(req, res){
	console.log('update');
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
    	console.log('reponse: ' + charName + ': ' + response.data.items.averageItemLevelEquipped);
  });
}

/*const blizzard = require('blizzard.js').initialize({ apikey: 'ce8c5e2zj8t8q2ebjck9y73usfp2zpt9'});

blizzard.wow.character(['items'], { origin: 'us', realm: 'darkspear', name: 'tankadinn' })
  .then(response => {
    console.log(response.data.items.averageItemLevelEquipped);
  });*/