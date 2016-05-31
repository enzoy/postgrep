function startSearch(e) {
	chrome.tabs.create( { url: "postgrep.html" } );
}

document.addEventListener('DOMContentLoaded', function() {
	document.getElementById('searchbtn').addEventListener('click', startSearch);
	document.getElementById('tokenbtn').addEventListener('click', checkToken);
	searchToken(function(token) {
		if (token)
			document.getElementById('token').value = token;
	});
});
