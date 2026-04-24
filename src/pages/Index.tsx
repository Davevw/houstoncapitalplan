import { Navigate } from "react-router-dom";
import ITPHoustonCapitalPlan from "@/components/ITPHoustonCapitalPlan";

const SESSION_KEY = "itph_landing_unlocked";

const Index = () => {
  const unlocked = (() => {
    try {
      return sessionStorage.getItem(SESSION_KEY) === "true";
    } catch {
      return false;
    }
  })();

  if (!unlocked) {
    return <Navigate to="/" replace />;
  }
  return <ITPHoustonCapitalPlan />;
};

export default Index;
