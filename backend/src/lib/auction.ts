import { getUserById } from "../data/user";
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

    // TODO: Generate PDF for the winner

    const { fileKey, presignedUrl } = await handlePDFGenerationAndUpload(
      htmlContent,
      `invoice-${invoice._id}.pdf`
    );

    console.log({ fileKey, presignedUrl });

    await Invoice.updateOne({ _id: invoice._id }, { invoiceKey: fileKey });

    // TODO: Release funds for all bidders except the winner

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

        // TODO: Notify user about the released funds as auction has ended
        console.log(`Auto-bidding released funds for user ${config.userId}`);
        const autoBidUser = await getUserById(config.userId);
        // await sendMail(
        //   autoBidUser!.email,
        //   "Auto-Bid Funds Released",
        //   "autoBidFundsReleased",
        //   {
        //     USERNAME: autoBidUser?.name!,
        //     COMPANY_NAME: "Vintage Vault",
        //     ITEM_NAME: item.name,
        //     RELEASED_AMOUNT: itemBid.allocatedAmount.toString(),
        //   }
        // );
      }
    }

    sendEmailToWinner(highestBidder!.userId, item._id);
    console.log(`Auction ${item._id} has ended and awarded`);
    // TODO: Notify winner and other bidders
    // TODO: End auction
    // TODO: Use socket to notify all bidders viewing the items details page
  });
}

function sendEmailToWinner(userId: string, auction: string) {
  // TODO: Trigger email to winner
  console.log(`Email sent to user ${userId} for winning auction ${auction}`);
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
