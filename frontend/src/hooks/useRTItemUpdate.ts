import { useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { GetItemDetailsResponse } from "@/services/itemService";

export const SocketBidUpdateSchema = z.object({
  itemId: z.string(),
  highestBidder: z.string().optional(),
  bidCount: z.number(),
  currentPrice: z.number(),
  bid: z.object({
    _id: z.string(),
    user: z.object({
      _id: z.string(),
      name: z.string(),
    }),
    timestamp: z.string(),
    isAutoBid: z.boolean(),
    amount: z.number(),
  }),
});

export type SocketBidUpdate = z.infer<typeof SocketBidUpdateSchema>;

export function useRealtimeItemUpdates(itemId: string) {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    const handleBidUpdate = (data: SocketBidUpdate) => {
      console.log(data);
      try {
        const validatedData = SocketBidUpdateSchema.parse(data);

        queryClient.setQueryData(
          ["getItemDetails", itemId],
          (oldData: GetItemDetailsResponse) => {
            if (!oldData) return oldData;

            return {
              ...oldData,
              item: {
                ...oldData.item,
                highestBidder: validatedData.highestBidder,
                currentPrice: validatedData.currentPrice,
                bids: [validatedData.bid._id, ...(oldData.item.bids || [])],
                bidCount: validatedData.bidCount,
              },
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
