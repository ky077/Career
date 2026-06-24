//demo登入、登出區塊顯示
function logState(){ 
	var searchParams = new URLSearchParams(document.location.search);  
	
	var pathName = document.location.pathname;
	let fileName = pathName.substring(pathName.lastIndexOf('/') + 1); 		
	
	var logState = false; 
    if ( searchParams.has('uid') ){
		logState = true;		
	} 
	
	//登入
	if( logState === true){ 
		//所有連結都加searchParams
		
		//header
		$('.nav-login').hide(); 
		$('.nav-logout, .nav-user').show(); 
		
		//探索學類
		/*if( fileName == 'explore2.html' || fileName == 'explore3.html'){
			$('.login-divider').hide();						 
										 
			$('.card').show();   
		 }*/
		
	} 
	//未登入
	else{ 
		//header
		$('.nav-login').show(); 
		$('.nav-logout, .nav-user').hide(); 
		
		//探索
		/*if (fileName.indexOf('explore') !== -1){
			$('.btn-favorite').porp('disabled', true);
		}*/
		
		//探索學類、探索學系
		/*if( fileName == 'explore2.html' || fileName == 'explore3.html'){
			$('.login-divider').show();						 
										 
			$('#introCate').show().siblings('.card').hide();   
		 }*/
		
	}
}

//nav當前頁active  (僅 探索、讚生涯測驗、我的收藏 有用)
function navActive(page){ 
	$('.nav-' + page).addClass('active'); 
}
	

//探索 [展開/收合]按鈕狀態
function toggleCarouselState($btn, $targetCarousel) {
  if ($btn.attr('aria-expanded') === 'true') {
    $btn.attr('aria-expanded', 'false').find('span').html('展開');
    $targetCarousel
      .removeClass('row mx-0 gy-4')
      .addClass('owl-carousel');
    initCarousel('#' + $targetCarousel.attr('id'));

  } else { // [false 收合狀態中]
    $btn.attr('aria-expanded', 'true').find('span').html('收合');
    $targetCarousel
      .removeClass('owl-carousel')
      .addClass('row mx-0 gy-4');
    $targetCarousel.owlCarousel('destroy');
  }
}

//探索 [展開/收合]按鈕顯示與否
function checkCarouselItems($btn, $targetCarousel) {
  var itemCount = $targetCarousel.children().length;
  var responsiveSettings = {
    0: 2,
    576: 3,
    768: 4,
    992: 5,
    1200: 6,
    1400: 7,
    1600: 8,
    1900: 9
  };

  var windowWidth = $(window).width();
  var itemsToShow;

  $.each(responsiveSettings, function (breakpoint, items) {
    if (windowWidth >= breakpoint) {
      itemsToShow = items;
    }
  });

  if (itemCount <= itemsToShow) {
    $btn.hide();
  } else {
    $btn.show();
  }
}

//探索 initCarousel
function initCarousel(el) {
  $(el).owlCarousel({
    autoplay: false,
    smartSpeed: 300,
    loop: false,
    nav: true,
    navText: ['<i class="bi bi-chevron-left"></i>', '<i class="bi bi-chevron-right"></i>'],
    dots: false,
	autoWidth: true,  
    responsiveClass: true,
  });
}

//探索 explore-slider [加入/取消最愛]、[加入/取消比較]位置
function sliderToolPosition() {
	if ($('[class*="explore-content"]:visible').length > 0){ 
		var toolTop = $('.explore-slider-tool').offset().top;	
										
		$(window).on('scroll resize', function() {
			if ($(window).width() < 1200) {
				var windowTop = $(window).scrollTop(); 
				var footerOffset = $('footer').offset().top;
    			var windowHeight = $(window).height();	
				
				if (windowTop > toolTop) { 
					$('.explore-slider-tool').addClass('position-fixed'); 
					if( windowTop + windowHeight >= footerOffset){  
						$('.explore-slider-tool').removeClass('position-fixed')
												 .addClass('position-absolute');   
					} else{
					   $('.explore-slider-tool').removeClass('position-absolute')   
					}
				} else { 
					$('.explore-slider-tool').removeClass('position-fixed'); 
				}
			} else { 
				$('.explore-slider-tool').removeClass('position-fixed'); 
			}
		});												
	} 
}

