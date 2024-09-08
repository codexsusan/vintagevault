import { getUserById } from "../data/user";
import { sendMail } from "../mail";
import AutoBidConfig from "../models/auto-bid.model";
import Bid from "../models/bid.model";
import Invoice from "../models/invoice.model";
import Item from "../models/item.model";
import { handlePDFGenerationAndUpload } from "../utils/invoicePdfGenerator";
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

    // Create invoice for the winner
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

    const { fileKey, presignedUrl } = await handlePDFGenerationAndUpload(
      htmlContent,
      `invoice-${invoice._id}.pdf`
    );

    await Invoice.updateOne({ _id: invoice._id }, { invoiceKey: fileKey });

    await sendMail(
      user?.email!,
      "Congratulations, You Won the Bid!",
      "emailToWinner",
      {
        USERNAME: user?.name!,
        ITEM_NAME: item.name,
        COMPANY_NAME: "Vintage Vault",
      }
    );

    // Track users who have already been notified via auto-bid
    const notifiedUsers = new Set<string>();

    const autoBidConfigs = await AutoBidConfig.find({
      "activeBids.itemId": item._id,
      userId: { $ne: highestBidder!.userId },
    });

    for (const config of autoBidConfigs) {
      const itemBid = config.activeBids.find(
        (bid) => bid.itemId === item._id.toString()
      );

      if (itemBid) {
        config.activeBids = config.activeBids.filter(
          (bid) => bid.itemId !== item._id.toString()
        );
        await config.save();

        const autoBidUser = await getUserById(config.userId);

        await sendMail(
          autoBidUser!.email,
          "Auction Ended - Funds Released",
          "fundReleased",
          {
            USERNAME: autoBidUser?.name!,
            ITEM_NAME: item.name,
            COMPANY_NAME: "Vintage Vault",
          }
        );

        // Add the user to the notified set
        notifiedUsers.add(config.userId);
      }
    }

    // Notify all manual bidders who didn't win, excluding those already notified
    const nonWinningBidders = await Bid.distinct("userId", {
      itemId: item._id,
      isAutoBid: false,
      userId: { $ne: highestBidder!.userId },
    });


    for (const bidderId of nonWinningBidders) {
      if (!notifiedUsers.has(bidderId)) {
        const bidder = await getUserById(bidderId);
        if (bidder) {
          await sendMail(
            bidder.email,
            "Auction Ended",
            "auctionEnded",
            {
              USERNAME: bidder.name,
              ITEM_NAME: item.name,
              COMPANY_NAME: "Vintage Vault",
            }
          );
        }
      }
    }
  });
}

// Function to release all funds for all bidders except the winner
const releaseAllAutoBidFunds = async (winnerId: string, itemId: string) => {
  const autoBidConfigs = await AutoBidConfig.find({
    "activeBids.itemId": itemId,
    userId: { $ne: winnerId },
    status: "active",
  }).sort({ createdAt: 1 });

  for (const config of autoBidConfigs) {
  }
};
