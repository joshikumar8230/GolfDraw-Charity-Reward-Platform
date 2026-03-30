import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";
import multer from "multer";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT;
const SECRET = process.env.SECRET;

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// ✅ Razorpay instance
const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});


const supabase = createClient(supabaseUrl, supabaseKey);

// ✅ AUTH MIDDLEWARE
function authMiddleware(req, res, next) {
  const token = req.headers.authorization;

  if (!token) return res.status(401).send("No token");

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).send("Invalid token");
  }
}

// ✅ CREATE ORDER
app.post("/create-order", authMiddleware, async (req, res) => {
  try {
    const { plan } = req.body;

    const amount = plan === "yearly" ? 10000 : 1000;

    const options = {
      amount: amount * 100, // ₹ → paise
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    res.json({
      orderId: order.id,
      amount: order.amount,
      key: RAZORPAY_KEY_ID, // ✅ send to frontend
    });

  } catch (err) {
    console.error("CREATE ORDER ERROR:", err);
    res.status(500).json({ error: "Order creation failed" });
  }
});

// ✅ VERIFY PAYMENT
app.post("/verify-payment", authMiddleware, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
    } = req.body;

    // 🔐 Verify signature
    const generated_signature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: "Invalid payment",
      });
    }

    // ✅ PAYMENT SUCCESS → SUBSCRIPTION LOGIC
    const userId = req.user.userId;

    let durationDays = plan === "yearly" ? 365 : 30;
    let amount = plan === "yearly" ? 10000 : 1000;

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + durationDays);

    // ✅ Update user
    const { error: userError } = await supabase
      .from("users")
      .update({
        subscription_plan: plan,
        subscription_start: startDate,
        subscription_end: endDate,
        is_active: true,
      })
      .eq("id", userId);

    if (userError) {
      return res.status(400).json({ error: userError.message });
    }

    // ✅ Insert subscription
    const { error: subError } = await supabase
      .from("subscriptions")
      .insert([
        {
          user_id: userId,
          plan,
          amount,
          start_date: startDate,
          end_date: endDate,
          status: "active",
        },
      ]);

    if (subError) {
      return res.status(400).json({ error: subError.message });
    }

    res.json({ success: true });

  } catch (err) {
    console.error("VERIFY ERROR:", err);
    res.status(500).json({ success: false });
  }
});

// ✅ SIGNUP
app.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "username and password required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { error } = await supabase
      .from("users")
      .insert([{ username, password: hashedPassword }]);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: "User created successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


// ✅ LOGIN
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // 🔍 Find user
    const { data: users, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (!users || users.length === 0) {
      return res.status(400).json({ error: "User not found" });
    }

    const user = users[0];

    // 🔐 Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password" });
    }

    // 🔐 Generate token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      "mysecretkey",
      { expiresIn: "1d" }
    );

    // 🔥 ADMIN FLOW
    if (user.role === "admin") {
      return res.json({
        token,
        role: "admin",
      });
    }

    // 🔥 CHECK SUBSCRIPTION
    const now = new Date();
    let isActive = false;

    if (user.subscription_end && new Date(user.subscription_end) > now) {
      isActive = true;
    }

    // 🔄 Optional: update DB if expired
    if (!isActive && user.is_active) {
      await supabase
        .from("users")
        .update({ is_active: false })
        .eq("id", user.id);
    }

    // ✅ FINAL RESPONSE
    res.json({
      token,
      role: user.role,
      is_active: isActive,
      charity_id: user.charity_id, // 🔥 IMPORTANT
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});