//收合特效
function collectAn(fromEl, toEl){ 
	let clone = fromEl.clone().css({
						'position': 'absolute', 
						'top':      fromEl.offset().top, 
						'left':     fromEl.offset().left, 
						'width':    fromEl.width(),
						'height':   fromEl.height(),
						'z-index':  999999999
					});
	
	let box_top = toEl.offset().top;
	let box_left = toEl.offset().left;
	
	
	clone.appendTo('body').animate({
		'top':     box_top, 
		'left':    box_left, 
		'width':   20, 
		height:    'auto' 
	}, 
	{
		duration: 500, 
		complete: function(){ 
			clone.remove();
		} 
	}); 
}





//alertModal 警報視窗 (無右上X，不可點黑處關閉)  [sm|md|lg|xl]
function alertModalDOM(html, size='md', btnOkText='Ok'){
    $('body').append(`<div class="modal fade" id="alertModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
                  <div class="modal-dialog modal-dialog-centered modal-` + size + `">
                    <div class="modal-content">
                      <div class="modal-body pt-5 d-flex flex-column align-items-center text-lg-center">
                         <div>`
                           + html +
                        `</div>
                         <div class="text-center mt-4 mb-3">
                          <button type="button" class="btn btn-primary rounded-pill px-4" data-bs-dismiss="modal" id="ALERT_OK">` + btnOkText + `</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>`);
    var alertModal = new bootstrap.Modal(document.getElementById('alertModal'));
    alertModal.show();
    
    $('#alertModal').on('hidden.bs.modal', function () {
        $(this).remove();
    });
}

//confirmModal 確認視窗 (無右上X，不可點黑處關閉)  [sm|md|lg|xl]
function confirmModalDOM(html, size='md', btnCancelText='Cancel', btnSubmitText='Submit'){
    $('body').append(`<div class="modal fade" id="confirmModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
                  <div class="modal-dialog modal-dialog-centered modal-` + size + `">
                    <div class="modal-content">
                      <div class="modal-body pt-5 d-flex flex-column align-items-center text-lg-center">
                        <div>`
                          + html +
                        `</div>
                          <div class="text-center mt-4 mb-3">
                          <button type="button" class="btn btn-outline-primary rounded-pill px-4" data-bs-dismiss="modal">` + btnCancelText + `</button>
                          <button type="button" class="btn btn-primary rounded-pill px-4" data-bs-dismiss="modal" id="CONFIRM_OK">` + btnSubmitText + `</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>`);
    var confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
    confirmModal.show();
    
    $('#confirmModal').on('hidden.bs.modal', function () {
        $(this).remove();
    });
}

//msgModalDOM 訊息視窗 (有右上X，可點黑處關閉)  [sm|md|lg|xl]
function msgModalDOM(html, size='md', btnCloseText='Close'){
    $('body').append(`<div class="modal fade" id="msgModal" tabindex="-1" aria-hidden="true">
                  <div class="modal-dialog modal-dialog-centered modal-` + size + `">
                    <div class="modal-content">
                      <div class="modal-body">
                        <div class="text-end mb-3">
                          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div>`
                          + html +
                        `</div>
                         <div class="text-center mt-4 mb-3">
                          <button type="button" class="btn btn-primary rounded-pill px-4" data-bs-dismiss="modal">` + btnCloseText + `</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>`);
    var msgModal = new bootstrap.Modal(document.getElementById('msgModal'));
    msgModal.show();
    
    $('#msgModal').on('hidden.bs.modal', function () {
        $(this).remove();
    });
}

//toastDOM 吐司推播通知
function toastDOM(html){
    $('body').append(`<div class="toast-container">
                        <div id="toast" class="toast text-bg-dark bg-opacity-75 position-fixed top-50 start-50 translate-middle" role="alert" aria-live="polite" aria-atomic="true" data-bs-delay="1000">
                          <div class="d-flex">
                            <div class="toast-body">
                            ` + html + `
                            </div>
                            <button type="button" class="btn-close me-2 m-auto btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
                          </div>
                        </div>
                      </div>`);

    const toastEl = document.getElementById('toast');
    const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastEl);
    toastBootstrap.show();

    toastEl.addEventListener('hidden.bs.toast', () => {
        toastEl.closest('.toast-container').remove();
    })
}