import React, { useState } from "react";
import Intro from "./components/Intro";
import Experience from "./components/Experience";
import About from "./components/About";
import Research from "./components/Research";
import Publications from "./components/Publications";
import SelectedProjects from "./components/SelectedProjects";
import NavBar from "./components/NavBar";
import SidebarNav from "./components/SidebarNav";
import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import "./App.css";
import "./styles/Global.css";

const getSystemTheme = () => (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");

function App() {
  const { pathname } = useLocation();
  const [theme, setTheme] = useState(getSystemTheme);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
    const syncWithSystem = () => setTheme(getSystemTheme());
    mediaQuery.addEventListener("change", syncWithSystem);
    return () => mediaQuery.removeEventListener("change", syncWithSystem);
  }, []);

  return (
    <div className="App">
      <NavBar
        theme={theme}
        onThemeToggle={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
      />
      <SidebarNav />
      <div id="content">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Intro />
                <About />
                <Experience />
                <Research />
                <Publications />
                <SelectedProjects />
              </>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;
