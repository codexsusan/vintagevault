import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "./useSocket";
import { useEffect } from "react";
import { SocketBidUpdate, SocketBidUpdateSchema } from "./useRTItemUpdate";
import { GetItemBiddingHistoryResponse } from "@/services/itemService";

export function useRealTimeBiddingHistoryTableUpdate(itemId: string) {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    const handleBidUpdate = (data: SocketBidUpdate) => {
      console.log(data);
      try {
        const validatedData = SocketBidUpdateSchema.parse(data);

        queryClient.setQueryData(
          ["getItemBids", itemId],
          (oldData: GetItemBiddingHistoryResponse) => {
            if (!oldData) return oldData;

            return {
              ...oldData,
              data: [validatedData.bid, ...(oldData.data || [])],
            };
          }
        );
      } catch (error) {
        console.error("Invalid bid update data:", error);
      }
    };

    socket.on(itemId, handleBidUpdate);

    return () => {
      socket.off(itemId, handleBidUpdate);
    };
  }, [itemId, socket, queryClient]);
}
