
var Vue = require('vue');

var constants = require('../config/constants.js');
var Character = require('../classes/Character.js');

require('../components/common/common.js');
require('../components/characterList/characterList.js');
require('../components/characterCreator/characterCreator.js');
require('../components/starWarsCrawl/starWarsCrawl.js');

var characterListEvents = {};

Vue.config.debug = true;

var characters = [
  { name: 'Luke Skywalker' },
  { name: 'Han Solo' },
  { name: 'Chewbacca' },
  { name: 'General Organa' },
  { name: 'Poe Dameron' },
  { name: 'Rae' },
  { name: 'Finn' }
].map(function (character) {
  return new Character(character);
});

characterListEvents[constants.events.characterCreator.addCharacter] = function () {
  this.characters.push(this.newCharacter);
  this.newCharacter = new Character();
};

new Vue({
  el: '#sandbox',
  data: {
    showCrawl: false
  }
});

new Vue({
  el: '#characterList',
  data: {
    newCharacter: new Character(),
    characters: characters,
    show: false
  },
  events: characterListEvents
});
