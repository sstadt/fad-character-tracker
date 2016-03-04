
var Vue = require('Vue');
var alertComponent = require('./alertComponent.js');

Vue.config.silent = true;

describe('The alert component', function () {
  var component;

  beforeEach(function () {
    component = _.clone(alertComponent);
  });

  it('to be an object', function () {
    expect(component).toEqual(jasmine.any(Object));
  });

  it('should have a template', function () {
    expect(component.template).toEqual(jasmine.any(String));
  });

  describe('props', function () {
    describe('alert', function () {
      it('should exist', function () {
          expect(component.props.alert).toEqual(jasmine.any(Object));
      });

      it('should be a array', function () {
        expect(component.props.alert.type).toEqual(Object);
      });

      it('should be required', function () {
        expect(component.props.alert.required).toEqual(true);
      });

      it('should be a two way binding', function () {
        expect(component.props.alert.twoWay).toEqual(true);
      });
    });
  });

  describe('methods', function () {
    var componentInstance;

    beforeEach(function () {
      componentInstance = new Vue(component);
    });

    describe('#close', function () {
      it('should be a function', function () {
        expect(typeof componentInstance.close).toBe('function');
      });

      // it('should clear the messages in the alert', function () {
      //   componentInstance.alert.messages = ['test'];
      //   componentInstance.close();
      //
      //   expect(componentInstance.alert.messages).toEqual([]);
      // });
    });
  });

});