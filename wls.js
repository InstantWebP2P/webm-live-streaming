angular
.module('webmLiveStreaming', ['ngResource'])
///.config(['$resourceProvider', function ($resourceProvider) {
///	// Don't strip trailing slashes from calculated URLs
///	$resourceProvider.defaults.stripTrailingSlashes = false;
///}])
.directive('wlsVideo', function() {
	return {
		restrict: 'E',
		transclude: true,
		replace: true,
		scope: {},

		controller: function($scope, $element, 
				             $attrs, $transclude, $resource, $interval) {
			$scope.indexUrl = '';
			$scope.IndexCnt = {};
			
			$scope.srcA = '';
			$scope.srcB = '';
			$scope.showA = true;
			$scope.showB = true;
			$scope.widthA = 320;
			$scope.heightA = 240;
			$scope.widthB = 320;
			$scope.heightB = 240;
			$scope.posterA = '';
			$scope.posterB = '';
			$scope.muteA = false;
			$scope.muteB = true;
			$scope.ctrlA = false;
			$scope.ctrlB = true;

			
			$scope.fetchIndexUrl = function(indexUrl) {
				console.log('indexUrl:'+indexUrl);
				
				$scope.indexUrl = indexUrl;
				
				$resource(indexUrl)
				.get({}, function(value){
					$scope.IndexCnt = value;
					
					$scope.srcA = value.srcB;
					$scope.srcB = value.srcA;
				});
			};
			
			// simple test case
			$interval(function(){
				var mute = $scope.muteA;
				
				$scope.muteA = $scope.muteB;
				$scope.muteB = mute;
				
				var show = $scope.showA;
				$scope.showA = $scope.showB;
				$scope.showB = show;

				var ctrl = $scope.ctrlA;
				$scope.showA = $scope.ctrlB;
				$scope.ctrlB = ctrl;
			}, 6000);
			
		},
		
		link: function(scope, element, attrs) {
			console.log('attrs.keys:'+JSON.stringify(Object.keys(attrs)));
			
			scope.fetchIndexUrl(attrs.src);
			
			// observe attribute to interpolated attribute
			/*attrs.$observe('ngShow', function(value) {
				console.log('ngShow has changed value to ' + value);
				if (value) attrs.$set('ngShow', value);
			});*/
		},

		templateUrl: 'wlsVideo.html'
		///template: '<p> webm live streaming container </p>'
	};
})
.directive('wlsPlay', function() {
	return function(scope, element, attr) {
		
	};
})
.directive('wlsPause', function() {
	return function(scope, element, attr) {
		
	};
})
.directive('wlsMute', function() {
	return function(scope, element, attr) {	
		// refer to http://api.jquery.com/prop/
		// update property but attribute
		function update(value){
			if (value === 'true') {
				element.prop('muted', true);
			} else {
				element.prop('muted', false);
			}
		}

		// check first time
		update(attr.wlsMute);

		// observe attribute to interpolated attribute
		attr.$observe('wlsMute', function(value) {
			console.log('wlsMute has changed value to ' + value);
			update(value);
		});
	};
})	
.directive('wlsAutoPlay', function() {
	return function(scope, element, attr) {
		// update property but attribute
		function update(value){
			if (value === 'true') {
				if (!element.prop('autoplay'))
					element.prop('autoplay', true);
			} else {
				if (element.prop('autoplay'))
					element.prop('autoplay', false);
			}
		}

		// check first time
		update(attr.wlsAutoPlay);

		// observe attribute to interpolated attribute
		attr.$observe('wlsAutoPlay', function(value) {
			console.log('wlsAutoPlay has changed value to ' + value);
			update(value);
		});
	};
})
.directive('wlsPreload', function() {
	return function(scope, element, attr) {
		// update property but attribute
		function update(value){
			if (value === 'true') {
				if (!element.prop('preload'))
					element.prop('preload', true);
			} else {
				if (element.prop('preload'))
					element.prop('preload', false);
			}
		}
		
		// check first time
		update(attr.wlsPreload);

		// observe attribute to interpolated attribute
		attr.$observe('wlsPreload', function(value) {
			console.log('wlsPreload has changed value to ' + value);
			update(value);
		});
	};
})
.directive('wlsControls', function() {
	return function(scope, element, attr) {
		// update property but attribute
		function update(value){
			if (value === 'true') {
				element.prop('controls', true);
			} else {
				element.prop('controls', false);
			}
		}
		
		// check first time
		update(attr.wlsControls);

		// observe attribute to interpolated attribute
		attr.$observe('wlsControls', function(value) {
			console.log('wlsControls has changed value to ' + value);
			update(value);
		});
	};
})
.directive('wlsLoop', function() {
	return function(scope, element, attr) {
		// update property but attribute
		function update(value){
			if (value === 'true') {
				if (!element.prop('loop'))
					element.prop('loop', true);
			} else {
				if (element.prop('loop'))
					element.prop('loop', false);
			}
		}
		
		// check first time
		update(attr.wlsLoop);

		// observe attribute to interpolated attribute
		attr.$observe('wlsLoop', function(value) {
			console.log('wlsLoop has changed value to ' + value);
			update(value);
		});
	};
})
.directive('wlsParam', function() {
	return function(scope, element, attr) {
		// add event listener
		element.on('play', function(){
			console.log('play '+attr.class);
		});
		element.on('ended', function(){
			console.log('play ended '+attr.class);
		});
		element.on('loadedmetadata', function(){
			console.log('play loadedmetadata '+attr.class);
		});
		///element.on('progress', function(){
		///	console.log('play progress '+attr.class);
		///});
		element.on('pause', function(){
			console.log('play pause '+attr.class);
		});
		element.on('error', function(){
			console.log('play error '+attr.class);
		});
		element.on('waiting', function(){
			console.log('play waiting '+attr.class);
		});
		element.on('empty', function(){
			console.log('play empty '+attr.class);
		});
		element.on('abort', function(){
			console.log('play abort '+attr.class);
		});
				
		/*
		// fill initial parameters
		
		// watch on parameter changed
		scope.$watch();
		
		// update attribute
		function update(value){
			if (value === 'true') {
				element.attr('loop', 'loop')
			} else {
				element.removeAttr('loop');
			}
		}
		
		// check first time
		update(attr.wlsLoop);

		// observe attribute to interpolated attribute
		attr.$observe('wlsLoop', function(value) {
			console.log('wlsLoop has changed value to ' + value);
			update(value);
		});*/
	};
})
;
