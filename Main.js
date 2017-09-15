var express = require('express');
var app = express();
var path = require('path');
var fs = require('fs');
var $ = jQuery = require('jquery');
require('jquery-csv');
var async=require("async");
var bodyParser = require('body-parser');
var AWS = require('aws-sdk');

//global variables
var port = process.env.PORT || 3000;
var csvFilePath = './ilvlData.csv';

app.use(express.static(__dirname+"/"));


//allows for "app" to get the body from an incoming message
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));

// respond with index.html when page is loaded
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
})

//allows the server to listen over a port
app.listen(port, function () {
  console.log('Server is listening on port ' + port);
})

//called when document is ready
//will send the client a json which consist of all of the entries in the 'database'
app.get('/pullTable', function(req, res){
	var s3 = new AWS.S3();
	s3.getObject(
	  { Bucket: "cgilvlbucket", Key: "ilvlData.csv" },
	  function (error, data) {
	    if (error != null) {
	      console.log('error');
	    } else {
	      console.log('worked');
	      // do something with data.Body
	      console.log(data.Body.toString('utf-8'));
	    }
	  }
	);
	/*
	//pulls up each entry in our csv file and stores it in an array
	fs.readFile(csvFilePath, 'UTF-8', function(err, csv) {
		$.csv.toArrays(csv, {}, function(err, data) {
			//each line in data[] is an entry
			var finalJSON = [];
			//converts each entry in data[] into a json object and concats it with 'finalJSON' which will be sent to client
			for(i = 0; i < data.length; i++){
				var element = data[i].toString().split(',');
				var tempJSON = [{name: element[0], ilvl: element[2], class: element[3]}];
				finalJSON = finalJSON.concat(tempJSON);
			}
			//sends the final json to the client
			res.json(finalJSON);
    	});
  	});
  	*/
})

//called when the user clicks the update button
//this will query each character in the database from blizards site and update the database.
app.get('/update', function(req, res){
	//pulls up each entry in our csv file and stores it in an array
	fs.readFile(csvFilePath, 'UTF-8', function(err, csv) {
		$.csv.toArrays(csv, {}, function(err, data) {
			//each line in data[] is an entry
			async.forEachOf(data, function(elem, key, callback){
				var element = elem.toString().split(',');
				//gets the character and returns the ilvl
				characterRequest(element[0], element[1], function(charData){
					//sets the item level back in data
					data[key][2] = charData.ilvl;
					data[key][3] = charData.class;
					//lets the async know it has finished
					callback();
				});				
			}, function(err){
				//sorts the data by ilvl
				for(i = 0; i < data.length; i++){
					for(j = 0; j < data.length-1; j++){
						if(data[j][2] < data[j+1][2]){
							var temp = data[j];
							data[j] = data[j+1];
							data[j+1] = temp;
						}
					}
				}
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

//adds a new character to the file
//takes in a name and a realm of the character to add
app.post('/newCharacter', function (req, res) {
  var name = req.body.name;
  var realm = req.body.realm;
  //pulls up each entry in our csv file and stores it in an array
	fs.readFile(csvFilePath, 'UTF-8', function(err, csv) {
		$.csv.toArrays(csv, {}, function(err, data) {
			//each line in data[] is an entry
			var newEntry = [name, realm, '0', '0'];
			data.push(newEntry);
			//writes the new data set to the csv file
			$.csv.fromArrays(data, {}, function(err, newData){
						fs.writeFile('./ilvlData.csv', newData, function(){});
					});
				//sends a message to the client that it has been updated
				res.send('added: '+ name + '-' + realm);
		});
	});
})

//removes a character from the file
//takes in the characters name
app.post('/removeCharacter', function (req, res){
	var name = req.body.name;
	//pulls up each entry in our csv file and stores it in an array
	fs.readFile(csvFilePath, 'UTF-8', function(err, csv) {
		$.csv.toArrays(csv, {}, function(err, data) {
			//each line in data[] is an entry
			//this loop goes through each data set and if it finds the character it will remove it
			for(i = 0; i < data.length; i++){
				if(data[i][0] == name){
					data.splice(i, 1);
					//writes the new data set to the csv file
					$.csv.fromArrays(data, {}, function(err, newData){
						fs.writeFile('./ilvlData.csv', newData, function(){});
					});
					//sends a message to the client that it has been updated
					res.send('removed: '+ name);
				}
			}
			
		});
	});
})




//takes in a character name and realm and makes the api call to Blizzard.  Then returns the Item Level from the JSON it receives.
var characterRequest = function(charName, charRealm, callback){
	const blizzard = require('blizzard.js').initialize({ apikey: 'ce8c5e2zj8t8q2ebjck9y73usfp2zpt9'});

	blizzard.wow.character(['items'], { origin: 'us', realm: charRealm, name: charName })
  		.then(response => {
    	//returns the Item Level
    	callback({ilvl: response.data.items.averageItemLevel, class: response.data.class});
    	
  });
}
