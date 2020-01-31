import React, { StrictMode } from "react"
import ReactDOM from "react-dom"
import App from "./components/root/App"
import {
  ThemeProvider,
  ColorModeProvider,
  CSSReset,
  theme,
} from "@chakra-ui/core"
import { ApolloProvider } from "@apollo/react-hooks"
import { HelmetProvider } from "react-helmet-async"
import ApolloClient from "apollo-boost"
import * as serviceWorker from "./serviceWorker"
import customIcons from "./assets/icons"

const client = new ApolloClient({
  uri:
    process.env.NODE_ENV === "production"
      ? "/graphql"
      : "http://localhost:3001/graphql",
})

const customTheme = { ...theme, icons: { ...theme.icons, ...customIcons } }

ReactDOM.render(
  <StrictMode>
    <HelmetProvider>
      <ApolloProvider client={client}>
        <ThemeProvider theme={customTheme}>
          <ColorModeProvider>
            <CSSReset />
            <App />
          </ColorModeProvider>
        </ThemeProvider>
      </ApolloProvider>
    </HelmetProvider>
  </StrictMode>,
  document.getElementById("root")
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()