
// templates

// module,directive
angular
.module('webmLiveStreaming', ['ngResource'])
///.config(['$resourceProvider', function ($resourceProvider) {
///	// Don't strip trailing slashes from calculated URLs
///	$resourceProvider.defaults.stripTrailingSlashes = false;
///}])
.config(['$logProvider', function($logProvider){
    $logProvider.debugEnabled(true);
}])
.directive('wlsVideo', function() {
	return {
		restrict: 'E',
		transclude: true,
		replace: true,
		scope: {},

		controller: function($scope, $element, 
				$attrs, $transclude, $resource, $interval, $log) {
			$scope.indexUrl = '';
			$scope.IndexCnt = {};

			$scope.srcA = '';
			$scope.srcB = '';
			$scope.showA = true;
			$scope.showB = false;
			$scope.widthA = 320;
			$scope.heightA = 240;
			$scope.widthB = 320;
			$scope.heightB = 240;
			$scope.posterA = '';
			$scope.posterB = '';
			$scope.muteA = false;
			$scope.muteB = true;
			$scope.playA = true;
			$scope.playB = false;
			$scope.preloadA = false;
			$scope.preloadB = true;			
			$scope.ctrlA = false;
			$scope.ctrlB = false;



			$scope.fetchIndexUrl = function(indexUrl) {
				$log.debug('indexUrl:'+indexUrl);

				$scope.indexUrl = indexUrl;

				$resource(indexUrl)
				.get({}, function(value){
					$scope.IndexCnt = value;

					///$scope.srcA = value.srcB;
					///$scope.srcB = value.srcA;
					// start streaming
					$scope.streamingFSM('start');
				});
			};

			// streaming FSM
			// input event, return action
			// event: 
			// - start, 
			// - videoa_played, 
			// - videoa_ended, 
			// - videob_played, 
			// - videob_ended, 
			// - stream_ended, for live stream
			// - stop
			// action:
			// - start play on videoA and preload on videoB
			// - switch-over between videoA and videoB
			$scope.streamingFSM = function(event) {
				$scope.fsm = $scope.fsm || {};
				
				$scope.fsm.live = $scope.IndexCnt.live;
				$scope.fsm.stream_done = $scope.IndexCnt.stream_done;

				$scope.fsm.playlist = $scope.IndexCnt.playlist;
				$scope.fsm.playlist_length = $scope.IndexCnt.playlist_length;
				
				$scope.fsm.current = $scope.fsm.current || 0;

				// check playlist length
				if ($scope.fsm.playlist_length === 0) {
					$log.debug('no video files');
					return;
				}

				switch(event) {
				case 'start':
					// initial index
					$scope.fsm.current = 0;

					// fill video src
					// play videoA, preload videoB
					$scope.srcA = $scope.fsm.playlist[$scope.fsm.current++];
					if ($scope.fsm.current === $scope.fsm.playlist_length) {
						$scope.showA = true;
						$scope.preloadA = false;
						$scope.muteA = false;
						$scope.playA = true;

						$log.debug('ev start, single video file');
					} else {
						$scope.srcB = $scope.fsm.playlist[$scope.fsm.current++];
						
						$scope.showB = false;
						$scope.muteB = true;
						$scope.playB = false;
						$scope.preloadB = true;
						$scope.videob_preloading = true;
					}
					$log.debug('ev start, current:'+$scope.fsm.current);

					// set start flag
					$scope.fsm.started = true;
					break;

				case 'wlsvideoa_played':
					$scope.fsm.a_played = true;
					break;

				case 'wlsvideoa_ended':
					// check playlist length
					// - for vod stream, when fsm.current == playlist length, stop
					// - for live stream, when fsm.current == playlist length, request index file again first
					
					// action
					function _wlsvideoa_ended($scope) {
						if ($scope.fsm.current === $scope.fsm.playlist_length) {
							$scope.streamingFSM('stop');
							$log.debug('ev videoa_ended, playlist done, trigger stop event');
						} else {
							if ($scope.fsm.a_played) {
								$scope.fsm.a_played = false;

								// switch over
								if ($scope.videob_preloading) {
									// hide videoA, show videoB
									$scope.showA = false;
									$scope.showB = true;

									// mute videoA, un-mute videoB
									$scope.muteA = true;
									$scope.muteB = false;

									// play videoB, reset videoA's src and preload videoA
									$scope.preloadB = false;
									$scope.playB = true;

									$scope.playA = false;
									$scope.srcA = $scope.fsm.playlist[$scope.fsm.current++];
									$scope.preloadA = true;
									$scope.videoa_preloading = true;

									$log.debug('ev videoa_ended, current:'+$scope.fsm.current);
								} else {
									$log.debug('ev videoa_ended: invalid operation 1');
								}
							} else {
								$log.debug('ev videoa_ended: invalid operation 2');
							}
						}
					}

					// check live stream in case playlist finished
					if ($scope.fsm.current === $scope.fsm.playlist_length) {
						if ($scope.fsm.live && !$scope.fsm.stream_done) {
							// request Index file again
							$resource($scope.indexUrl).get({}, function(value){
								$scope.IndexCnt = value;
                                
								// update playlist info
								$scope.fsm.playlist = $scope.IndexCnt.playlist;
								$scope.fsm.playlist_length = $scope.IndexCnt.playlist_length;
								$scope.fsm.live = $scope.IndexCnt.live;
								$scope.fsm.stream_done = $scope.IndexCnt.stream_done;

								// go on
								_wlsvideoa_ended($scope);
								
								$log.debug('ev videoa_ended, reload index file...done')
							});
							
							$log.debug('ev videoa_ended, reload index file...')
						} else {
							// go on
							_wlsvideoa_ended($scope);
						}
					} else {
						// in case playlist not finished
						_wlsvideoa_ended($scope);
					}
					break;

				case 'wlsvideob_played':
					$scope.fsm.b_played = true;
					break;

				case 'wlsvideob_ended':
					// check playlist length
					// - for vod stream, when fsm.current == playlist length, stop
					// - for live stream, when fsm.current == playlist length, request index file again first

					// action
					function _wlsvideob_ended($scope) {
						if ($scope.fsm.current === $scope.fsm.playlist_length) {
							$scope.streamingFSM('stop');
							$log.debug('ev videob_ended, playlist done, trigger stop event');
						} else {
							if ($scope.fsm.b_played) {
								$scope.fsm.b_played = false;

								// switch over
								if ($scope.videoa_preloading) {
									// hide videoB, show videoA
									$scope.showB = false;
									$scope.showA = true;

									// mute videoA, un-mute videoB
									$scope.muteB = true;
									$scope.muteA = false;

									// play videoA, reset videoB's src and preload videoB
									$scope.preloadA = false;
									$scope.playA = true;

									$scope.playB = false;
									$scope.srcB = $scope.fsm.playlist[$scope.fsm.current++];
									$scope.preloadB = true;
									$scope.videob_preloading = true;

									$log.debug('ev videob_ended, current:'+$scope.fsm.current);
								} else {
									$log.debug('ev videob_ended: invalid operation 1');
								}
							} else {
								$log.debug('ev videob_ended: invalid operation 2');
							}
						}	
					}
					
					// check live stream in case playlist finished
					if ($scope.fsm.current === $scope.fsm.playlist_length) {
						if ($scope.fsm.live && !$scope.fsm.stream_done) {
							// request Index file again
							$resource($scope.indexUrl).get({}, function(value){
								$scope.IndexCnt = value;
								
								// update playlist info
								$scope.fsm.playlist = $scope.IndexCnt.playlist;
								$scope.fsm.playlist_length = $scope.IndexCnt.playlist_length;
								$scope.fsm.live = $scope.IndexCnt.live;
								$scope.fsm.stream_done = $scope.IndexCnt.stream_done;

								// go on
								_wlsvideob_ended($scope);
								
								$log.debug('ev videob_ended, reload index file...done')
							});
							
							$log.debug('ev videob_ended, reload index file...');
						} else {
							// go on
							_wlsvideob_ended($scope);
						}
					} else {
						// in case playlist not finished
						_wlsvideob_ended($scope);
					}
					break;

				case 'stop':
					// set stop flag
					$scope.fsm.stopped = true;
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
			///console.log('attrs.keys:'+JSON.stringify(Object.keys(attrs)));

			scope.fetchIndexUrl(attrs.src);

			// watch on scope
			/*scope.$watch('srcA', function(newValue, oldValue) {
				if (newValue)
					$log.debug("data changed: "+newValue);
			});
			scope.$watch('srcB', function(newValue, oldValue) {
				if (newValue)
					$log.debug("data changed: "+newValue);
			});

			scope.$watch('showA', function(newValue, oldValue) {
				if (newValue)
					$log.debug("data changed: "+newValue);
			});
			scope.$watch('showB', function(newValue, oldValue) {
				if (newValue)
					$log.debug("data changed: "+newValue);
			});

			scope.$watch('playA', function(newValue, oldValue) {
				if (newValue)
					$log.debug("data changed: "+newValue);
			});
			scope.$watch('playB', function(newValue, oldValue) {
				if (newValue)
					$log.debug("data changed: "+newValue);
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
				$attrs, $transclude, $resource, $interval, $log) {
			$scope.indexUrl = '';
			$scope.IndexCnt = {};

			$scope.srcA = '';
			$scope.srcB = '';
			$scope.showA = true;
			$scope.showB = false;			
			$scope.muteA = false;
			$scope.muteB = true;
			$scope.playA = true;
			$scope.playB = false;
			$scope.preloadA = false;
			$scope.preloadB = true;			
			$scope.ctrlA = true;
			$scope.ctrlB = true;



			$scope.fetchIndexUrl = function(indexUrl) {
				$log.debug('indexUrl:'+indexUrl);

				$scope.indexUrl = indexUrl;

				$resource(indexUrl)
				.get({}, function(value){
					$scope.IndexCnt = value;

					///$scope.srcA = value.srcB;
					///$scope.srcB = value.srcA;
					// start streaming
					$scope.streamingFSM('start');
				});
			};

			// streaming FSM
			// input event, return action
			// event: 
			// - start, 
			// - audioa_played, 
			// - audioa_ended, 
			// - audiob_played, 
			// - audiob_ended, 
			// - stream_ended, for live stream
			// - stop
			// action:
			// - start play on videoA and preload on videoB
			// - switch-over between videoA and videoB
			$scope.streamingFSM = function(event) {
				$scope.fsm = $scope.fsm || {};
				var pl  = $scope.fsm.playlist = $scope.IndexCnt.playlist;
				var pll = $scope.fsm.playlist_length = $scope.IndexCnt.playlist_length;
				$scope.fsm.current = $scope.fsm.current || 0;

				// check playlist length
				if (pll === 0) {
					$log.debug('no audio files');
					return;
				}

				switch(event) {
				case 'start':
					// initial index
					$scope.fsm.current = 0;

					// fill video src
					// play videoA, preload videoB
					$scope.srcA = pl[$scope.fsm.current++];
					if ($scope.fsm.current === pll) {
						$scope.showA = true;
						$scope.preloadA = false;
						$scope.muteA = false;
						$scope.playA = true;

						$log.debug('ev start, single audio file');
					} else {
						$scope.srcB = pl[$scope.fsm.current++];
						
						$scope.showB = false;
						$scope.muteB = true;
						$scope.playB = false;
						$scope.preloadB = true;
						$scope.audiob_preloading = true;
					}
					$log.debug('ev start, current:'+$scope.fsm.current);

					// set start flag
					$scope.fsm.started = true;
					break;

				case 'wlsaudioa_played':
					$scope.fsm.a_played = true;
					break;

				case 'wlsaudioa_ended':
					// check playlist length
					if ($scope.fsm.current === pll) {
						$scope.streamingFSM('stop');
						$log.debug('ev audioa_ended, playlist done, trigger stop event');
					} else {
						if ($scope.fsm.a_played) {
							$scope.fsm.a_played = false;

							// switch over
							if ($scope.audiob_preloading) {
								// hide audioA, show audioB
								$scope.showA = false;
								$scope.showB = true;

								// mute audioA, un-mute audioB
								$scope.muteA = true;
								$scope.muteB = false;

								// play audioB, reset audioA's src and preload audioA
								$scope.preloadB = false;
								$scope.playB = true;

								$scope.playA = false;
								$scope.srcA = pl[$scope.fsm.current++];
								$scope.preloadA = true;
								$scope.audioa_preloading = true;

								$log.debug('ev audioa_ended, current:'+$scope.fsm.current);
							} else {
								$log.debug('ev audioa_ended: invalid operation 1');
							}
						} else {
							$log.debug('ev audioa_ended: invalid operation 2');
						}
					}
					break;

				case 'wlsaudiob_played':
					$scope.fsm.b_played = true;
					break;

				case 'wlsaudiob_ended':
					// check playlist length
					if ($scope.fsm.current === pll) {
						$scope.streamingFSM('stop');
						$log.debug('ev audiob_ended, playlist done, trigger stop event');
					} else {
						if ($scope.fsm.b_played) {
							$scope.fsm.b_played = false;

							// switch over
							if ($scope.audioa_preloading) {
								// hide audioB, show audioA
								$scope.showB = false;
								$scope.showA = true;
								
								// mute audioA, un-mute audioB
								$scope.muteB = true;
								$scope.muteA = false;

								// play audioA, reset audioB's src and preload audioB
								$scope.preloadA = false;
								$scope.playA = true;

								$scope.playB = false;
								$scope.srcB = pl[$scope.fsm.current++];
								$scope.preloadB = true;
								$scope.audiob_preloading = true;

								$log.debug('ev audiob_ended, current:'+$scope.fsm.current);
							} else {
								$log.debug('ev audiob_ended: invalid operation 1');
							}
						} else {
							$log.debug('ev audiob_ended: invalid operation 2');
						}
					}				
					break;

				case 'stop':
					// set stop flag
					$scope.fsm.stopped = true;
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
				
				var ctrl = $scope.ctrlA;
				$scope.ctrlA = $scope.ctrlB;
				$scope.ctrlB = ctrl;
			}, 6000);*/

		},

		link: function(scope, element, attrs) {
			///console.log('attrs.keys:'+JSON.stringify(Object.keys(attrs)));

			scope.fetchIndexUrl(attrs.src);

			// watch on scope
			/*scope.$watch('srcA', function(newValue, oldValue) {
				if (newValue)
					$log.debug("data changed: "+newValue);
			});
			scope.$watch('srcB', function(newValue, oldValue) {
				if (newValue)
					$log.debug("data changed: "+newValue);
			});

			scope.$watch('playA', function(newValue, oldValue) {
				if (newValue)
					$log.debug("data changed: "+newValue);
			});
			scope.$watch('playB', function(newValue, oldValue) {
				if (newValue)
					$log.debug("data changed: "+newValue);
			});*/
		},

		templateUrl: 'wlsAudio.html'
		///template: '<p> webm live streaming container </p>'
	};
})
.directive('wlsShow', function() {
	return function(scope, element, attr) {
		// update hidden attribute
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
			///console.log(attr.class+' wlsShow has changed value to ' + value);
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
			///console.log(attr.class+' wlsPlay has changed value to ' + value);
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
			///console.log(attr.class+' wlsPause has changed value to ' + value);
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
			///console.log(attr.class+' wlsMute has changed value to ' + value);
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
			///console.log(attr.class+' wlsAutoPlay has changed value to ' + value);
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
			///console.log(attr.class+' wlsPreload has changed value to ' + value);
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
			///console.log(attr.class+' wlsControls has changed value to ' + value);
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
			///console.log(attr.class+' wlsLoop has changed value to ' + value);
			update(value);
		});
	};
})
.directive('wlsEvents', function() {
	return function(scope, element, attr) {
		// add event listener
		element.on('play', function(){
			console.log(attr.class+' play@'+Date.now());

			// sync data
			scope.$apply(function(){
				// update FSM
				scope.streamingFSM(attr.class+'_played');
			});
		});
		element.on('ended', function(){
			console.log(attr.class+' play@'+Date.now());

			// sync data
			scope.$apply(function(){
				// update FSM
				scope.streamingFSM(attr.class+'_ended');
			});
		});
		element.on('playing', function(){
			console.log(attr.class+' playing@'+Date.now());
		});
		
		element.on('loadeddata', function(){
			console.log(attr.class+' loadeddata@'+Date.now());
		});
		element.on('loadstart', function(){
			console.log(attr.class+' loadstart@'+Date.now());
		});
		
		element.on('loadedmetadata', function(){
			///console.log(attr.class+' loadedmetadata@'+Date.now());
		});
		/*element.on('progress', function(){
            ///$log.debug(attr.class+' progress@'+Date.now());
            $log.debug('networkState:'+JSON.stringify(element.prop('networkState')));
            $log.debug('played:'+JSON.stringify(element.prop('played')));
		});*/
		element.on('pause', function(){
			console.log(attr.class+' pause@'+Date.now());
		});
		element.on('error', function(){
			///console.log(attr.class+' error@'+Date.now());
		});
		element.on('waiting', function(){
			console.log(attr.class+' waiting@'+Date.now());
		});
		element.on('empty', function(){
			///console.log(attr.class+' empty@'+Date.now());
		});
		element.on('abort', function(){
			///console.log(attr.class+' abort@'+Date.now());
		});	
		
		element.on('seeking', function(){
			console.log(attr.class+' seeking@'+Date.now());
		});
		element.on('seeked', function(){
			console.log(attr.class+' seeked@'+Date.now());
		});
		
		element.on('canplay', function(){
			console.log(attr.class+' canplay@'+Date.now());
		});
		element.on('canplaythrough', function(){
			console.log(attr.class+' canplaythrough@'+Date.now());
		});
		
		element.on('durationchange', function(){
			console.log(attr.class+' durationchange@'+Date.now());
		});
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
				$log.debug('indexUrl:'+indexUrl);

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
			///console.log('attrs.keys:'+JSON.stringify(Object.keys(attrs)));

			scope.fetchIndexUrl(attrs.src);

			// observe attribute to interpolated attribute
			/*attrs.$observe('ngShow', function(value) {
				$log.debug('ngShow has changed value to ' + value);
				if (value) attrs.$set('ngShow', value);
			});*/
		},

		templateUrl: 'wlsVideoBar.html'
		///template: '<p> webm live streaming container </p>'
	};
})
;
