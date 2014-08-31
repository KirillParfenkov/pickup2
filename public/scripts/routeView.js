(function($){
	$.fn.routeView = function(route){
		var self = this;
		return new Promise(function(resolve, reject){

			ymaps.ready(function() {
				var map = new ymaps.Map($(self).get(0), {
					center: [52.43, 30.98],
					zoom: 12,
					controls:[]
				});
				
				ymaps.route(route).then(function (route) {
					 map.geoObjects.add(route);
					 route.editor.start({
						addWayPoints: false,
						removeWayPoints: false,
						editWayPoints: false,
						addViaPoints: false,
						editViaPoints: false,
						removeViaPoints: false
					});
					resolve({
						map:map, 
						route: route
					});
				});
			});
		});
	}
})(jQuery);