
var config = require('../../lib/config.js');

var storageService = require('../../services/storageService.js');

var EncounterToken = require('../../classes/EncounterToken.js');

module.exports = {
  template: require('./encounterTemplate.html'),
  props: {
    game: {
      type: String,
      required: true
    },
    perRow: {
      type: Number,
      default: 5
    },
    npcs: {
      type: Array,
      default: []
    },
    avatarSize: {
      type: Number,
      default: 60
    },
    isGm: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      hovering: false,
      favorites: storageService.getLocal(config.localStorageKeys.npcFavorites, { defaultsTo: [], onUpdate: this.favoritesUpdated }),
      combatants: [],
      // combatants: [{
      //   name: 'Darth Vader',
      //   imageUrl: 'http://www.globalo.com/content/uploads/2015/12/darth-vader.jpg',
      //   woundThreshold: 20,
      //   currentWounds: 1,
      //   strainThreshold: 15,
      //   currentStrain: 0
      // }, {
      //   name: 'Elite Stormtrooper',
      //   imageUrl: 'https://www.sideshowtoy.com/photo_71803_thumb.jpg',
      //   woundThreshold: 13,
      //   currentWounds: 3,
      //   strainThreshold: 10,
      //   currentStrain: 5
      // }, {
      //   name: 'Scout Trooper',
      //   imageUrl: 'http://img1.starwars-holonet.com/holonet/dictionnaire/photos/org_bikerscout.jpg',
      //   woundThreshold: 13,
      //   currentWounds: 1
      // }, {
      //   name: 'Stormtrooper',
      //   imageUrl: 'http://cdn.movieweb.com/img.news.tops/NEM7yL5Oso5PPU_1_b.jpg',
      //   woundThreshold: 13,
      //   currentWounds: 1
      // }, {
      //   name: 'Stormtrooper',
      //   imageUrl: 'http://cdn.movieweb.com/img.news.tops/NEM7yL5Oso5PPU_1_b.jpg',
      //   woundThreshold: 13,
      //   currentWounds: 11
      // }, {
      //   name: 'Stormtrooper',
      //   imageUrl: 'http://cdn.movieweb.com/img.news.tops/NEM7yL5Oso5PPU_1_b.jpg',
      //   woundThreshold: 13,
      //   currentWounds: 8
      // }]
    };
  },
  computed: {
    encounterWidthPx() {
      var width = (this.avatarSize + 40) * this.perRow;
      return `${width}px`;
    },
    showMenu() {
      return this.combatants.length === 0 || this.hovering;
    }
  },
  methods: {
    enter() {
      this.hovering = true;
    },
    leave() {
      this.hovering = false;
    },
    favoritesUpdated(favorites) {
      this.favorites = favorites;
    },
    addCombatant(npc) {
      this.combatants.push(new EncounterToken(npc));
    },
    clearCombatants() {
      this.$refs.clearEncounterConfirm.open();
    },
    confirmClear(type) {
      if (type === 'ok') {
        this.combatants = [];
      }
    }
  }
};
