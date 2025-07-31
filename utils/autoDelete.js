import cron from "node-cron";
import { User } from "../models/usersModel.js";

const startDeletion = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      console.log("Cron job running at: ", new Date().toISOString());
      const now = new Date();

      const usersToDelete = await User.find({
        isDeleted: true,
        $or: [
          {
            deletedBy: "admin",
            deletedAt: {
              $lte: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
            },
          },
          {
            deletedBy: "user",
            deletedAt: {
              $lte: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
            },
          },
        ],
      }).limit(100);

      for (const user of usersToDelete) {
        if (user.accountType === "super admin") {
          const activeSuperAdmins = await User.countDocuments({
            accountType: "super admin",
            isDeleted: false,
            _id: { $ne: user._id },
          });

          if (activeSuperAdmins === 0) {
            console.log(`Skipped deletion of last super admin: ${user.email}`);
            continue;
          }
        }

        await User.deleteOne({ _id: user._id });
        console.log(
          `Deleted user: ${user.email} (deleted by: ${user.deletedBy})`
        );
      }
    } catch (e) {
      console.error("Encountered an error while deleting:", e);
    }
  });
};

export default startDeletion;
