import {
  ApolloServer,
  AuthenticationError,
  ApolloError,
} from 'apollo-server-lambda';
import { GraphQLClient } from 'graphql-request';
import { typeDefs } from './utils/schema';
import { allProjects, findProjectByID, projectByUserId } from './utils/queries';
import { updateProject, createProject, deleteProject } from './utils/mutations';
import { initSentry, resolversWrapper, objectMap } from './utils/errors';

initSentry();

const FAUNADB_API = 'https://graphql.fauna.com/graphql';

const client = new GraphQLClient(FAUNADB_API, {
  headers: {
    authorization: `Bearer ${process.env.FAUNADB_SERVER_SECRET}`,
  },
});

const resolvers = {
  Query: {
    allProjects: async () => {
      const response = await client.request(allProjects);
      return { data: response.allProjects.data.reverse() };
    },
    myProjects: async (_, variables, { user }) => {
      if (!user) {
        throw new AuthenticationError('Not Logged In');
      }
      const { userId } = user;
      const response = await client.request(projectByUserId, { userId });
      return { data: response.projectsByUserId.data };
    },
    findProjectByID: async (_, variables) => {
      const response = await client.request(findProjectByID, variables);
      if (!response.findProjectByID) {
        throw new ApolloError('Project not found');
      }
      return response.findProjectByID;
    },
  },
  Mutation: {
    updateProject: async (_, variables, { user }) => {
      if (!user) {
        throw new AuthenticationError('Not Logged In');
      }
      const { userId: loggedInUserId, userName } = user;
      const { id, data } = variables;

      const {
        findProjectByID: { userId },
      } = await client.request(findProjectByID, { id });

      if (loggedInUserId !== userId) {
        throw new AuthenticationError('Not authorized');
      }

      const response = await client.request(updateProject, {
        id,
        data: {
          ...data,
          userId: loggedInUserId,
          userName,
        },
      });
      return response.updateProject;
    },
    createProject: async (_, variables, { user }) => {
      if (!user) {
        throw new AuthenticationError('Not Logged In');
      }
      const { userId, userName } = user;
      const { data } = variables;
      const dateCreated = Date.now() * 1000;
      const response = await client.request(createProject, {
        data: {
          ...data,
          userId,
          userName,
          dateCreated,
        },
      });
      return response.createProject;
    },
    deleteProject: async (_, variables, { user }) => {
      if (!user) {
        throw new AuthenticationError('Not Logged In');
      }
      const { userId: loggedInUserId } = user;
      const { id } = variables;

      const {
        findProjectByID: { userId },
      } = await client.request(findProjectByID, { id });

      if (loggedInUserId !== userId) {
        throw new AuthenticationError('Not authorized');
      }

      const response = await client.request(deleteProject, { id });
      return response.deleteProject;
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers: objectMap(resolvers, resolversWrapper),
  context: async ({ context }) => {
    const { user } = context.clientContext || {};
    if (!user) return { user: null };

    const { sub: userId, user_metadata } = user;
    const userName = user_metadata.full_name;
    return { user: { userId, userName } };
  },
});

exports.handler = server.createHandler();
