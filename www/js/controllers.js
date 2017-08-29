angular.module('starter.controllers', ['ionic', 'ngCordova'] )

.controller('MapCtrl', function($scope, $state, $cordovaGeolocation,$filter, $rootScope, $timeout, HttpService, PrefService) {
  var options = {timeout: 10000, enableHighAccuracy: true};
  var latLng;
  var map;
  var marker;
  var markers = [];
  $cordovaGeolocation.getCurrentPosition(options).then(function(position) {
    latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    var mapOptions = {
      center: latLng,
      mapTypeControl: false,
      zoomControl: false,
      zoom: 15
    };
     map  = new google.maps.Map(document.getElementById("map"), mapOptions);
			 
     marker = new google.maps.Marker({
      map: map,
      animation: google.maps.Animation.BOUNCE,
      position: latLng,
      icon: 'http://maps.google.com/mapfiles/arrow.png'
		});
     
     HttpService.getCords().then( function(response) {     
     var cords = response.data;     
      $timeout(function(){
        var cords = $rootScope.filteredObj;     
      }, 3000);

      $scope.removeMarkers = function () {
        markers = [];
      };
       $scope.setMapOnAll = function (map) {
         for (var i = 0; i < markers.length; i++) {
             markers[i].setMap(map);
          }
         };
      
      $scope.refreshMarkers = function (cords) {
        var infoWindow = []; 
        $scope.setMapOnAll(null);
        for (i=0; i < cords.length; i++)
        {
        var contentString = '<div id="content">'+ 
                              '<h6>Type:</h6>' + 
                              cords[i].type + 
                              '<h6>Price:</h6>'+
                              cords[i].price + 
                              '<h6>Phone number:</h6>'+
                              cords[i].num + 
                              '<h6>Description:</h6>'+ '<p>' +
                              cords[i].desc +  '</p'+ 
                              '</div>';
          var pos = new google.maps.LatLng(cords[i].lat, cords[i].lon);
          if (cords[i].type === 'Rent')
          {
              markers.push(new google.maps.Marker({
              position: pos,
              animation: google.maps.Animation.DROP,
              icon: 'http://s33.postimg.org/yyun505of/rent_Marker1.png'
              //icon: '../img/buyMarker1.png' 
              //icon : 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png'  
            }));
          } else  if (cords[i].type === 'Sale'){
              markers.push(new google.maps.Marker({
              position: pos,
              animation: google.maps.Animation.DROP,
              icon: 'http://s33.postimg.org/lrgumnc8v/buy_Marker1.png'
             // icon: '../img/rentMarker1.png'  
            }));
          }
          infoWindow.push( new google.maps.InfoWindow({
          content: contentString
            }));
          
          google.maps.event.addListener(markers[i], 'click', (function(i) {
            return function() {
            infoWindow[i].open(map,markers[i]);
            }
          })(i));
        }
        $state.go('tab.map');
        }
        $scope.refreshMarkers(cords);
        $scope.setMapOnAll(map);
     });
 	 }, function(error) {
  	console.log("Could not get location");
  	});	  
   
    $scope.findMe = function () {
      map.setCenter(latLng);
    }  

     $scope.$watch(function () {
               return $rootScope.filteredObj;
                 }, 
                    function (newValue, oldValue) {
                    if (newValue !== oldValue) {
                      console.log($scope);
                      console.log('watch');                  
                      cords = $rootScope.filteredObj;
                      $scope.setMapOnAll(null);
                      $scope.removeMarkers();
                      $scope.refreshMarkers(cords);
                      $scope.setMapOnAll(map);
                    }
       });
  
})
.controller('PreferencesCtrl', function($scope, $filter,$location, $state, $rootScope,$timeout, HttpService, PrefService) {
	  HttpService.getCords().then( function(response) {
      $scope.cords = response.data;

        $scope.preferences = {};   
        $scope.updatePrefs = function (preferences) {
          PrefService.updatePrefs(preferences);
          $state.go('tab.map', {}, { reload: true });
          console.log(PrefService.getPrefs().type);
          $rootScope.filteredObj = $filter('filter')($scope.cords, {type: PrefService.getPrefs().type});
          console.log($rootScope);
        } 
      });
})

.service('HttpService',function ($http) {
  this.getCords = function () {
      return $http.get('http://localhost:3000/locations').then( function(response) {
        // console.log('Get Post', response);
         return response;
      });
    }
})
.service('PrefService', function (){
  return {
    preferences : {},
    updatePrefs :  function (preferences) {
      this.preferences = preferences;
    },
    getPrefs : function () {
      return this.preferences;
    }
  }   
})
.controller('AboutCtrl', function($scope) {

});
