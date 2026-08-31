$(document).ready(function(){
	$(".tableTRColor tr").mouseover(function(){ $(this).addClass("over");})
					  .mouseout(function(){ $(this).removeClass("over");}) 
	
	$(".tableTRColor tr:odd").addClass("oddalt"); //給的奇數行添加class值為oddalt
	$(".tableTRColor tr:even").addClass("alt"); //給偶數行添加class值為alt
		});