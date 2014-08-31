(function($){
	var WORK_POINT = {
		type: 'wayPoint',
		point: [52.405086,30.920789]
	};
	
	$.fn.route = function(){
		var self = this;
		return new Promise(
			function(resolve, reject){

				ymaps.ready(function() {
					var map = new ymaps.Map($(self).get(0), {
						center: [52.43, 30.98],
						zoom: 12,
						controls:[]
					});
					
					map.events.add('click', function addHomePoint(e){
						var coords = e.get('coords');

						map.events.remove('click', addHomePoint);
						
						ymaps.route([{
								type: 'wayPoint',
								point: coords			
							},
							WORK_POINT
						]).then(function (route) {
							 map.geoObjects.add(route);
							 route.editor.start({
								addWayPoints: false,
								removeWayPoints: false,
								editWayPoints: true,
								addViaPoints: true,
								editViaPoints: true,
								removeViaPoints: true
							});
							
							var mod = {
								getRoute : function(){
									return route.requestPoints;
								}
							};
							resolve(mod);								
						});
					});
				});
			}
		)
	}
})(jQuery);