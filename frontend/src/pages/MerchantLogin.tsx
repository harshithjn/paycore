import { useState } from "react";
import api from "../api/axios";

const MerchantLogin = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const login = async () => {
    try {
      const res = await api.post("/merchant/login", form);
      setMessage("Login successful! Merchant ID: " + res.data.merchantId);
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.message) {
         setMessage("Login failed: " + error.response.data.message);
      } else {
         setMessage("Login failed");
      }
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Merchant Login</h2>

      <input
        name="email"
        placeholder="Email"
        onChange={handleChange}
      /><br />

      <input
        name="password"
        type="password"
        placeholder="Password"
        onChange={handleChange}
      /><br />

      <button onClick={login}>Login</button>

      <p>{message}</p>
    </div>
  );
};

export default MerchantLogin;
