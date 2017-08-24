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

//allows the server to listen over a port
app.listen(3000, function () {
  console.log('Server is listening on port 3000')
})

//called when document is ready
//will send the client a json which consist of all of the entries in the 'database'
app.get('/pullTable', function(req, res){
	//pulls up each entry in our csv file and stores it in an array
	var csvFilePath = './ilvlData.csv';
	fs.readFile(csvFilePath, 'UTF-8', function(err, csv) {
		$.csv.toArrays(csv, {}, function(err, data) {
			//each line in data[] is an entry
			var finalJSON = [];
			//converts each entry in data[] into a json object and concats it with 'finalJSON' which will be sent to client
			for(i = 0; i < data.length; i++){
				var element = data[i].toString().split(',');
				var tempJSON = [{name: element[0], realm: element[1], ilvl: element[2]}];
				finalJSON = finalJSON.concat(tempJSON);
			}
			//sends the final json to the client
			res.json(finalJSON);
    	});
  	});
})



var names = ['tankadinn', 'kaol', 'brightsidesh'];
var realms = ['darkspear', 'darkspear', 'darkspear'];
var ilvls = [0, 0, 0];


//called when the user clicks the update button
//this will query each character in the database from blizards site and update the database.
app.get('/update', function(req, res){
	//pulls up each entry in our csv file and stores it in an array
	var csvFilePath = './ilvlData.csv';
	fs.readFile(csvFilePath, 'UTF-8', function(err, csv) {
		$.csv.toArrays(csv, {}, function(err, data) {
			//each line in data[] is an entry
			var entries = data.length;
			var completed = 0;
			for(i = 0; i < entries; i++){
				var element = data[i].toString().split(',');
				characterRequest(element[0], element[1]).then(response => {
					completed++;
				});
			}
			while(completed < entries){
				
			}
			res.send('updated');
    	});
  	});




	
})


function getItemLevels(names, realms){
	for(i = 0; i < names.length; i++){
		characterRequest(names[i], realms[i])
		};
	}


var characterRequest = function(charName, charRealm){
	const blizzard = require('blizzard.js').initialize({ apikey: 'ce8c5e2zj8t8q2ebjck9y73usfp2zpt9'});

	blizzard.wow.character(['items'], { origin: 'us', realm: charRealm, name: charName })
  		.then(response => {
    	//console.log(charName + ': ' + response.data.items.averageItemLevelEquipped);
    	//console.log('reponse: ' + charName + ': ' + response.data.items.averageItemLevelEquipped);
    	return 10;
    	
  });
}

/*const blizzard = require('blizzard.js').initialize({ apikey: 'ce8c5e2zj8t8q2ebjck9y73usfp2zpt9'});

blizzard.wow.character(['items'], { origin: 'us', realm: 'darkspear', name: 'tankadinn' })
  .then(response => {
    console.log(response.data.items.averageItemLevelEquipped);
  });*/