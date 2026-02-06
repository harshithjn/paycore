import { useState } from "react";
import api from "../api/axios";

const MerchantRegister = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    businessName: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const register = async () => {
    try {
      const res = await api.post("/merchant/register", form);
      setMessage(res.data.message);
    } catch {
      setMessage("Registration failed");
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Merchant Registration</h2>

      <input
        name="name"
        placeholder="Name"
        onChange={handleChange}
      /><br />

      <input
        name="email"
        placeholder="Email"
        onChange={handleChange}
      /><br />

      <input
        name="businessName"
        placeholder="Business Name"
        onChange={handleChange}
      /><br />

      <button onClick={register}>Register</button>

      <p>{message}</p>
    </div>
  );
};

export default MerchantRegister;
