import { createBrowserRouter, Navigate } from "react-router-dom"
import AppLayout from "../components/layout/AppLayout"
import DashboardPage from "../pages/dashboard/DashboardPage"
import CategoryPage from "../pages/category/CategoryPage"
import ExpensePage from "../pages/expense/ExpensePage"
import IncomePage from "../pages/income/IncomePage"
import ErrorPage from "../pages/error/ErrorPage"
import LoginPage from "../pages/login/LoginPage"
import OAuth2RedirectHandler from "../pages/login/OAuth2RedirectHandler"
import ProfilePage from "../pages/profile/ProfilePage"
import RegisterPage from "../pages/register/RegisterPage"
import StatisticsPage from "../pages/statistics/StatisticsPage"
import ForgotPasswordPage from "../pages/forgot-password/ForgotPasswordPage"
import { PublicOnly, RequireAuth } from "./guards"

const routers = createBrowserRouter([
  {
    element: <RequireAuth />,
    children: [
      {
        path: "/",
        element: <AppLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "income", element: <IncomePage /> },
          { path: "expense", element: <ExpensePage /> },
          { path: "category", element: <CategoryPage /> },
          { path: "statistics", element: <StatisticsPage /> },
          { path: "profile", element: <ProfilePage /> },
        ],
      },
    ],
  },
  {
    element: <PublicOnly />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
      { path: "/oauth2/redirect", element: <OAuth2RedirectHandler /> },
    ],
  },
  { path: "/404", element: <ErrorPage /> },
  { path: "*", element: <Navigate to="/404" replace /> },
])

export default routers