/*
var $ = require("jquery");

$.ajax({
	url: 'https://us.api.battle.net/wow/character/darkspear/tankadinn?fields=items&locale=en_US&apikey=ce8c5e2zj8t8q2ebjck9y73usfp2zpt9',
	method: "GET"
}).done(function(response){
	console.log(response);
});

*/
const blizzard = require('blizzard.js').initialize({ apikey: 'ce8c5e2zj8t8q2ebjck9y73usfp2zpt9'});

blizzard.wow.character(['items'], { origin: 'us', realm: 'darkspear', name: 'tankadinn' })
  .then(response => {
    console.log(response.data.items.averageItemLevelEquipped);
  });