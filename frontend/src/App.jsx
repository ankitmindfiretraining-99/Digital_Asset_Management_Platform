import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import { FileUploader } from "./components/FileUploader";
import  Gallery  from "./components/Gallery"; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FileUploader />} />
        <Route path="/gallery" element={<Gallery />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
