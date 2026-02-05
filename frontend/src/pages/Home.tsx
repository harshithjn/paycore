import { useState } from "react";
import api from "../api/axios";

const Home = () => {
  const [message, setMessage] = useState<string>("");

  const callBackend = async () => {
    try {
      const res = await api.get<string>("/health");
      setMessage(res.data);
    } catch (err) {
      setMessage("Backend not reachable");
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>UPI Payment Gateway Simulator</h1>
      <button onClick={callBackend}>Call Backend</button>
      <p>{message}</p>
    </div>
  );
};

export default Home;
