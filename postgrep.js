
function renderStatus(statusText) {
  document.getElementById('status').textContent = statusText;
}

// url 요청 결과를 json으로 파싱
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

function search(url) {

	// url이 비었으면 페이지에서 읽어서 url 구성
	if (!url || url == '')  {
		var token = document.getElementById('token').value;
		if (token == '') {
			renderStatus('token is required!');
			return;
		}
		url = 'https://graph.facebook.com/me?fields=posts.limit(50)&access_token=' + token;
	}

	// searchStr
	var searchStr = document.getElementById('searchstr').value;
	if (searchStr == '') {
		renderStatus('text to search is required!');
		return;
	}

	renderStatus('searching: ' + searchStr);

	// url 요청
	getJSONResults(url, function(j) {
		obj = j;
		var re = new RegExp(searchStr, "i");
		var out = "";
		// "{ data: [...] }" 형태일 수도 있고, "{ posts { data: [...] } }" 형태일 수도 있다.
		var data = j.data;
		if (!data)
			data = j.posts.data;

		// "data: [...]"
		for (var i = 0; i < data.length; i++) {
			if (!data[i] || !data[i].message || !data[i].message.search)
				continue;
			if (data[i].message.search(re) > 0) {
				// searchStr이 있는 포스트 발견
				// id는 "userid_messageid" 형태
				var pos = data[i].id.indexOf('_');
				// 해당 포스트의 링크를 포함해서 포스트 메시지를 출력
				out += '<p><a href="http://facebook.com/' + data[i].id.substring(0,pos) + '/posts/' + data[i].id.substring(pos+1) + '" target="_blank">[' + data[i].type + '] ' + data[i].created_time + '</a><br>';
				out += data[i].message.replace(re, '<b style="color:red;background-color:yellow">' + searchStr + '</b>') + '</p>\n';
			}
	}
	if (out == "")
		out = "No results...<p\n>";
	out += '<p>\n';

	// "{ paging: {...} }" 형태일 수도 있고, "{ posts { paging: {...} } }" 형태일 수도 있다.
	var paging = j.paging;
	if (!paging)
		paging = j.posts.paging;
	
	// 이전 페이지 검색 버튼
	if (paging.previous) {
		out += '<button id="prev">previous</button> ';
	}
	// 다음 페이지 검색 버튼
	if (paging.next) {
		out += '<button id="next">next</button>';
	}

	// 완성된 HTML 코드 삽입
    document.getElementById('results').innerHTML = out;
	
	// 이전 페이지, 다음 페이지 버튼에 클릭 이벤트 연결
	document.getElementById('prev').addEventListener('click', function(e) {
		search(paging.previous.replace('%amp;','&'));
	});
	document.getElementById('next').addEventListener('click', function(e) {
		search(paging.next.replace('%amp;','&'));
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
	// 검색 버튼 클릭 이벤트
	document.getElementById('searchbtn').addEventListener('click', startSearch);
});

// 익스텐션에서 메시지를 받았을 때
chrome.runtime.onMessage.addListener(function(msg, _, sendResponse) {
	// 메시지에 토큰과 검색 문자열이 존재하면 페이지에 바로 세팅
	if (msg.token)
		document.getElementById('token').value = msg.token;
	if (msg.searchStr)
		document.getElementById('searchstr').value = msg.searchStr;
	// 검색 실행
	if (msg.searchNow)
		search();
});
