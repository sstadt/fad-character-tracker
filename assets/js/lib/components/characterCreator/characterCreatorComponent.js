
/**
 * 
 * character-creator
 * ----------------------------
 *
 * Builds a wizard for character creation from steps.
 * 
 */

define([
  'constants',
  'vue',
  'class/Character',
  'text!./characterCreatorTemplate.html',
  './steps/stepTemplates',
  './steps/personaEditor/personaEditor',
  './steps/classEditor/classEditor',
  './steps/attributesEditor/attributesEditor'
], function (constants, Vue, Character, characterCreatorTemplate, stepTemplates) {
  'use strict';

  var characterCreatorEvents = {},
    firstStep = 'persona';

  function ChangeStep(newStep) {
    this.currentStep = newStep;
  }

  function CloseCharacterCreator(reset) {
    this.currentStep = firstStep;
    this.show = false;
    return true; // allow event propagation to continue
  }

  function generateStepComponent(template, data) {
    return {
      template: template,
      props: {
        character: {
          type: Object,
          required: true,
          twoWay: true
        }
      },
      data: function () { return data; },
      methods: {
        changeStep: function (step) {
          this.$dispatch(constants.events.characterCreator.changeTab, step);
        },
        addCharacter: function () {
          this.$dispatch(constants.events.characterCreator.addCharacter);
        }
      }
    };
  }

  characterCreatorEvents[constants.events.characterCreator.changeTab] = ChangeStep;
  characterCreatorEvents[constants.events.characterCreator.addCharacter] = CloseCharacterCreator;

  return {
    template: characterCreatorTemplate,
    events: characterCreatorEvents,
    props: {
      character: {
        type: Object,
        required: true,
        twoWay: true
      }
    },
    data: function () {
      return {
        show: false,
        currentStep: firstStep
      };
    },
    components: {
      persona: generateStepComponent(stepTemplates.persona, { next: 'attributes' }),
      attributes: generateStepComponent(stepTemplates.attributes, { next: 'class', prev: 'persona' }),
      class: generateStepComponent(stepTemplates.class, { prev: 'attributes', last: true })
    },
    methods: {
      changeStep: ChangeStep,
      startCharacterCreator: function (reset) {
        if (reset && reset === true) this.character = new Character();
        this.show = true;
      }
    }
  };

});