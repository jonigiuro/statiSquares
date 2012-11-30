
var H = $(window).height();
$(document).ready(function(){
	$('.step').each(function(){
		if($(this).height() < H - 220){
			$(this).css('height', H - 250)
		}
	});
})


$('.nav-item').click(function(e){
	e.preventDefault();

	var element = $(this).find('.link').attr('href');
	
	$('html, body').animate({
    	scrollTop: $("." + element).offset().top - 220
 	}, 1000);
/*
	if(element == 'what-container'){
		$('.inner-container').animate({
			'margin-top' : 0
		}, 1000);
	}else if(element == 'how-container'){
		$('.inner-container').animate({
			'margin-top' : -140
		}, 1000);
	}else if(element == 'where-container'){
		$('.inner-container').animate({
			'margin-top' : -280
		}, 1000);
	}
	*/
})

$(document).scroll(function(e){
	var delta = 240;
	var whatTop = $('.what-container').position().top - delta;
	var howTop = $('.how-container').position().top - delta;
	var whereTop = $('.where-container').position().top - delta;
	var currentScroll = $(document).scrollTop();
	//console.log(whatTop, howTop, whereTop, currentScroll)
	if(currentScroll < howTop){
		$('.inner-container').css({'margin-top' : 0});
		$('.nav-item').removeClass('active');
		$('.what-nav').addClass('active');
	}else if(currentScroll > whatTop && currentScroll < whereTop){
		$('.inner-container').css({'margin-top' : -140});
		$('.nav-item').removeClass('active');
		$('.how-nav').addClass('active');
	}else if(currentScroll > whereTop){
		$('.inner-container').css({'margin-top' : -280});
		$('.nav-item').removeClass('active');
		$('.where-nav').addClass('active');
	}
	
	
})