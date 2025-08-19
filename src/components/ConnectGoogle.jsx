import React, { useState } from "react";
import { Button } from "@/components/ui/button";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function ConnectGoogle() {
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/google/connect`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // redirect to Google
      } else {
        alert("Failed to get Google auth URL");
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleConnect} 
      disabled={loading}
      className="bg-red-500 hover:bg-red-600 text-white w-full"
    >
      {loading ? "Connecting..." : "Connect Google Account"}
    </Button>
  );
}

export default ConnectGoogle;
