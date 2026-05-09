import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { routes } from "./data/routes";
import { NotFoundPage } from "./pages/NotFoundPage";

export function App() {
  return (
    <Layout>
      <Routes>
        {routes.map((route) => {
          const Page = route.component;
          return (
            <Route
              key={route.id}
              path={route.path}
              element={<Page route={route} />}
            />
          );
        })}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}
