'use strict';

const { nodeDefinitions, fromGlobalId } = require('graphql-relay');
const { videoType } = require('..');
const { getObjectById } = require('./data');

const { nodeInterface, nodeField } = nodeDefinitions(
  (globalId) => {
    const { type, id } = fromGlobalId(globalId);
    return getObjectById(type, id);
  },
  (object) => {
    const { videoType } = require('..');
    if (object.title) {
      return videoType;
    }
    return null;
  },
);

module.exports = { nodeInterface, nodeField };
