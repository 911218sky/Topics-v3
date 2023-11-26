import React, { useEffect, memo } from "react";

const SystemTitle: React.FC = () => {
  const handleVisibilityChange = () => {
    if (!document.hidden) document.title = "AEUST";
    else document.title = "Σ( ° △ °|||)";
  };

  useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null;
};

export default memo(SystemTitle);
