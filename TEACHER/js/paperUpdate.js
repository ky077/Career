$(function(){
	var visibleTabCount = 3;

	//更新通知
	$(".alert-btn").click(function(){
		$(".alert-content").slideToggle();
		$(this).html( ($(this).html() !="展開<span>+</span>") ? "展開<span>+</span>" : "關閉<span>-</span>" );
		return false;
	})

	function addTabMenuSliderStyle(){
		if( $("#tabMenuSliderStyle").length ){
			return;
		}
	}

	function setTabMenuArrowState($button, isDisabled){
		if( isDisabled ){
			$button.addClass("disabled").attr("disabled", "disabled");
		}else{
			$button.removeClass("disabled").removeAttr("disabled");
		}
	}

	function initTabMenuSlider(){
		$(".tab-compare ul.tab-menu").each(function(){
			var $menu = $(this);
			var $items = $menu.children("li");
			var itemCount = $items.length;
			var maxIndex = itemCount - visibleTabCount;
			var nowIndex = 0;
			var menuWidthPercent;
			var itemWidthPercent;

			if( itemCount <= visibleTabCount || $menu.parent().hasClass("tab-menu-viewport") ){
				return;
			}

			addTabMenuSliderStyle();

			menuWidthPercent = (itemCount / visibleTabCount) * 100;
			itemWidthPercent = 100 / itemCount;

			$menu
				.wrap('<div class="tab-menu-slider"><div class="tab-menu-viewport"></div></div>')
				.css({
					"width": menuWidthPercent + "%",
					"margin-left": "0%"
				});
			$items.css("width", itemWidthPercent + "%");

			var $slider = $menu.closest(".tab-menu-slider");
			var $leftButton = $('<button type="button" class="tab-menu-arrow tab-menu-arrow-left" title="向左" aria-label="向左">&#9664;</button>');
			var $rightButton = $('<button type="button" class="tab-menu-arrow tab-menu-arrow-right" title="向右" aria-label="向右">&#9654;</button>');

			function updateTabRange(isAnimated){
				var marginLeft = (nowIndex * -100 / visibleTabCount) + "%";

				if( isAnimated ){
					$menu.stop(true).animate({"margin-left": marginLeft}, 200);
				}else{
					$menu.css("margin-left", marginLeft);
				}

				setTabMenuArrowState($leftButton, nowIndex === 0);
				setTabMenuArrowState($rightButton, nowIndex === maxIndex);
			}

			$slider.prepend($leftButton).append($rightButton);

			$leftButton.click(function(){
				if( nowIndex > 0 ){
					nowIndex--;
					updateTabRange(true);
				}
				return false;
			});

			$rightButton.click(function(){
				if( nowIndex < maxIndex ){
					nowIndex++;
					updateTabRange(true);
				}
				return false;
			});

			updateTabRange(false);
		});
	}

	initTabMenuSlider();

	
	//新舊切換
	$(".tab-compare ul.tab-menu li").click(function(){
		var nowClickTab = $(this).find("a").attr("href");
		$(this).closest(".tab-compare").children(".tab-content").find(nowClickTab).fadeIn(100).siblings().fadeOut(100);
		
		if( $(this).find("a").hasClass("linkage") ){
			$(this).parents(".tab-menu").find("a").removeClass("nowTab");
			$(this).parents(".tab-menu").find("a.linkage").addClass("nowTab");
			
		}else{
			$(this).parents(".tab-menu").find("a").removeClass("nowTab");
			$(this).find("a").addClass("nowTab");
		}
		
		return false;
	});
})

