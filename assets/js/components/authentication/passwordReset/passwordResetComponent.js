
var http = require('../../../lib/util.http.js');
var config = require('../../../lib/config.js');

var FieldSet = require('../../../classes/FieldSet.js');
var Service = require('../../../classes/Service.js');

var requestRules = {
  email: {
    required: true,
    pattern: 'email'
  }
};

var resetRules = {
  password: {
    required: true
  },
  confirm: {
    required: true,
    matches: 'password',
    mismatchError: 'Passwords must match'
  }
};

module.exports = {
  template: require('./passwordResetTemplate.html'),
  props: {
    token: {
      type: String,
      defaultsTo: ''
    }
  },
  data: function () {
    return {
      requestForm: new FieldSet(requestRules),
      resetForm: new FieldSet(resetRules),
      authService: new Service({ schema: config.endpoints.auth })
    };
  },
  created() {
    var self = this;
    self.requestForm.init(self, 'requestForm');
    self.resetForm.init(self, 'resetForm');
  },
  methods: {
    setView(view) {
      this.$emit('set-view', view);
    },
    requestReset() {
      var self = this,
        deferred = q.defer();

      if (self.requestForm.isValid()) {
        self.authService.requestReset({ email: self.requestForm.fields.email.value })
          .then(function success() {
            self.$refs.resetAlert.success('Please check your email to finish resetting your password');
          }, function error(reason) {
            self.$refs.resetAlert.error(reason.err);
          })
          .done(function () {
            deferred.resolve();
          });
      } else {
        deferred.resolve();
      }

      return deferred.promise;
    },
    submitReset() {
      var self = this,
        token = self.token,
        password = self.resetForm.fields.password.value,
        confirm = self.resetForm.fields.confirm.value,
        deferred = q.defer();

      if (self.resetForm.isValid()) {
        self.authService.resetPassword({ token, password, confirm })
          .then(function success() {
            self.$refs.resetDialog.open();
          }, function error(reason) {
            self.$refs.resetAlert.error(reason.err);
          })
          .done(function () {
            deferred.resolve();
          });
      } else {
        deferred.resolve();
      }

      return deferred.promise;
    },
    redirect() {
      http.setLocation('/home');
    }
  }
};
