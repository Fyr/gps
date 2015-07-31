function withoutscroll (pixedPoint, minHeight, index) {
	
	if ( $(window).height() < pixedPoint ) {
		$('.mapContainer').height(minHeight);
	}
	else {
		$('.mapContainer').height( $(window).height() - 80 - 70 - index );
	}	
}

function reviewScroll  () {
	$('.newsBlock .description').height( $('.yellowBlocks .item').height() + $('.obzor .rightSide').height() - 44 - 10 ); 
}