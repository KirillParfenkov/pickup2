(function($, Controller){
	var applicationController = new Controller;
	
	applicationController.toggleClass = function(e){
		this.view.toggleClass('over', e.data);
	}

	applicationController.load(function(){
		this.view = $("#view");
		this.view.mouseover(true, this.toggleClass.bind(this));
		this.view.mouseout(false, this.toggleClass.bind(this));
	})

})(jQuery, Controller);