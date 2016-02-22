
define([
  'constants',
  'text!./promptTemplate.html'
], function (constants, promptTemplate) {

  return {
    template: promptTemplate,
    props: {
      name: {
        type: String,
        required: true
      },
      label: {
        type: String,
        required: true,
        twoWay: true
      }
    },
    data: function () {
      return {
        promptValue: '',
        show: false
      };
    },
    watch: {
      label: function (val) {
        if (val !== '') {
          this.show = true;
        }
      }
    },
    methods: {
      submit: function () {
        this.$dispatch(constants.events.prompt.valueSubmitted, { name: this.name, value: this.promptValue });
        this.show = false;
        this.promptValue = '';
      },
      cancel: function () {
        var self = this;

        self.show = false;
        
        setTimeout(function () {
          self.label = '';
        }, 300);
      }
    }
  };

});
