function searchToken(postSearch) {
	var queryInfo = {
		url: '*://developers.facebook.com/tools/explorer*'
	};
	chrome.tabs.query(queryInfo, function(tabs) {
		if (tabs && tabs.length > 0) {
			var tab = tabs[0];
			chrome.tabs.executeScript(tab.id,
				{ code: 'document.getElementsByTagName("input")[2].value;' },
				function(results) {
					if (results) {
						if (postSearch)
							postSearch(results[0]);
					} else {
						if (postSearch)
							postSearch(null);
					}				
				}
			);
		} else {
			if (postSearch)
				postSearch(null);
		}
	});
}

function checkToken(e) {
	searchToken(function(token) {
		if (token && token != '')
			document.getElementById('token').value = token;
		else
			chrome.tabs.create( { url: "https://developers.facebook.com/tools/explorer" }, function(tab) {
			});
	});
}
