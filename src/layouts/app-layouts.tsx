import React from "react";
import Sidebar from "../components/Sidebar";

type AppLayoutsProps = {
  children?: React.ReactNode;
};

const AppLayouts = ({ children }: AppLayoutsProps) => {
  return (
    <div className="flex items-start justify-start h-screen">
      <Sidebar />
      {children}
    </div>
  );
};

export default AppLayouts;
