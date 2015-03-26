function renderStatus(statusText) {
	document.getElementById('status').textContent = statusText;
}

function startSearch(e) {
	var token = document.getElementById('token').value;
	if (token == '') {
		renderStatus('token is required!');
		return;
	}

	var searchStr = document.getElementById('searchstr').value;
	if (searchStr == '') {
		renderStatus('text to search is required!');
		return;
	}

	renderStatus('searching: ' + searchStr);

	chrome.tabs.create( { url: "postgrep.html" }, function(tab) {
		chrome.tabs.sendMessage(tab.id, { token: token, searchStr: searchStr, searchNow: true });
	});
}

document.addEventListener('DOMContentLoaded', function() {
	document.getElementById('searchbtn').addEventListener('click', startSearch);
	
	var queryInfo = {
		title: 'Graph API Explorer'
	};
	chrome.tabs.query(queryInfo, function(tabs) {
		if (tabs && tabs.length > 0) {
			var tab = tabs[0];
			chrome.tabs.executeScript(tab.id,
				{ code: 'document.getElementById("access_token").value;' },
				function(results) {
					if (results)
						document.getElementById('token').value = results[0];
					else
						renderStatus('access token is not found.');
				}
			);
		}
	});
});
