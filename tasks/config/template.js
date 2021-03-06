module.exports = function(grunt) {

  var parentArg = grunt.option('parent'),
    name = grunt.option('name'),
    parent = parentArg ? parentArg + '/' : '',
    componentPath = 'assets/js/components/' + parent + name + '/',
    files = {};

  files[componentPath + '_' + name + '.scss'] = ['tasks/templates/componentTemplate/_component.scss.tpl'];
  files[componentPath + name + '.js'] = ['tasks/templates/componentTemplate/component.js.tpl'];
  files[componentPath + name + '.Spec.js'] = ['tasks/templates/componentTemplate/component.Spec.js.tpl'];
  files[componentPath + name + 'Component.js'] = ['tasks/templates/componentTemplate/componentComponent.js.tpl'];
  files[componentPath + name + 'Template.html'] = ['tasks/templates/componentTemplate/componentTemplate.html.tpl'];

  grunt.config.set('template', {
    component: {
      options: {
        data: {
          name: name,
          path: parentArg ? '/' + parentArg : ''
        }
      },
      files: files
    },
    dev_localjs: {
      options: {
        data: {
          db_host: '172.18.0.2',
          prod: false
        }
      },
      files: {
        'config/local.js': ['tasks/templates/local.js.tpl']
      }
    },
    prod_localjs: {
      options: {
        data: {
          db_host: 'localhost',
          prod: true
        }
      },
      files: {
        'config/local.js': ['tasks/templates/local.js.tpl']
      }
    }
  });

  grunt.loadNpmTasks('grunt-template');

};
