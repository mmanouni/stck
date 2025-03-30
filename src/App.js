import React from "react";
import { Routes, Route } from "react-router-dom";
import ParentComponent from "./ParentComponent";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<ParentComponent />} />
    </Routes>
  );
};

export default App;
