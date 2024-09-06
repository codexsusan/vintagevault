import { ConfettiContext } from "@/providers/confetti-provider";
import { useContext } from "react";

export const useConfetti = () => {
  const context = useContext(ConfettiContext);
  if (!context) {
    throw new Error("useConfetti must be used within a ConfettiProvider");
  }
  return context;
};
