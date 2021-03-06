/**
 * Map.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    game: {
      type: 'string',
      required: true
    },
    name: {
      type: 'string',
      required: true
    },
    imageUrl: {
      type: 'string',
      required: true
    },
    baseGrid: {
      type: 'float',
      defaultsTo: 1
    },
    shared: {
      type: 'boolean',
      defaultsTo: false
    },
    tokens: {
      type: 'array',
      defaultsTo: []
    }
  }

};
