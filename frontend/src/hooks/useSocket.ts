import { SocketContext } from "@/providers/socket-provider";
import { useContext } from "react";

export const useSocket = () => useContext(SocketContext);
