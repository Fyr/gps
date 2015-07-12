function withoutscroll (pixedPoint, minHeight, index) {
	
	if ( $(window).height() < pixedPoint ) {
		$('.mapContainer').height(minHeight);
	}
	else {
		$('.mapContainer').height( $(window).height() - 80 - 70 - index );
	}	
}

function reviewScroll  () {
	
	height1 = $(window).height() - 557;
	height2 = $(window).height() - 327;
	
	console.log(height1);
		
	if ( $(window).height() > 558 ) {
		$('.newsBlock .description').height( height2 ); 
	}
	else {
		$('.newsBlock .description').height(240); 
	}
		
	if ( height1 > 0) {
		$('.yellowBlocks').css("margin-bottom",height1+"px");
	}
	else {
		$('.yellowBlocks').css("margin-bottom",10+"px");
	}
}