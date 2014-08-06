
// templates

// module,directive
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
			$scope.showA = false;
			$scope.showB = false;
			$scope.widthA = 320;
			$scope.heightA = 240;
			$scope.widthB = 320;
			$scope.heightB = 240;
			$scope.posterA = '';
			$scope.posterB = '';
			$scope.muteA = false;
			$scope.muteB = false;
			$scope.playA = false;
			$scope.playB = false;
			$scope.preloadA = false;
			$scope.preloadB = false;			
			$scope.ctrlA = false;
			$scope.ctrlB = false;

			
			$scope.fetchIndexUrl = function(indexUrl) {
				console.log('indexUrl:'+indexUrl);
				
				$scope.indexUrl = indexUrl;
				
				$resource(indexUrl)
				.get({}, function(value){
					$scope.IndexCnt = value;
					
					///$scope.srcA = value.srcB;
					///$scope.srcB = value.srcA;
					// start streaming
					$scope.streamingLSM($scope, 'start');
				});
			};
			
			// streaming LSM
			// input event, return action
			// event: 
			// - start, 
			// - videoa_played, 
			// - videoa_ended, 
			// - videob_played, 
			// - videob_ended, 
			// - stream_ended, 
			// - stop
			// action:
			// - start play on videoA and preload on videoB
			// - switch-over between videoA and videoB
			$scope.streamingLSM = function($scope, event) {
				$scope.lsm = $scope.lsm || {};
				var pl  = $scope.lsm.playlist = $scope.IndexCnt.playlist;
				var pll = $scope.lsm.playlist_length = $scope.IndexCnt.playlist_length;
				$scope.lsm.current = $scope.lsm.current || 0;
				var cur = $scope.lsm.current;
								
				switch(event) {
				case 'start':
					// initial index
				    cur = 0;
                    
					// fill video src
					$scope.srcA = pl[cur++];
					$scope.srcB = pl[cur++];
                    console.log('ev start, current:'+$scope.lsm.current);
                    
                    // play videoA while preload videoB
                    {
                    	// show videoA, hide videoB
                    	$scope.showB = false;
                    	$scope.showA = true;
                        
                    	// play videoA, preload videoB
                    	$scope.playA = true;
                    	
                    	$scope.preloadB = true;
                    	$scope.videob_preloading = true;
                    }
                    
                    // set start flag
					$scope.lsm.started = true;
					break;
					
				case 'wlsvideoa_played':
					$scope.lsm.a_played = true;
					break;
					
				case 'wlsvideoa_ended':
					// check playlist length
					if (cur === pll) {
						$scope.streamingLSM('stop');
						console.log('ev videoa_ended, playlist done, trigger stop event');
					} else {
						if ($scope.lsm.a_played) {
							$scope.lsm.a_played = false;

							// switch over
							if ($scope.videob_preloading) {
								// hide videoA, show videoB
								$scope.showA = false;
								$scope.showB = true;

								// play videoB, reset videoA's src and preload videoA
								$scope.playB = true;

								$scope.srcA = pl[cur++];
								$scope.preloadA = true;
								$scope.videoa_preloading = true;
								console.log('ev videoa_ended, current:'+$scope.lsm.current);
							} else {
								console.log('ev videoa_ended: invalid operation');
							}
						} else {
							console.log('ev videoa_ended: invalid operation');
						}
					}
					break;
					
				case 'wlsvideob_played':
					$scope.lsm.b_played = true;
					break;
					
				case 'wlsvideob_ended':
					// check playlist length
					if (cur === pll) {
						$scope.streamingLSM('stop');
						console.log('ev videob_ended, playlist done, trigger stop event');
					} else {
						if ($scope.lsm.b_played) {
							$scope.lsm.b_played = false;

							// switch over
							if ($scope.videoa_preloading) {
								// hide videoB, show videoA
								$scope.showB = false;
								$scope.showA = true;

								// play videoA, reset videoB's src and preload videoB
								$scope.playA = true;

								$scope.srcB = pl[cur++];
								$scope.preloadB = true;
								$scope.videob_preloading = true;
								console.log('ev videob_ended, current:'+$scope.lsm.current);
							} else {
								console.log('ev videob_ended: invalid operation');
							}
						} else {
							console.log('ev videob_ended: invalid operation');
						}
					}
					break;
					
				case 'stop':
                    // set stop flag
					$scope.lsm.stopped = true;
					break;
					
				default:
					break;
				}
			};
			
			// simple test case
			/*$interval(function(){
				var mute = $scope.muteA;
				$scope.muteA = $scope.muteB;
				$scope.muteB = mute;

				var show = $scope.showA;
				$scope.showA = $scope.showB;
				$scope.showB = show;

				var ctrl = $scope.ctrlA;
				$scope.ctrlA = $scope.ctrlB;
				$scope.ctrlB = ctrl;
			}, 6000);*/
			
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
.directive('wlsAudio', function() {
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
			/*$interval(function(){
				var mute = $scope.muteA;
				$scope.muteA = $scope.muteB;
				$scope.muteB = mute;
				
				var ctrl = $scope.ctrlA;
				$scope.ctrlA = $scope.ctrlB;
				$scope.ctrlB = ctrl;
			}, 6000);*/
			
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

		templateUrl: 'wlsAudio.html'
		///template: '<p> webm live streaming container </p>'
	};
})
.directive('wlsShow', function() {
	return function(scope, element, attr) {
		// update property but attribute
		function update(value){
			if (value === 'true') {
				element.removeAttr('hidden');
			} else {
				element.attr('hidden', 'hidden');
			}
		}

		// check first time
		update(attr.wlsShow);

		// observe attribute to interpolated attribute
		attr.$observe('wlsShow', function(value) {
			console.log('wlsShow has changed value to ' + value);
			update(value);
		});
	};
})
.directive('wlsPlay', function() {
	return function(scope, element, attr) {
		// update property but attribute
		function update(value){
			if (value === 'true') {
				element[0].play();
			} else {
				element[0].pause();
			}
		}

		// check first time
		update(attr.wlsPlay);

		// observe attribute to interpolated attribute
		attr.$observe('wlsPlay', function(value) {
			console.log('wlsPlay has changed value to ' + value);
			update(value);
		});
	};
})
.directive('wlsPause', function() {
	return function(scope, element, attr) {
		// update property but attribute
		function update(value){
			if (value === 'true') {
				element[0].pause();
			} else {
				element[0].play();
			}
		}

		// check first time
		update(attr.wlsPause);

		// observe attribute to interpolated attribute
		attr.$observe('wlsPause', function(value) {
			console.log('wlsPause has changed value to ' + value);
			update(value);
		});
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
				element.prop('autoplay', true);
			} else {
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
				element.prop('preload', true);
			} else {
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
				element.prop('loop', true);
			} else {
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
			scope.streamingLSM(scope, attr.class+'_played');
		});
		element.on('ended', function(){
			console.log('play ended '+attr.class);
			scope.streamingLSM(scope, attr.class+'_ended');
		});
		element.on('loadedmetadata', function(){
			console.log('play loadedmetadata '+attr.class);
		});
		element.on('progress', function(){
            ///console.log('play progress '+attr.class);
            console.log('networkState:'+JSON.stringify(element.prop('networkState')));
            console.log('played:'+JSON.stringify(element.prop('played')));
		});
		element.on('pause', function(){
			console.log('play pause '+attr.class);
			
			///element[0].play();
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
.directive('wlsVideoBar', function() {
	return {
		restrict: 'E',
		transclude: true,
		replace: true,
		require: '^wlsVideo',
		scope: {},

		controller: function($scope, $element, 
				             $attrs, $transclude, $resource, $interval) {
			$scope.indexUrl = '';
			$scope.IndexCnt = {};
			
			$scope.srcA = '';
			$scope.srcB = '';
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
				
				var ctrl = $scope.ctrlA;
				$scope.ctrlA = $scope.ctrlB;
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

		templateUrl: 'wlsVideoBar.html'
		///template: '<p> webm live streaming container </p>'
	};
})
;
