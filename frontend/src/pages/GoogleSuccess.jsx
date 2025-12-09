import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

function GoogleSuccess() {
  const [params] = useSearchParams();

  useEffect(() => {
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      window.location.href = "/";
    }else{
      console.log("token not available for google auth");
    }
  }, [params]);

  return
}

export default GoogleSuccess;
