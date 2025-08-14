(function ($) { 
    "use strict";
	
	//load header
	$('header').load('master-header.html', function () {
		logState();
	});

	//load header
	$('footer').load('master-footer.html');  
	
	//load user
	$('.user-data').load('master-user.html'); 
	
	logState();

    //Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 100);
    };
    spinner();
    
    //Initiate the wowjs
    new WOW().init();

    //Sticky Navbar
    $(window).scroll(function () { 
		var scrollTop = $(this).scrollTop();
    	var footerOffset = $('footer').offset().top;
    	var windowHeight = $(window).height();
						 
        if (scrollTop > 300 && scrollTop + windowHeight < footerOffset) {
            $('header .sticky-top').css('top', '0px');
            
        } else {
            $('header .sticky-top').css('top', $('header').outerHeight()*-1);
        }
    });

    
    //Back to top button
    $(window).scroll(function () {
		var scrollTop = $(this).scrollTop(); 
		
        if (scrollTop > 300) {
            $('.back-to-top').fadeIn('slow').css('display', 'flex');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 800, 'easeInOutExpo');
        return false;
    });
	
	//隱藏/顯示密碼
	$('.btn-showHidePD').click(function() {
        var $button = $(this);
        var $input = $button.siblings('input');

        // 切換 icon 和 input 類型
        $button.find('i').toggleClass('bi-eye-fill bi-eye-slash-fill');
        $input.attr('type', $input.attr('type') === 'password' ? 'text' : 'password');
    });

	//BS tooltips
	const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
	const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
	
	//修改BS accordion不用設定目標id
	document.querySelectorAll('.accordion-button').forEach(button => {
		var item = button.closest('.accordion-item');
		var collapseElement = item.querySelector('.accordion-collapse');

		//手動添加手風琴狀態
		button.addEventListener('click', function () {
			var bsCollapse = bootstrap.Collapse.getOrCreateInstance(collapseElement);
			bsCollapse.toggle();
		});
		
		//展開狀態
		collapseElement.addEventListener('show.bs.collapse', function () {
			button.classList.remove('collapsed'); 
			button.setAttribute('aria-expanded', 'true');
		});

		//收合狀態
		collapseElement.addEventListener('hide.bs.collapse', function () {
			button.classList.add('collapsed');
		  	button.setAttribute('aria-expanded', 'false');
		});
	});
	
	//學門、學類、學系是什麼？modal
	$('[data-bs-target="#modal-exploreTip"]').click(function(e) {
        e.preventDefault();
		
        // 檢查是否已經加載了模態框
        if ($('#modal-exploreTip').length === 0) {
            // 動態載入模態框內容
            $.get('exploreTip.html', function(data) {
                $('body').append(data);
                $('#modal-exploreTip').modal('show');
            });
        } else {
            // 顯示已經加載的模態框
            $('#modal-exploreTip').modal('show');
        }
    });
	
	//如何安排測驗？modal
	$('[data-bs-target="#modal-testSchedule"]').click(function(e) {
        e.preventDefault();
		
        // 檢查是否已經加載了模態框
        if ($('#modal-testSchedule').length === 0) {
            // 動態載入模態框內容
            $.get('testSchedule.html', function(data) {
                $('body').append(data);
                $('#modal-testSchedule').modal('show');
            });
        } else {
            // 顯示已經加載的模態框
            $('#modal-testSchedule').modal('show');
        }
    });
	
	/////////////////////////////////////////////////
	//探索[展開/收合]按鈕
	if ($('.explore-collapse-btn').length) {
        // 檢查初始狀態
        $('.explore-collapse-btn').each(function() {
            var $btn = $(this);
            var $targetCarousel = $btn.parent().next('.explore-collapse-body');
            toggleCarouselState($btn, $targetCarousel);
			checkCarouselItems($btn, $targetCarousel);
        });

        // 點擊事件處理
        $('.explore-collapse-btn').click(function(e) {
            e.preventDefault();
            var $btn = $(this);
            var $targetCarousel = $btn.parent().next('.explore-collapse-body');
            toggleCarouselState($btn, $targetCarousel);
        });
    }
	
	//探索內文左方list a
	$('.explore-slider-list a').click(function(e){
		e.preventDefault();

		var target = $(this).attr('href');
		$('html,body').animate({
			scrollTop: $(target).offset().top - $('header').outerHeight() - 50
		}, 500);
	});

	/////////////////////////////////////////////////
	//[加入/取消最愛]點擊
	$('.btn-favorite').click(function(){
		$(this).toggleClass('active'); 
		
		if ($(this).hasClass('active')) { 
			$(this).find('span').text('取消'); 
			
			//收合特效
			collectAn($(this), $('.nav-collection'));
			
			setTimeout(function() {
				//吐司推播通知
				toastDOM('成功加入最愛。'); 
			}, 100);
		} else { 
			$(this).find('span').text('加入'); 
			
			setTimeout(function() {
				//吐司推播通知
				toastDOM('已取消最愛。');
			}, 100);
		}
	});
	
	//[加入/取消比較]點擊
	$('.btn-compare').click(function(){
		$(this).toggleClass('active'); 
		
		if ($(this).hasClass('active')) {  
			$(this).find('span').text('取消'); 
			
			//收合特效
			collectAn($(this), $('.compare-offcanvas'));
			
			setTimeout(function() {
				//吐司推播通知
				toastDOM('成功加入比較。');
			}, 100);
		} else { 
			$(this).find('span').text('加入'); 
			
			setTimeout(function() {
				//吐司推播通知
				toastDOM('已取消比較。');
			}, 100);
		}
	});
	
               
})(jQuery);
