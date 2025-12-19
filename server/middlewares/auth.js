// Middleware to check userID and has PremiumPlan

import { clerkClient } from "@clerk/express";

export const auth = async (req, res, next) => {
  try {
    if (!req.auth) {
      return res.status(401).json({ success: false, message: "Auth missing" });
    }

    const authData = await req.auth();
    const userId = authData.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    let hasPremiumPlan = false;

    if (authData.has) {
      hasPremiumPlan = await authData.has({ plan: "premium" });
    }

    const user = await clerkClient.users.getUser(userId);

    req.userId = userId;
    req.free_usage = user.privateMetadata?.free_usage ?? 0;
    req.plan = hasPremiumPlan ? "premium" : "free";

    next();
  } catch (error) {
    console.error("AUTH ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

