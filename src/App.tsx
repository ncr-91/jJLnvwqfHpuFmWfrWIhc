import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Brand from "./pages/Brand";

// Lazy load the other pages
const Competitive = lazy(() => import("./pages/Competitive"));
const Category = lazy(() => import("./pages/Category"));

// Component to handle path restoration after refresh
function PathRestorer() {
  const location = useLocation();
  
  useEffect(() => {
    // If we're on the login page and have a stored path, redirect to it
    if (location.pathname === "/" && sessionStorage.getItem("currentPath")) {
      const storedPath = sessionStorage.getItem("currentPath");
      if (storedPath && storedPath !== "/") {
        window.location.href = storedPath;
      }
    }
  }, [location]);

  return null;
}

function App() {
  return (
    <Suspense fallback={null}>
      <PathRestorer />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Layout />}>
          <Route index element={<Brand />} />
          <Route path="competitive" element={<Competitive />} />
          <Route path="category" element={<Category />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
