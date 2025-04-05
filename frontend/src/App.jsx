import { Outlet } from "react-router-dom";
import "./App.css";
import Navbar from "./components/NavBar/NavBar.jsx";
import SideBar from "./components/SideBar/SideBar.jsx";
import { useSelector } from "react-redux";

function App() {
  const { themeObject } = useSelector((state) => state.theme);
  return (
    <div className="App">
      <div>
        <Navbar />
        <main className="main__container flex h-[90vh]">
          <SideBar />
          <div
            className="main__pages overflow-auto"
            style={{ backgroundColor: themeObject.primary }}
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
