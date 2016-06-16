function renderStatus(statusText) {
	document.getElementById('status').textContent = statusText;
}

// url ��û ������ json���� �Ľ�
function getJSONResults(url, callback, errorCallback) {
	var x = new XMLHttpRequest();
	x.open('GET', url);
	x.onload = function() {
		var j = JSON.parse(x.responseText);
		if (!j) {
			errorCallback('Invalid response from Facebook!');
			return;
		}
		if (x.status != 200) {
			errorCallback(j.error.message);
			return;
		}
		callback(j);
	};
	x.onerror = function() {
		errorCallback(url);
	};
	x.send();
}

var obj;

function search(url, page) {
	if (!page || page < 1)
		page = 1;

	// url�� �������� ���������� �о url ����
	if (!url || url == '')  {
		var token = document.getElementById('token').value;
		if (token == '') {
			renderStatus('token is required!');
			return;
		}
		url = 'https://graph.facebook.com/v2.0/me?fields=posts.limit(50)&access_token=' + token;
	}

	// searchStr
	var searchStr = document.getElementById('searchstr').value;
	if (searchStr == '') {
		renderStatus('text to search is required!');
		return;
	}

	renderStatus('searching recent ' + ((page - 1) * 50 + 1) + ' to ' + (page * 50) + ' posts: ' + searchStr);

	// url ��û
	getJSONResults(url, function(j) {
		obj = j;
		var re = new RegExp(searchStr, "i");
		var out = "";
		// "{ data: [...] }" ������ ���� �ְ�, "{ posts { data: [...] } }" ������ ���� �ִ�.
		var data = j.data;
		if (!data)
			data = j.posts.data;

		// "data: [...]"
		for (var i = 0; i < data.length; i++) {
			if (!data[i] || !data[i].message || !data[i].message.search)
				continue;
			if (data[i].message.search(re) > 0) {
				// searchStr�� �ִ� ����Ʈ �߰�
				// id�� "userid_messageid" ����
				var pos = data[i].id.indexOf('_');
				// �ش� ����Ʈ�� ��ũ�� �����ؼ� ����Ʈ �޽����� ����
				out += '<p style="font-size:0.7em;"><a href="http://facebook.com/' + data[i].id.substring(0,pos) + '/posts/' + data[i].id.substring(pos+1) + '" target="_blank">[' + data[i].type + '] ' + data[i].created_time + '</a><br>';
				sliced = data[i].message.slice(0,200);
				out += sliced.replace(re, '<b style="color:red;background-color:yellow">' + searchStr + '</b>') + '</p>\n';
			}
	}
	if (out == "")
		out = "No results...<p\n>";
	out += '<p>\n';

	// "{ paging: {...} }" ������ ���� �ְ�, "{ posts { paging: {...} } }" ������ ���� �ִ�.
	var paging = j.paging;
	if (!paging)
		paging = j.posts.paging;

	// ���� ������ �˻� ��ư
	if (page > 1 && paging.previous) {
		out += '<button id="prev">previous</button> ';
	}
	// ���� ������ �˻� ��ư
	if (paging.next) {
		out += '<button id="next">next</button>';
	}

	// �ϼ��� HTML �ڵ� ����
    document.getElementById('results').innerHTML = out;

	// ���� ������, ���� ������ ��ư�� Ŭ�� �̺�Ʈ ����
	if (page > 1)
		document.getElementById('prev').addEventListener('click', function(e) {
			search(paging.previous.replace('%amp;','&'), page - 1);
		});
	document.getElementById('next').addEventListener('click', function(e) {
		search(paging.next.replace('%amp;','&'), page + 1);
	});
  },
  function(errorMessage) {
      renderStatus('Cannot search Facebook. ' + errorMessage);
  });
}

function startSearch(e) {
	search();
}

document.addEventListener('DOMContentLoaded', function() {
	document.getElementById('searchbtn').addEventListener('click', startSearch);
	document.getElementById('tokenbtn').addEventListener('click', checkToken);
	searchToken(function(token) {
		if (token)
			document.getElementById('token').value = token;
	});
});
