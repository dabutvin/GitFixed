var shas = {};
var lastMessage = "";
var emojis = {};
var emojiPerMessage = [];

$(function() {
	fire();
})

function fire() {
	$.ajax({
		url: '/api/'
	}).done(function(data) {
		if(data.message == 'not ready' || shas[data.sha]) {
			// already captured
			fire();
		} else {

			shas[data.sha] = true;

			var emojiList = [];
			var match = emojiRegex.exec(data.message);
			while (match != null) {
			  emojiList.push(match[0]);
			  match = emojiRegex.exec(data.message);
			}

			emojiPerMessage.push(emojiList.length);

			for(var i=0; i<emojiList.length; i++) {
				var emoji = emojiList[i].toUpperCase();
				emojis[emoji] = (emojis[emoji] || 0) + 1;
			}

			try {

				var downloadingImage = new Image();
				downloadingImage.onload = function() {

					if(lastMessage) {
						var newItem = $('<li>' + lastMessage +'</li>');
						newItem.hide();
						$('.messages').prepend(newItem);
						newItem.fadeIn();
					}

					lastMessage = data.message;

	                $('.picture').attr('src', data.picture);
					$('.handle').text('@' + data.handle);
					$('.message').html(data.message);
					renderWordsMap();

					setTimeout(fire, 1000);
	            };

	            downloadingImage.setAttribute('src', data.picture);
	        } catch (e) {
	        	fire();
	        }
		}
	});
}

function renderWordsMap() {
	var items = Object.keys(emojis).map(function(emoji) {
	    return [emoji, emojis[emoji]];
	});

	items.sort(function(first, second) {
	    return second[1] - first[1];
	});

	var topEmojis = items.slice(0,8);
	
	chartOptions.xAxis.categories = topEmojis.map(function(emoji) {
		return emoji[0];
	});

	if(topEmojis[0])
	{
		chartOptions.yAxis.ceiling = topEmojis[0][1];
	}

	chartOptions.series = [{
		name: 'Count',
		data: topEmojis.map(function (emoji, index) {
			return { y: emoji[1], color: index % 2 ? '#d8e9f5' : '#c5451c'};
		})
	}];
	
	myChart = Highcharts.chart(chartOptions);
}

var emojiRegex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;

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
				fontSize:'25px'
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
    	'#c5451c'
    ]
};