const { ApolloClient } = require('apollo-client')
const { createHttpLink } = require('apollo-link-http')
const { InMemoryCache } = require('apollo-cache-inmemory')
// import fetch from ‘node-fetch’;
const fetch  = require('node-fetch');
// Instantiate required constructor fields
const cache = new InMemoryCache()
const customFetch = (uri, options) => {
  options.headers['x-hasura-admin-secret'] = 'pT5MNFT7F9iaInKPrdVgiDp9OpcgW0QDwnDc4ZkYYKw3nXGFm5fr8j3PpsAQAuzO'
   // process.env.HASURA_GRAPHQL_ADMIN_SECRET
  return fetch(uri, options)
}
// const link = createHttpLink({
//   uri: ‘http://0.0.0.0:8080/v1/graphql’,
//   fetch,
// })
const link = createHttpLink({
    uri: 'https://evident-cobra-76.hasura.app/v1/graphql',
    fetch: customFetch,
  })
const client = new ApolloClient({
  // Provide required constructor fields
  cache,
  link,
  //version: ‘1.3’,
//   queryDeduplication: false,
//   defaultOptions: {
//     watchQuery: {
//       fetchPolicy: 'no-cache',
//       errorPolicy: 'ignore',
//     },
//     query: {
//       fetchPolicy: 'no-cache',
//       errorPolicy: 'all',
//     },
//   },
})
module.exports = client