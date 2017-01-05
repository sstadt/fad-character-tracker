
// TODO: player invite
// TODO: player uninvite

var gameService = require('../../../services/gameService.js');

module.exports = {
  template: require('./playersMenuTemplate.html'),
  props: {
    game: {
      type: Object,
      required: true,
      twoWay: true
    }
  },
  data: function () {
    return {
      searching: false,
      filteredPlayers: []
    };
  },
  computed: {
    filterIcon: function () {
      return (this.searching) ? 'spinner fa-spin' : 'search';
    }
  },
  methods: {
    invitePlayer: function (player) {
      console.log('invite player method', player.chatHandle);
    },
    uninvitePlayer: function (player) {
      console.log('uninvite player method', player.chatHandle);
    },
    approvePlayer: function (player) {
      var self = this,
        deferred = q.defer();

      gameService.approvePlayer(self.game, player)
        .fail(function (reason) {
          self.$emit('error', reason);
          deferred.resolve();
        });

      return deferred.promise;
    },
    declinePlayer: function (player) {
      var self = this,
        deferred = q.defer();

      gameService.declinePlayer(self.game, player)
        .fail(function (reason) {
          self.$emit('error', reason);
          deferred.resolve();
        });

      return deferred.promise;
    },
    removePlayer: function (player) {
      var self = this,
        deferred = q.defer();

      gameService.removePlayer(self.game, player)
        .fail(function (reason) {
          self.$emit('error', reason);
          deferred.resolve();
        });

      return deferred.promise;
    }
  }
};
