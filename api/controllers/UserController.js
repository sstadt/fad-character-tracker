/*jslint node: true*/
/*globals User, FlashService, RegistrationService, Token*/

/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var generalErrors = sails.config.notifications.General.error,
  userErrors = sails.config.notifications.User.error,
  userSuccesses = sails.config.notifications.User.success,
  tokenErrors = sails.config.notifications.Token.error,
  q = require('q');

module.exports = {

  'new': function (req, res) {
    res.view({
      title: sails.config.globals.pageTitle.register,
      script: 'public'
    });
  },

  show: function (req, res) {
    res.view({ title: 'My Profile' });
  },

  setHandle: function (req, res) {
    req.session.User.chatHandle = req.param('handle');

    User.update(req.session.User.id, req.session.User, function (err, user) {
      if (err) {
        res.serverError(err);
      }

      res.send(200);
    });
  },

  verify: function (req, res) {
    Token.findOne({ token: req.param('token') }, function (err, token) {
      if (err) {
        res.jsonError(tokenErrors.notFound);
      } else if (!token) {
        res.jsonError(userErrors.cannotVerify);
      } else {
        User.update(token.user, { confirmed: true }, function (err) {
          console.log(err);
          if (err) {
            res.jsonError(userErrors.cannotVerify);
          }

          Token.destroy(token.id, function () {
            res.json({ message: userSuccesses.verified, redirect: '/home' });
          });
        });
      }
    });
  },

  create: function (req, res) {
    var userObj = {
      email: req.param('email'),
      chatHandle: req.param('handle'),
      password: req.param('password'),
      confirmation: req.param('confirmation'),
    };

    if (PasswordService.isSecure(userObj.password, userObj.confirmation)) {
      User.create(userObj, function userCreated(err, user) {
        if (err) {
          var errorMsg = userErrors.cannotCreateUser;

          if (err.code === 'E_VALIDATION') {
            if (err.message.indexOf('already exists')) {
              errorMsg = (err.message.indexOf('chatHandle') > -1) ? userErrors.duplicateChatHandle : userErrors.duplicateEmail;
            } else {
              errorMsg = 'There are invalid fields';
            }
          }

          res.jsonError(errorMsg);
        } else {
          RegistrationService.generateValidationEmail(user)
            .then(function resolve() {
              res.json({ redirect: '/home' });
            }, function reject(err) {
              res.jsonError(userErrors.cannotRegister);
            });
        }
      });
    } else {
      res.jsonError(PasswordService.getLastError());
    }
  },

  resend: function (req, res) {
    User.findOne({ email: req.param('email') }, function (err, user) {
      if (err || !user) {
        res.jsonError(userErrors.notFound);
      } else {
        Token.destroy({ user: user.id }, function (err) {
          if (err) {
            res.jsonError(tokenErrors.cannotResendValidation);
          } else {
            RegistrationService.generateValidationEmail(user)
              .then(function resolve() {
                res.json({ success: true });
              }, function reject(err) {
                console.log(err); // TODO: this error needs dev attention
                res.jsonError(userErrors.cannotRegister);
              });
          }
        });
      }

    });
  },

  sendResetEmail: function (req, res) {
    User.findOne({ email: req.param('email') }, function (err, user) {
      if (err || user === undefined) {
        res.jsonError(userErrors.notFound);
      } else {
        RegistrationService.generateResetEmail(user)
          .then(function resolve() {
            res.json({ success: true });
          }, function reject(err) {
            res.jsonError(userErrors.cannotResetPassword);
          });
      }
    });
  },

  resetPassword: function (req, res) {
    var token = req.param('token') || '',
      password = req.param('password'),
      confirmation = req.param('confirm');

    RegistrationService.validateResetToken(token)
      .then(function resolve(user) {
        // password is secure according to configured rules
        if (PasswordService.isSecure(password, confirmation)) {
          PasswordService.resetPassword(password, user)
            .then(function resolve() {
              req.session.authenticated = true;
              req.session.User = user.toJSON();
              res.json({
                success: true,
                message: userSuccesses.passwordReset
              });
            }, function reject(err) {
              res.jsonError(userErrors.cannotResetPassword);
            });

        // password is not secure
        } else {
          res.jsonError(PasswordService.getLastError());
        }

      }, function reject(err) {
        res.jsonError(err);
      });
  },

  self: function (req, res) {
    // TODO: check to see if the user is already subscribed
    User.subscribe(req.socket, req.session.User.id);
    res.json(req.session.User);
  },

  search: function (req, res) {
    User.find({
      id: { '!': req.session.User.id },
      email: { startsWith: req.param('email') }
    }, function userFound(err, users) {
      if (err) {
        res.serverError(err);
      }

      res.json(users.map(function (user) {
        return user.toJSON();
      }));
    });
  },

  uploadPhoto: function (req, res) {
    req.file('file').upload(function (err, file) {
      var fileName = req.session.User.id + file[0].filename,
        filePath = 'profile_pictures/' + fileName,
        oldAvatar = req.session.User.config.avatar,
        fileSearch = /profile_pictures\/.+$/.exec(oldAvatar),
        oldFilePath = _.isArray(fileSearch) ? fileSearch[0] : false;

      // namespace the image to the user
      file[0].filename = fileName;

      if (err) {
        res.jsonError(generalErrors.cannotUploadFile);
      } else {
        S3Service.upload(file[0], 'profile_pictures')
          .then(function success(url) {
            return UserService.updateAvatar(req, url);
          })
          .then(function success() {
            if (oldFilePath !== false && oldFilePath !== filePath) {
              return S3Service.remove(oldFilePath);
            } else {
              return q.resolve();
            }
          })
          .then(function success() {
            res.send(200);
          }, function error(err) {
            res.jsonError(err);
          });
      }
    });
  }
};
