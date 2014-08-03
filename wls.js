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

		controller: ['$scope', '$resource', function($scope, $resource) {
			var indexUrl = $scope.indexUrl = '';
			var IndexCnt = $scope.IndexCnt = {};
			
			var srcA = $scope.srcA = '';
			var srcB = $scope.srcB = '';
			var showA = $scope.showA = false;
			var showB = $scope.showB = true;

			$scope.fetchIndexUrl = function(indexUrl) {
				console.log('indexUrl:'+indexUrl);
				
				$scope.indexUrl = indexUrl;
				
				$resource(indexUrl)
				.get({}, function(value){
					$scope.IndexCnt = value;
					
					$scope.srcA = value.srcA;
					$scope.srcB = value.srcB;
				});
			};
			
		}],
		
		link: function(scope, element, attrs) {
			console.log('attrs.keys:'+JSON.stringify(Object.keys(attrs)));
			
			scope.fetchIndexUrl(attrs.src);
		},

		templateUrl: 'wlsVideo.html'
		///template: '<p> webm live streaming container </p>'
	};
});
