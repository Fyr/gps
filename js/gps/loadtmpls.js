function loadTmpls(aModules, successFn) {
	var modules = 0;
	for(var i = 0; i < aModules.length; i++) {
		$.get('./tmpl/' + aModules[i] + '.html', null, function(html){
			$('#tpl').append(html);
			modules++;
			if (modules >= aModules.length) {
				for(i = 0; i < aModules.length; i++) {
					var module = aModules[i];
					if ($('.tmpl-' + module).length) {
						$('.tmpl-' + module).html(tmpl(module, {}));
					}
				}
				if (successFn) {
					successFn();
				}
			}
		}, 'html');
	}
}