

define([
  'q',
  'io',
  'constants'
], function (q, io, constants) {
  return {
    roll: function (roll) {
      var deferred = q.defer();

      io.socket.get(constants.endpoints.dice.roll, roll, function (response) {
        if (response.err) {
          deferred.reject('There was an error rolling.');
        } else {
          deferred.resolve(response);
        }
      });

      return deferred.promise;
    }
  };
});
