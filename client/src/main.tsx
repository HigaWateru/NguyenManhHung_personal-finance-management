import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider } from "react-router-dom"
import routers from "./routes"
import "flag-icons/css/flag-icons.min.css"
import "./index.css"
import { Provider } from "react-redux"
import { store } from "./redux/store"
import { LanguageProvider } from "./context/LanguageContext"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <LanguageProvider>
        <RouterProvider router={routers} />
      </LanguageProvider>
    </Provider>
  </StrictMode>
)