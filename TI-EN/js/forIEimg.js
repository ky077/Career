function DetectIsIE() {
	var ua = window.navigator.userAgent;

	var msie = ua.indexOf('MSIE ');
	if (msie > 0) {
		// 回傳版本 <=10 的版本
		return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
	}

	var trident = ua.indexOf('Trident/');
	if (trident > 0) {
		// 回傳版本 >=11 的版本
		var rv = ua.indexOf('rv:');
		return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
	}

	var edge = ua.indexOf('Edge/');
	if (edge > 0) {
		// 判斷Edge
		return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
	}

	// other browser
	return false;
}


	var q = DetectIsIE();

	if (q != false) {// 是IE
		var $imgW = $('.img-forIE').width();
		//alert($imgW+' & '+ $(window).width());
		$(window).on('resize',function() {
			if( $imgW >= $(window).width() ){
				$('.img-forIE').addClass('forIE');
			}else{
				$('.img-forIE').removeClass('forIE');
			}
		});
		$(document).ready(function() {
			$(window).trigger('resize');
		});
	} else {//不是IE
		$('.img-forIE').removeClass('forIE');
    }
