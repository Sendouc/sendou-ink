import { ApolloProvider } from "@apollo/react-hooks"
import { ChakraProvider, DarkMode } from "@chakra-ui/core"
import theme from "@chakra-ui/theme"
import { createHistory, LocationProvider } from "@reach/router"
import ApolloClient from "apollo-boost"
import React from "react"
import ReactDOM from "react-dom"
import { HelmetProvider } from "react-helmet-async"
import { QueryParamProvider } from "use-query-params"
import App from "./components/root/App"
import "./i18n"
import * as serviceWorker from "./serviceWorker"

const client = new ApolloClient({
  uri:
    process.env.NODE_ENV === "production"
      ? "/graphql"
      : "http://localhost:3001/graphql",
})

let history = createHistory(window as any)

ReactDOM.render(
  <LocationProvider history={history}>
    <QueryParamProvider reachHistory={history}>
      <HelmetProvider>
        <ApolloProvider client={client}>
          <ChakraProvider theme={theme} resetCSS>
            <DarkMode>
              <App />
            </DarkMode>
          </ChakraProvider>
        </ApolloProvider>
      </HelmetProvider>
    </QueryParamProvider>
  </LocationProvider>,
  document.getElementById("root")
)

serviceWorker.unregister()
