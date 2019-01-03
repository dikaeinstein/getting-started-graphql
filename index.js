'use strict'
const express = require('express');
const graphqlHTTP = require('express-graphql');
const {
  globalIdField, connectionDefinitions,
  connectionFromPromisedArray,
  connectionArgs,
  mutationWithClientMutationId,
} = require('graphql-relay');
const {
  GraphQLID,
  GraphQLSchema,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLString,
  GraphQLObjectType,
  GraphQLNonNull,
} = require('graphql');
const { getVideoById, getVideos, createVideo } = require('./src/data');
const { nodeInterface, nodeField } = require('./src/node');

const app = express();

const videoType = new GraphQLObjectType({
  name: 'Video', 
  description: 'A video on Egghead.io',
  fields: {
    id: globalIdField(),
    title: {
      type: GraphQLString,
      description: 'The title of the video.',
    },
    duration: {
      type: GraphQLInt,
      description: 'The duration of the video (in seconds)',
    },
    watched: {
      type: GraphQLBoolean,
      description: 'Whether or not the viewer has watched the video.',
    },
  },
  interfaces: [nodeInterface],
});

const videoMutation = mutationWithClientMutationId({
  name: 'AddVideo',
  inputFields: {
    title: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The title of the video.',
    },
    duration: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The duration of the video (in seconds)',
    },
    watched: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'Whether or not the viewer has watched the video.',
    },
  },
  outputFields: {
    video: {
      type: videoType,
    },
  },
  mutateAndGetPayload: (args) => new Promise((resolve, reject) => {
    const video = createVideo(args);
    resolve({ video });
  }),
});

const mutationType = new GraphQLObjectType({
  name: 'Mutation',
  description: 'The root mutation',
  fields: {
    createVideo: videoMutation,
  },
});

const { connectionType: VideoConnection } = connectionDefinitions({
  nodeType: videoType,
  connectionFields: () => ({
    totalCount: {
      type: GraphQLInt,
      description: 'A count of the total number of objects in the connection.',
      resolve: conn => conn.edges.length 
    }
  })
});

const queryType = new GraphQLObjectType({
  name: 'QueryType',
  description: 'The root query type',
  fields: {
    node: nodeField,
    video: {
      type: videoType,
      description: 'The video type.',
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLID),
          description: 'The id of the video.',
        },
      },
      resolve: (_, args) => {
        return getVideoById(args.id);
      },
    },
    videos: {
      type: VideoConnection,
      description: 'A collection of videos.',
      args: connectionArgs,
      resolve: (_, args) => connectionFromPromisedArray(
        getVideos(),
        args,
      ),
    },
  },
});

const schema = new GraphQLSchema({
  query: queryType,
  mutation: mutationType,
});

app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true,
  formatError: error => ({
    message: error.message,
    locations: error.locations,
    stack: error.stack ? error.stack.split('\n') : [],
    path: error.path,
  }),
}));

module.exports = { app, videoType };
