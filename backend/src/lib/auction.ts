import Bid from "../models/bid.model";
import Item from "../models/item.model";

export async function checkAuctionsStatus() {
  console.log("Running auction status check every 1 minute");
  const now = new Date();

  // Find all the auction items that have ended and are yet not rewarded.
  const endedAuctions = await Item.find({
    auctionEndTime: { $lte: now },
    awarded: false,
  });

  endedAuctions.forEach(async (item) => {
    const highestBidder = await Bid.findById(item.highestBid);
    await Item.updateOne(
        { _id: item._id },
        { $set: { awarded: true } }
    );

    // TODO: Trigger email to winner
    sendEmailToWinner(highestBidder!.userId, item._id);
    // TODO: Release funds for all bidders except the winner
    // TODO: Update item status
    console.log(`Auction ${item._id} has ended and awarded`);
    // TODO: Notify winner and other bidders
    // TODO: End auction
    // TODO: Use socket to notify all bidders viewing th items details page

  });
}


function sendEmailToWinner(userId: string, auction: string ) {
  // Send email logic here
  console.log(
    `Email sent to user ${userId} for winning auction ${auction}`
  );
}