app.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    // 🔹 Get user + charity name
    const { data: user, error: userError } = await supabase
      .from("users")
      .select(`
        *,
        charities (
          name
        )
      `)
      .eq("id", userId)
      .single();

    if (userError) {
      return res.status(400).json({ error: userError.message });
    }

    // 🔹 Get scores (latest 5)
    const { data: scores } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    // 🔹 Get current draw
    const currentMonth = new Date().toISOString().slice(0, 7);

    const { data: draw } = await supabase
      .from("draws")
      .select("*")
      .eq("draw_month", currentMonth)
      .single();

    res.json({
      user,
      scores,
      draw
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/add-score", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { score } = req.body;

    if (score < 1 || score > 45) {
      return res.status(400).send("Score must be 1–45");
    }

    // ✅ Get current scores count
    const { data: currentScores, error: fetchError } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true }); // oldest first

    if (fetchError) {
      console.error(fetchError);
      return res.status(400).json({ error: fetchError.message });
    }

    // ✅ If 5 or more, delete oldest
    if (currentScores.length >= 5) {
      const oldest = currentScores[0]; // first element is oldest
      const { error: deleteError } = await supabase
        .from("scores")
        .delete()
        .eq("id", oldest.id);

      if (deleteError) {
        console.error(deleteError);
        return res.status(400).json({ error: deleteError.message });
      }
    }

    // ✅ Insert new score
    const { error: insertError } = await supabase
      .from("scores")
      .insert([
        {
          user_id: userId,
          score,
        },
      ]);

    if (insertError) {
      console.error(insertError);
      return res.status(400).json({ error: insertError.message });
    }

    res.json({ message: "Score added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});


app.get("/scores", authMiddleware, async (req, res) => {
  const userId = req.user.userId;

  const { data, error } = await supabase
    .from("scores")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

function generateNumbers() {
  let set = new Set();

  while (set.size < 5) {
    set.add(Math.floor(Math.random() * 45) + 1);
  }

  return Array.from(set);
}

function getMatchCount(userScores, drawNumbers) {
  let count = 0;

  for (let num of drawNumbers) {
    if (userScores.includes(num)) {
      count++;
    }
  }

  return count;
}

app.post("/admin/create-draw", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).send("Access denied");
    }

    const drawMonth = new Date().toISOString().slice(0, 7);
    const numbers = generateNumbers();

    const now = new Date().toISOString();

    // 🔥 1. Get active subscriptions
    const { data: subs, error: subError } = await supabase
      .from("subscriptions")
      .select("amount")
      .eq("status", "active")
      .gt("end_date", now);

    if (subError) {
      return res.status(400).json({ error: subError.message });
    }

    // 🔥 2. Calculate total pool
    const totalPool = subs.reduce((sum, s) => sum + Number(s.amount), 0);

    // 🔥 3. Split pools
    const pool_5 = totalPool * 0.4;
    const pool_4 = totalPool * 0.35;
    const pool_3 = totalPool * 0.25;

    function getMatchCount(userScores, drawNumbers) {
  let match = 0;

  userScores.forEach((s) => {
    if (drawNumbers.includes(s.score)) {
      match++;
    }
  });

  return match;
}

    // 🔥 4. Insert draw
    const { error } = await supabase
      .from("draws")
      .insert([
        {
          draw_month: drawMonth,
          numbers,
          total_pool: totalPool,
          pool_5,
          pool_4,
          pool_3,
          status: "pending",
        },
      ]);

    if (error) return res.status(400).json({ error: error.message });

    res.json({
      message: "Draw created",
      numbers,
      totalPool,
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});



app.post("/admin/run-draw", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    // ✅ 1. Get latest draw
    const { data: draws, error: drawError } = await supabase
      .from("draws")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1);

    if (drawError) {
      return res.status(400).json({ error: drawError.message });
    }

    const drawData = draws?.[0];

    if (!drawData) {
      return res.status(400).json({
        error: "No draw found. Create a draw first.",
      });
    }

    if (drawData.status === "completed") {
      return res.status(400).json({
        error: "Draw already completed.",
      });
    }

    const drawNumbers = drawData.numbers;

    // ✅ 2. Get active users
    const { data: users, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("is_active", true);

    if (userError) {
      return res.status(400).json({ error: userError.message });
    }

    let winners = [];

    // ✅ 3. Calculate matches
    for (let user of users) {
      const { data: scores } = await supabase
        .from("scores")
        .select("score")
        .eq("user_id", user.id);

      if (!scores || scores.length === 0) continue;

      const userScores = scores.map((s) => s.score);

      const matchCount = getMatchCount(userScores, drawNumbers);

      if (matchCount >= 3) {
        winners.push({
          user_id: user.id,
          match_count: matchCount,
        });
      }
    }

    // ✅ 4. Split winners
    const winners5 = winners.filter((w) => w.match_count === 5);
    const winners4 = winners.filter((w) => w.match_count === 4);
    const winners3 = winners.filter((w) => w.match_count === 3);

    // ✅ 5. Handle JACKPOT ROLLOVER
    let newJackpotCarry = drawData.jackpot_carry || 0;

    if (winners5.length === 0) {
      // ❌ No jackpot winner → rollover
      newJackpotCarry += drawData.pool_5;
      console.log("🔥 Jackpot rolled over:", newJackpotCarry);
    } else {
      // ✅ Winner exists → reset jackpot
      newJackpotCarry = 0;
    }

    // ✅ 6. Prize calculation
    const totalPool5 = drawData.pool_5 + (drawData.jackpot_carry || 0);

    const prize5 = winners5.length
      ? totalPool5 / winners5.length
      : 0;

    const prize4 = winners4.length
      ? drawData.pool_4 / winners4.length
      : 0;

    const prize3 = winners3.length
      ? drawData.pool_3 / winners3.length
      : 0;

    // ✅ 7. Insert winners
    for (let w of winners) {
      let prize = 0;

      if (w.match_count === 5) prize = prize5;
      if (w.match_count === 4) prize = prize4;
      if (w.match_count === 3) prize = prize3;

      await supabase.from("winners").insert([
        {
          user_id: w.user_id,
          draw_id: drawData.id,
          match_count: w.match_count,
          prize_amount: prize,
          status: "pending",
        },
      ]);
    }

    // ✅ 8. Mark current draw as completed
    await supabase
      .from("draws")
      .update({
        status: "completed",
        jackpot_carry: newJackpotCarry,
      })
      .eq("id", drawData.id);

    console.log("✅ Draw completed");

    res.json({
      message: "Draw completed successfully",
      winners,
      jackpot_carry: newJackpotCarry,
    });

  } catch (err) {
    console.error("RUN DRAW ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});


app.get("/results", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    // ✅ Get latest draw
    const { data: draws, error } = await supabase
      .from("draws")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const draw = draws?.[0];

    if (!draw) {
      return res.json({ status: "no_draw" });
    }

    // ✅ If draw not completed
    if (draw.status !== "completed") {
      return res.json({ status: "pending", draw });
    }

    // ✅ Get user scores
    const { data: scores } = await supabase
      .from("scores")
      .select("score")
      .eq("user_id", userId);

    // ✅ Get winner entry
    const { data: winner } = await supabase
      .from("winners")
      .select("*")
      .eq("user_id", userId)
      .eq("draw_id", draw.id)
      .maybeSingle(); 
    res.json({
      status: "completed",
      drawNumbers: draw.numbers,
      userScores: scores?.map(s => s.score) || [],
      winner: winner || null,
    });

  } catch (err) {
    console.error("RESULT ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/winnings", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data, error } = await supabase
      .from("winners")
      .select(`
        id,
        match_count,
        prize_amount,
        status,
        created_at,
        draws (
          numbers,
          draw_month
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("SUPABASE ERROR:", error);
      return res.status(400).json({ error: error.message });
    }

    res.json(data || []);

  } catch (err) {
    console.error("WINNINGS ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

const upload = multer({
  storage: multer.memoryStorage(), // 🔥 IMPORTANT
});

app.post("/upload-proof/:winnerId",
  authMiddleware,
  upload.single("proof"),
  async (req, res) => {
    try {
      const { winnerId } = req.params;

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const file = req.file;

      // ✅ Unique file name
      const fileName = `proof-${winnerId}-${Date.now()}`;

      // ✅ Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("Proof") // 👈 bucket name
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
        });

      if (uploadError) {
        console.error("UPLOAD ERROR:", uploadError);
        return res.status(400).json({ error: uploadError.message });
      }

      // ✅ Get public URL
      const { data } = supabase.storage
        .from("Proof")
        .getPublicUrl(fileName);

      const publicUrl = data.publicUrl;

      // ✅ Save URL in DB
      const { error: dbError } = await supabase
        .from("winners")
        .update({
          proof_url: publicUrl,
          status: "pending",
        })
        .eq("id", winnerId);

      if (dbError) {
        return res.status(400).json({ error: dbError.message });
      }

      res.json({
        message: "Proof uploaded successfully",
        url: publicUrl,
      });

    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

app.get("/admin/winners", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { data, error } = await supabase
      .from("winners")
      .select(`
        id,
        match_count,
        prize_amount,
        status,
        proof_url,
        created_at,
        users (
          username
        ),
        draws (
          draw_month,
          numbers
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);

  } catch (err) {
    console.error("ADMIN WINNERS ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/admin/approve-winner/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { error } = await supabase
      .from("winners")
      .update({ status: "approved" })
      .eq("id", req.params.id);

    if (error) throw error;

    res.json({ message: "Winner approved" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/admin/reject-winner/:id", authMiddleware, async (req, res) => {
  try {
    await supabase
      .from("winners")
      .update({
        status: "rejected",
        proof_url: null,
      })
      .eq("id", req.params.id);

    res.json({ message: "Winner rejected" });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/admin/pay-winner/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const winnerId = req.params.id;

    // ✅ Get winner
    const { data: winner, error } = await supabase
      .from("winners")
      .select("*")
      .eq("id", winnerId)
      .single();

    if (error || !winner) {
      return res.status(404).json({ error: "Winner not found" });
    }

    if (winner.status !== "approved") {
      return res.status(400).json({
        error: "Only approved winners can be paid",
      });
    }

    // 🔥 Simulate payment (fake transaction ID)
    const transactionId = "TXN_" + Date.now();

    // ✅ Update winner
    const { error: updateError } = await supabase
      .from("winners")
      .update({
        status: "paid",
        transaction_id: transactionId,
      })
      .eq("id", winnerId);

    if (updateError) throw updateError;

    res.json({
      message: "Payment successful",
      transactionId,
    });

  } catch (err) {
    console.error("PAY ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/admin/create-payout/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const winnerId = req.params.id;

    // ✅ Get winner
    const { data: winner, error } = await supabase
      .from("winners")
      .select("*")
      .eq("id", winnerId)
      .single();

    if (error || !winner) {
      return res.status(404).json({ error: "Winner not found" });
    }

    if (winner.status !== "approved") {
      return res.status(400).json({ error: "Winner not approved" });
    }

    // 💰 Create Razorpay order
    const order = await razorpay.orders.create({
      amount: winner.prize_amount * 100, // paise
      currency: "INR",
      receipt: "payout_" + Date.now(),
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      key: RAZORPAY_KEY_ID,
    });

  } catch (err) {
    console.error("CREATE PAYOUT ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/admin/verify-payout", authMiddleware, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      winner_id,
    } = req.body;

    const generated_signature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: "Invalid payment",
      });
    }

    // ✅ Mark as paid
    await supabase
      .from("winners")
      .update({ status: "paid" })
      .eq("id", winner_id);

    res.json({ success: true });

  } catch (err) {
    console.error("VERIFY PAYOUT ERROR:", err);
    res.status(500).json({ success: false });
  }
});

app.get("/admin/users", authMiddleware, async (req, res) => {
  try {
    // ✅ Only admin allowed
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { data, error } = await supabase
      .from("users")
      .select(`
        id,
        username,
        role,
        subscription_plan,
        subscription_start,
        subscription_end,
        is_active,
        charity_id,
        charity_percentage,
        charities (
          id,
          name
        )
      `)
      .eq("role", "user") // 🔥 IMPORTANT FIX
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);

  } catch (err) {
    console.error("ADMIN USERS ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/admin/charities", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    // ✅ Get all charities
    const { data: charities, error } = await supabase
      .from("charities")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // ✅ Combine users + donation
    const result = await Promise.all(
      charities.map(async (charity) => {

        // 🔹 Count users
        const { count } = await supabase
          .from("users")
          .select("*", { count: "exact", head: true })
          .eq("charity_id", charity.id);

        // 🔹 Get donation from charity_stats
        const { data: stats, error: statsError } = await supabase
          .from("charity_stats")
          .select("total_donation")
          .eq("charity_id", charity.id)
          .single();

        return {
          ...charity,
          total_users: count || 0,
          total_donation: stats?.total_donation || 0, // 🔥 FIXED
        };
      })
    );

    res.json(result);

  } catch (err) {
    console.error("CHARITY ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post(
  "/admin/create-charity",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Access denied" });
      }

      const { name, description } = req.body;

      if (!name || !description || !req.file) {
        return res.status(400).json({ error: "All fields required" });
      }

      const file = req.file;

      // ✅ unique file name
      const fileName = `charity-${Date.now()}-${file.originalname}`;

      // ✅ upload to Supabase bucket "charity"
      const { error: uploadError } = await supabase.storage
        .from("charity")
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
        });

      if (uploadError) {
        console.error(uploadError);
        return res.status(400).json({ error: uploadError.message });
      }

      // ✅ get public URL
      const { data } = supabase.storage
        .from("charity")
        .getPublicUrl(fileName);

      const image_url = data.publicUrl;

      // ✅ save to DB
      const { error } = await supabase
        .from("charities")
        .insert([
          {
            name,
            description,
            image_url,
          },
        ]);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ message: "Charity created successfully" });

    } catch (err) {
      console.error("CREATE CHARITY ERROR:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

app.get("/charities" , authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("charities")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data || []);
  } catch (err) {
    console.error("CHARITIES ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/select-charity", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { charity_id, percentage } = req.body;

    if (!charity_id) {
      return res.status(400).json({ error: "Charity required" });
    }

    // ✅ 1. Get user's latest subscription
    const { data: subData, error: subError } = await supabase
      .from("subscriptions")
      .select("amount")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (subError || !subData) {
      return res.status(400).json({ error: "No subscription found" });
    }

    const amount = subData.amount;
    const donation = (amount * (percentage || 10)) / 100;

    // ✅ 2. Save charity to user
    const { error: userError } = await supabase
      .from("users")
      .update({
        charity_id,
        charity_percentage: percentage || 10,
      })
      .eq("id", userId);

    if (userError) {
      return res.status(400).json({ error: userError.message });
    }

    // ✅ 3. Check if charity already has stats
    const { data: existing } = await supabase
      .from("charity_stats")
      .select("*")
      .eq("charity_id", charity_id)
      .single();

    if (existing) {
      // 🔥 Update existing total
      await supabase
        .from("charity_stats")
        .update({
          total_donation: existing.total_donation + donation,
          updated_at: new Date(),
        })
        .eq("charity_id", charity_id);
    } else {
      // 🔥 Insert new
      await supabase
        .from("charity_stats")
        .insert([
          {
            charity_id,
            total_donation: donation,
            updated_at: new Date(),
          },
        ]);
    }

    res.json({
      message: "Charity selected + donation recorded",
      donation,
    });

  } catch (err) {
    console.error("SELECT CHARITY ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/me", authMiddleware, async (req, res) => {
  const userId = req.user.userId;

  const { data, error } = await supabase
    .from("users")
    .select("username")
    .eq("id", userId)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.post("/change-password", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { oldPassword, newPassword } = req.body;

    // 🔥 Validate input
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        error: "Old password and new password are required",
      });
    }

    // 🔥 Get user from DB
    const { data: user, error } = await supabase
      .from("users")
      .select("password")
      .eq("id", userId)
      .single();

    if (error || !user) {
      return res.status(400).json({
        error: "User not found",
      });
    }

    // 🔥 Compare old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        error: "Old password is incorrect",
      });
    }

    // 🔥 Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 🔥 Update password
    const { error: updateError } = await supabase
      .from("users")
      .update({ password: hashedPassword })
      .eq("id", userId);

    if (updateError) {
      return res.status(400).json({
        error: updateError.message,
      });
    }

    res.json({
      message: "Password updated successfully",
    });

  } catch (err) {
    console.error("CHANGE PASSWORD ERROR:", err);
    res.status(500).json({
      error: "Server error",
    });
  }
});

app.get("/admin/latest-draw", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { data, error } = await supabase
      .from("draws")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return res.json(null);
    }

    res.json(data);

  } catch (err) {
    console.error("LATEST DRAW ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});