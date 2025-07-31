import { Outlet } from "react-router-dom";
import BrandHeader from "./BrandHeader";

const Layout = () => {
  return (
    <div className="dashboard">
      <div className="dashboard wrapper">
        <BrandHeader />
        <main className="grow">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
