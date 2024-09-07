import { getSocket } from ".";

export type UpdateBidViaSocketData = {
  itemId: string;
  highestBidder: string;
  bidCount: number;
  currentPrice: number;
  bid: {
    _id: string;
    user: {
      _id: string;
      name: string;
    };
    timestamp: Date;
    isAutoBid: boolean;
    amount: number;
  };
};

export const updateBidViaSocket = (data: UpdateBidViaSocketData) => {
  const io = getSocket();
  io.emit(data.itemId, data);
};
