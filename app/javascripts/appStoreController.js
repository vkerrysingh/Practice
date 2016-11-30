var app = angular.module('appStoreApp',[]);

app.config(function ($locationProvider) {
    $locationProvider.html5Mode(true);
});

app.controller("appStoreController", ['$scope','$location','$http','$q', '$window', '$timeout', function($scope , $location, $http, $q, $window, $timeout){
    
    $scope.addProduct = function(newId, newName, newPrice){
      
        AppStore.deployed()
        .addProduct(
            newId,
            newName,
            newPrice,
            {from:account}
        )
        .then(function(tx){
            return web3.eth.getTransactionReceiptMined(tx);
        })
        .then(function(receipt){
            console.log("product added");
        });
        
    };
    
}]);