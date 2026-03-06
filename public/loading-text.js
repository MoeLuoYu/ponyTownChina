(function() {
	var texts = ['正在连接小马利亚...', '正在进入坎特洛特...', '正在乘坐火车前往小马谷...'];
	var index = 0;
	var el = document.getElementById('loading-text');
	if (el) {
		setInterval(function() {
			index++;
			if (index < texts.length) {
				el.textContent = texts[index];
			}
		}, 1000);
	}
})();
