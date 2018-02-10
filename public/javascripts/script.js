var shas = {};
var lastMessage = "";
var words = {};
var wordPerMessage = [];

$(function() {
	fire();
})

function fire() {
	$.ajax({
		url: '/api/'
	}).done(function(data) {
		if(data.message == 'not ready' || shas[data.sha]) {
			// already captured
			setTimeout(fire, 500);
		} else {

			shas[data.sha] = true;

			var wordList = [];
			var match = wordRegex.exec(data.message);
			while (match != null) {
			  wordList.push(match[0]);
			  match = wordRegex.exec(data.message);
			}

			wordPerMessage.push(wordList.length);

			for(var i=0; i<wordList.length; i++) {
				var word = wordList[i].toUpperCase();
				words[word] = (words[word] || 0) + 1;
			}

			try {

				var downloadingImage = new Image();
				downloadingImage.onload = function() {

					if(lastMessage) {
						var newItem = $('<li><a target="__blank" href="' + lastUrl + '">' + lastMessage +'</a></li>');
						newItem.hide();
						$('.messages').prepend(newItem);
						newItem.fadeIn();
					}

					lastMessage = data.message;
					lastUrl = data.url;

	                $('.picture').attr('src', data.picture);
					$('.handle').text('@' + data.handle);
					$('.message').html(data.message);
					renderWordsMap();

					setTimeout(fire, 1000);
	            };

	            downloadingImage.setAttribute('src', data.picture);
	        } catch (e) {
				setTimeout(fire, 500);
	        }
		}
	});
}

function renderWordsMap() {
	var items = Object.keys(words).map(function(word) {
	    return [word, words[word]];
	});

	items.sort(function(first, second) {
	    return second[1] - first[1];
	});

	var topWords = items.slice(0,8);
	
	chartOptions.xAxis.categories = topWords.map(function(word) {
		return word[0];
	});

	if(topWords[0])
	{
		chartOptions.yAxis.ceiling = topWords[0][1];
	}

	chartOptions.series = [{
		name: 'Count',
		data: topWords.map(function (word, index) {
			return { y: word[1], color: index % 2 ? '#d8e9f5' : '#24292e'};
		})
	}];
	
	myChart = Highcharts.chart(chartOptions);
}

var wordRegex = /interval|Interval|map|Map|XSS|xss|demo|Demo|email|Email|test|Test|css|CSS|Css|typo|Typo|known|Known|little|Little|tiny|Tiny|oops|Oops|whoops|Whoops|minor|Minor|logic|Logic|format|Format|merge|Merge|date|Date/g;

var myChart = {};
var chartOptions = {
	legend: {
		enabled: false
	},
	chart: {
		renderTo: 'container',
		type: 'column'
	},
	title: {
		text: ''
	},
	xAxis: {
		categories: [],
		labels: {
			style: {
				fontSize:'15px'
			}
		}
	},
	yAxis: {
		title: ''
	},
	series: [{
        data: []
    }],
	plotOptions: {
        series: {
            animation: {
                duration: 0
            }
        }
    },
    colors: [
    	'#24292e'
    ]
};