'use strict';

// Messages controller
angular.module('messages').controller('MessagesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Messages',
	function($scope, $stateParams, $location, Authentication, Messages ) {
		$scope.authentication = Authentication;

		// Create new Message
		$scope.create = function() {
			// Create new Message object
			var message = new Messages ({
				name: this.name
			});

			// Redirect after save
			message.$save(function(response) {
				$location.path('messages/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Message
		$scope.remove = function( message ) {
			if ( message ) { message.$remove();

				for (var i in $scope.messages ) {
					if ($scope.messages [i] === message ) {
						$scope.messages.splice(i, 1);
					}
				}
			} else {
				$scope.message.$remove(function() {
					$location.path('messages');
				});
			}
		};

		// Update existing Message
		$scope.update = function() {
			var message = $scope.message ;

			message.$update(function() {
				$location.path('messages/' + message._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Messages
		$scope.find = function() {
			$scope.messages = Messages.query(function () {
        for (var key in $scope.messages) {
          if (isNaN(key)) continue;
          var msg = $scope.messages[key];
          var gravatarEmail = msg.authorEmail;
          if (msg.authorEmail === '')
            gravatarEmail = msg.data.signedData.author[0][0] + msg.data.signedData.author[0][1];
          msg.gravatar = CryptoJS.MD5(gravatarEmail).toString();
        }
			});
		};

		// Find existing Message
		$scope.findOne = function() {
			$scope.message = Messages.get({ 
				messageId: $stateParams.messageId
			}, function() {
        $scope.message.strData = JSON.stringify($scope.message.data, undefined, 2);
        $scope.message.authorGravatar = CryptoJS.MD5($scope.message.authorEmail||$scope.message.data.signedData.author[0][1]).toString();
        $scope.message.recipientGravatar = CryptoJS.MD5($scope.message.recipientEmail||$scope.message.data.signedData.recipient[0][1]).toString();
      });
		};
	}
]);
