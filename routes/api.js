var express = require('express');
var request = require('request');
var router = express.Router();
var itemsCache = {};

router.get('/', function(req, res, next) {

	var item = itemsCache[Object.keys(itemsCache)[0]];
	delete itemsCache[item.sha];

	if(item && item.author && item.commit) {
	    res.send(
	    {
	    	sha: item.sha,
	    	message: item.commit.message,
	    	picture: item.author.avatar_url,
	    	handle: item.author.login
	    });
	} else {
		res.send(
		{
			"message": "not ready"
		});
	}
});

var page = 1;
fetchItems(page);
setInterval(function() {
	page++;
	fetchItems(page);
}, 10000);

setInterval(function() { page = 0; }, 10 * 60 * 1000);

function fetchItems(page) {
	request(
		{
			url: "https://api.github.com/search/commits?q=fixed&sort=committer-date&per_page=100&page=" + page,
			headers:
			{
				"Accept" : "application/vnd.github.cloak-preview+json",
				"User-Agent": "Githorld"
			}
		}, function(error, response, body) {
        if(error) {
            console.log("Error: " + error);
        } else {
        	try {
    			var result = JSON.parse(body);

    			if(result && result.items) {
		            
		            for(var i =0; i < result.items.length; i++) {
		            	itemsCache[result.items[i].sha] = result.items[i];
				    }
				}
	        } catch (ex) {
	        	console.log(ex + 'body: ' + body);
	        }
        }
    });
}

module.exports = router;
