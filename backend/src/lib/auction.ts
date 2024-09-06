import { getUserById } from "../data/user";
import Bid from "../models/bid.model";
import Invoice from "../models/invoice.model";
import Item from "../models/item.model";
import { loadPDFTemplate } from "../utils/pdfTemplateLoader";

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
    await Item.updateOne({ _id: item._id }, { $set: { awarded: true } });

    // TODO: Store invoice for the winner
    const invoice = await Invoice.create({
      itemId: item._id,
      userId: highestBidder!.userId,
      amount: highestBidder!.amount,
      bidId: highestBidder!._id,
    });

    const user = await getUserById(highestBidder!.userId);

    const htmlContent = await loadPDFTemplate("invoiceTemplate", {
      INVOICE_NUMBER: invoice._id,
      INVOICE_DATE: new Date().toLocaleDateString(),
      TOTAL_AMOUNT: highestBidder!.amount.toString(),
      ITEM_NAME: item.name,
      ITEM_AMOUNT: highestBidder!.amount.toString(),
      TO_NAME: user!.name,
    });

    // TODO: Generate PDF for the winner

    // TODO: Release funds for all bidders except the winner
    // TODO: Update item status (can't remember the whole idea behind this)
    // ???? item.status = "closed";  Unsure about this
    // ???? await item.save();
    sendEmailToWinner(highestBidder!.userId, item._id);
    console.log(`Auction ${item._id} has ended and awarded`);
    // TODO: Notify winner and other bidders
    // TODO: End auction
    // TODO: Use socket to notify all bidders viewing th items details page
  });
}

function sendEmailToWinner(userId: string, auction: string) {
  // TODO: Trigger email to winner
  console.log(`Email sent to user ${userId} for winning auction ${auction}`);
}
