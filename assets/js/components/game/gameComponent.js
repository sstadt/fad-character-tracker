
var userService = require('../../services/userService.js');
var gameService = require('../../services/gameService.js');
var socketHandler = require('./gameSocketHandler.js');

module.exports = {
  template: require('./gameTemplate.html'),
  props: {
    gameId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      // user data
      user: {},

      // game data
      game: {},
      gameLog: [],

      // crawl data
      selectedCrawlId: '',
      activeCrawl: {
        title: '',
        subtitle: '',
        crawl: '',
        image: '',
        show: false
      }

      // chat data
      // chatMessage: '',
      // isScrolledToBottom: true,

      // dice pool
      // rollDescription: '',
      // ability: 0,
      // proficiency: 0,
      // difficulty: 0,
      // challenge: 0,
      // boost: 0,
      // setback: 0,
      // force: 0
    };
  },
  components: {
    crawlMenu: require('./crawlMenu/crawlMenuComponent.js'),
    playersMenu: require('./playersMenu/playersMenuComponent.js'),
    settingsMenu: require('./settingsMenu/settingsMenuComponent.js')
  },
  computed: {
    userIsGameMaster() {
      return this.game.gameMaster && this.game.gameMaster.id === this.user.id;
    },
    crawlOptions() {
      var self = this,
        crawlOptions = [];

      if (self.game && self.game.crawls) {
        _.forEach(self.game.crawls, function (crawl) {
          if (crawl.published) {
            crawlOptions.push({
              value: crawl.id,
              label: crawl.title
            });
          }
        });
      }

      return crawlOptions;
    },
    selectedCrawl() {
      var self = this,
        index = _.findIndex(self.game.crawls, function (crawl) {
          return crawl.id === self.selectedCrawlId;
        });

      return index > -1 ? self.game.crawls[index] : null;
    },
    gameMasterIsOnline() {
      return this.game.online.indexOf(this.game.gameMaster.id) > -1;
    }
  },
  filters: {
    playerIsOnline(player) {
      return this.game.online.indexOf(player.id) > -1;
    }
  },
  created() {
    var self = this;

    // listen for game updates
    io.socket.on('game', function (message) {
      if (socketHandler.isValidMessage(message, self.game.id)) {
        if (socketHandler.player.hasOwnProperty(message.data.type)) {
          socketHandler.player[message.data.type](self.game, message.data.data, self.user);
        } else if (socketHandler.game.hasOwnProperty(message.data.type)) {
          socketHandler.game[message.data.type](self.game, message.data.data);
        } else if (socketHandler.gameLog.hasOwnProperty(message.data.type)) {
          socketHandler.gameLog[message.data.type](self.gameLog, message.data.data);

          // if this is a chat log message, adjust scrolling appropriately
          if (message.data.type === 'newLogMessage' && self.isScrolledToBottom) {
            Vue.nextTick(self.scrollChatToBottom);
          }
        }
      }
    });

    // get user data
    userService.getUserInfo()
      .then(function success(user) {
        self.user = user;
      });

    // get game data
    gameService.get(self.gameId)
      .then(function success(game) {
        self.game = game;
        self.initCrawlOptions();
      }, function error(reason) {
        return q.reject(reason);
      }).then(function () {
        return gameService.getLog(self.gameId);
      }).then(function success(log) {
        self.gameLog = log;
        // Vue.nextTick(self.scrollChatToBottom);
        self.$refs.gameAlert.close();
      }, function error(reason) {
        self.$refs.gameAlert.error(reason);
      });
  },
  methods: {
    closeMenu(type) {
      this.$refs[`${type}Dialog`].close();
    },
    openMenu(type) {
      this.$refs[`${type}Dialog`].open();
    },
    initCrawlOptions() {
      var self = this,
        crawlTimestamp = 0,
        crawlId,
        nextTimestamp;

      if (self.game.crawls.length > 0) {
        _.forEach(self.game.crawls, function (crawl) {
          nextTimestamp = moment(crawl.createdAt).valueOf();
          if (crawl.published && (!crawlId || nextTimestamp > crawlTimestamp)) {
            crawlId = crawl.id;
            crawlTimestamp = nextTimestamp;
          }
        });
      }

      if (crawlId) {
        self.selectedCrawlId = crawlId;
      }
    },
    playCrawl(crawl) {
      console.log(`playing crawl ${crawl.title}`);
      this.activeCrawl.title = crawl.title;
      this.activeCrawl.subtitle = crawl.subtitle;
      this.activeCrawl.crawl = crawl.crawl;
      this.activeCrawl.image = crawl.imageUrl;
      this.activeCrawl.show = true;
    },
    // sendChatMessage() {
    //   var self = this,
    //     deferred = q.defer();
    //
    //   if (self.chatMessage.length > 0) {
    //     gameService.sendMessage(self.game, self.chatMessage)
    //       .then(function success() {
    //         self.chatMessage = '';
    //         self.gameAlert.close();
    //       }, function error(reason) {
    //         self.gameAlert.error(reason);
    //       })
    //       .done(function () {
    //         deferred.resolve();
    //       });
    //   } else {
    //     deferred.resolve();
    //   }
    //
    //   return deferred.promise;
    // },
    // sendChatRoll() {
    //   var self = this,
    //     deferred = q.defer(),
    //     dicePool = {
    //       ability: self.ability,
    //       proficiency: self.proficiency,
    //       difficulty: self.difficulty,
    //       challenge: self.challenge,
    //       boost: self.boost,
    //       setback: self.setback,
    //       force: self.force
    //     };
    //
    //   gameService.sendRoll(self.game, self.rollDescription, dicePool)
    //     .then(function success() {
    //       self.rollDescription = '';
    //       self.gameAlert.close();
    //     }, function error(reason) {
    //       self.gameAlert.error(reason);
    //     })
    //     .done(function () {
    //       deferred.resolve();
    //     });
    //
    //   return deferred.promise;
    // },
    // scrollChatToBottom() {
    //   var self = this;
    //
    //   Vue.nextTick(function () {
    //     self.$els.chatLog.scrollTop = self.$els.chatLog.scrollHeight - self.$els.chatLog.offsetHeight;
    //   });
    // },
    // userScrolling(event) {
    //   this.isScrolledToBottom = this.$els.chatLog.offsetHeight + this.$els.chatLog.scrollTop === this.$els.chatLog.scrollHeight;
    // },
    crawlMusicEnded() {
      // TODO set open to false; watch open in crawl component and reset state
      // this.$broadcast(constants.events.game.crawlMusicEnded);
    }
  }
};
