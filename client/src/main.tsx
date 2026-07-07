import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import routers from "./routes";
import { ConfigProvider, App as AntdApp } from "antd"; // bold
import viVN from "antd/locale/vi_VN"; // Ngôn ngữ Tiếng Việt
import "./index.css";
import "@fontsource/poppins/400.css";
import { Provider } from "react-redux";
import { store } from './redux/store/index'


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1677ff",
          fontFamily: ", sans-serif",
        },
      }}
      locale={viVN} // Thiết lập ngôn ngữ Tiếng Việt
    >
      <Provider store = {store}>
        <AntdApp>
          <RouterProvider router={routers} />
        </AntdApp>
      </Provider>
    </ConfigProvider>
  </StrictMode>
);