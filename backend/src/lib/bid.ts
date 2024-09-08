import AutoBidConfig from "../models/auto-bid.model";
import Bid from "../models/bid.model";

export async function getAllBiddersForItem(
  itemId: string,
  currentUserId: string
): Promise<string[]> {
  // Fetch all manual bids for the item
  const manualBidders = await Bid.distinct("userId", {
    itemId: itemId,
    isAutoBid: false,
    userId: { $ne: currentUserId },
  });

  // Fetch all auto-bid configurations for the item
  const autoBidConfigs = await AutoBidConfig.find({
    "activeBids.itemId": itemId,
  });

  // Extract user IDs from auto-bid configurations
  const autoBidders = autoBidConfigs.map((config) => config.userId);

  // Combine and deduplicate
  const allBidders = new Set([...manualBidders, ...autoBidders]);

  return Array.from(allBidders);
}
