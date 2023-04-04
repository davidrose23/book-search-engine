const express = require('express');
const path = require('path');
const db = require('./config/connection');
const { ApolloServer } = require('apollo-server-express');
const { typeDefs, resolvers } = require('./schemas');
const { authMiddleware } = require('./utils/auth');

const app = express();
const PORT = process.env.PORT || 3001;

async function startApolloServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      // get the user token from the headers
      const token = req.headers.authorization || '';

      // try to retrieve a user with the token
      const user = getUser(token);

      // add the user to the context
      return { user };
    },
  });

  await server.start();

  // apply the Apollo Server middleware to the Express server
  server.applyMiddleware({ app });

  await new Promise(resolve => app.listen({ port: PORT }, resolve));
  console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
}

startApolloServer();

// Define a function to get the user from the JWT token
function getUser(token) {
  try {
    if (token) {
      // decode the token
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      return data;
    }
    return null;
  } catch (err) {
    console.log('Invalid token');
    return null;
  }
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// apply the authentication middleware to all GraphQL requests
app.use('/graphql', authMiddleware);

db.once('open', () => {
  console.log('MongoDB database connection established successfully');
});
