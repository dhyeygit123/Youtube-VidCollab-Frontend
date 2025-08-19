
import React, { useState, useEffect } from "react";
import { Alert, AlertDescription } from '@/components/ui/alert';


// Alert Component
function CustomAlert({ message, type }) {
  const [visible, setVisible] = useState(!!message);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!visible || !message) return null;

  return (
    <Alert className={`mb-6 border-l-4 ${
      type === 'success' 
        ? 'border-l-green-500 bg-green-50 text-green-800 border-green-200' 
        : 'border-l-red-500 bg-red-50 text-red-800 border-red-200'
    }`}>
      <AlertDescription className="font-medium">
        {message}
      </AlertDescription>
    </Alert>
  );
}

export default CustomAlert;