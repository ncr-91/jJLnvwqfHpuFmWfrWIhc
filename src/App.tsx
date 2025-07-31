import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Brand from "./pages/Brand";

// Lazy load the other pages
const Competitive = lazy(() => import("./pages/Competitive"));
const Category = lazy(() => import("./pages/Category"));

function App() {
  return (
    <Suspense fallback={null}>
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
