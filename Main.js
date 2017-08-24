var express = require('express');
var app = express();
var path = require('path');
var fs = require('fs');
var $ = jQuery = require('jquery');
require('jquery-csv');
var async=require("async");

// respond with index.html when page is loaded
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

//called when the user clicks the update button
//this will query each character in the database from blizards site and update the database.
app.get('/update', function(req, res){
	//pulls up each entry in our csv file and stores it in an array
	var csvFilePath = './ilvlData.csv';
	fs.readFile(csvFilePath, 'UTF-8', function(err, csv) {
		$.csv.toArrays(csv, {}, function(err, data) {
			//each line in data[] is an entry
			async.forEachOf(data, function(elem, key, callback){
				var element = elem.toString().split(',');
				//gets the character and returns the ilvl
				characterRequest(element[0], element[1], function(ilvl){
					//sets the item level back in data
					data[key][2] = ilvl;
					//lets the async know it has finished
					callback();
				});				
			}, function(err){
				//writes the new data set to the csv file
				$.csv.fromArrays(data, {}, function(err, newData){
						fs.writeFile('./ilvlData.csv', newData, function(){});
					});
				//sends a message to the client that it has been updated
				res.send('updated');
			});
    	});
  	});
})

//takes in a character name and realm and makes the api call to Blizzard.  Then returns the Item Level from the JSON it receives.
var characterRequest = function(charName, charRealm, callback){
	const blizzard = require('blizzard.js').initialize({ apikey: 'ce8c5e2zj8t8q2ebjck9y73usfp2zpt9'});

	blizzard.wow.character(['items'], { origin: 'us', realm: charRealm, name: charName })
  		.then(response => {
    	//returns the Item Level
    	callback(response.data.items.averageItemLevel);
    	
  });
}
