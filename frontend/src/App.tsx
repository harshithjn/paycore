import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import MerchantRegister from "./pages/MerchantRegister";
import MerchantLogin from "./pages/MerchantLogin";

function App() {
  return (
    <Router>
      <nav style={{ padding: "20px", borderBottom: "1px solid #ccc" }}>
        <Link to="/register" style={{ marginRight: "10px" }}>Register</Link>
        <Link to="/login">Login</Link>
      </nav>
      <Routes>
        <Route path="/register" element={<MerchantRegister />} />
        <Route path="/login" element={<MerchantLogin />} />
        <Route path="/" element={<MerchantLogin />} />
      </Routes>
    </Router>
  );
}

export default App;
