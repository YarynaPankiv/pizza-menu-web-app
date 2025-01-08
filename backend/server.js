const express = require("express");
const admin = require("firebase-admin");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const serviceAccount = require("./serviceAccountKey.json");

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL:
      "https://pizza-web-app-default-rtdb.europe-west1.firebasedatabase.app/",
  });

  console.log("Firebase Admin initialized successfully.");
} catch (error) {
  console.error("Firebase Admin initialization failed:", error.message);
}

const auth = admin.auth();

app.post("/register", async (req, res) => {
  const { email, password, name, role = "client" } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    await admin.firestore().collection("users").doc(userRecord.uid).set({
      email,
      role,
      displayName: name,
    });

    res
      .status(201)
      .json({ message: "User registered successfully", user: userRecord });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/items", async (req, res) => {
  try {
    const pizzasRef = admin.firestore().collection("items");
    const snapshot = await pizzasRef.get();

    if (snapshot.empty) {
      return res.status(404).json({ message: "No items found." });
    }

    const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/add-item", async (req, res) => {
  const { name, description, price, imageUrl, category } = req.body;

  // Validate required fields
  if (!name || !description || !price || !category) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const pizzasRef = admin.firestore().collection("items");

    const newItem = {
      name,
      description,
      price: parseFloat(price),
      imageUrl: imageUrl || "",
      category,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await pizzasRef.add(newItem);

    res
      .status(201)
      .json({ message: "Item added successfully!", id: docRef.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = await auth.getUserByEmail(email);

    const userDoc = await admin
      .firestore()
      .collection("users")
      .doc(user.uid)
      .get();
    const userData = userDoc.exists ? userDoc.data() : null;

    if (!userData) {
      return res
        .status(404)
        .json({ error: "User data not found in Firestore" });
    }

    return res.status(200).json({
      message: "Login successful",
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: userData.role,
      },
    });
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(500).json({ error: error.message });
  }
});

app.post("/add-order", async (req, res) => {
  const { userId, items, total, contactInfo } = req.body;

  if (!userId || !items || !total || !contactInfo) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const ordersRef = admin.firestore().collection("orders");

    const newOrder = {
      userId,
      items,
      total: parseFloat(total),
      contactInfo,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    const docRef = await ordersRef.add(newOrder);

    res.status(201).json({
      message: "Order added successfully!",
      orderId: docRef.id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/orders", async (req, res) => {
  const { userId } = req.query; // Отримуємо userId з параметрів запиту

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const ordersRef = admin.firestore().collection("orders");
    const snapshot = await ordersRef.where("userId", "==", userId).get();

    if (snapshot.empty) {
      return res
        .status(404)
        .json({ message: "No orders found for this user." });
    }

    // Формуємо масив замовлень
    const orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/add-review", async (req, res) => {
  const { orderId, review, userId } = req.body;

  console.log("Incoming review data:", { orderId, review, userId }); // Debug log
  console.log("Request body:", req.body);

  if (!orderId || !review || !userId) {
    return res
      .status(400)
      .json({ error: "Order ID, review, and user ID are required" });
  }

  try {
    const reviewsRef = admin.firestore().collection("reviews");

    const newReview = {
      orderId,
      review,
      userId,
      reviewCreatedAt: new Date().toISOString(),
    };

    const docRef = await reviewsRef.add(newReview);

    console.log("Review added successfully with ID:", docRef.id); // Debug log
    res
      .status(200)
      .json({ message: "Review added successfully!", reviewId: docRef.id });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/reviews", async (req, res) => {
  try {
    const reviewsRef = admin.firestore().collection("reviews");

    const snapshot = await reviewsRef
      .orderBy("reviewCreatedAt", "desc")
      .limit(10)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ message: "No reviews found." });
    }

    const reviews = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const reviewData = doc.data();

        let user = null;
        if (reviewData.userId) {
          const userRef = admin
            .firestore()
            .collection("users")
            .doc(reviewData.userId);
          const userSnapshot = await userRef.get();
          if (userSnapshot.exists) {
            user = userSnapshot.data();
          }
        }

        return {
          id: doc.id,
          ...reviewData,
          user,
        };
      })
    );

    res.status(200).json({ reviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: error.message });
  }
});
app.get("/item/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const pizzaRef = admin.firestore().collection("items").doc(id);
    const doc = await pizzaRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "item not found." });
    }

    const item = { id: doc.id, ...doc.data() };
    res.status(200).json(item);
  } catch (error) {
    console.error("Error fetching items by ID:", error);
    res.status(500).json({ error: error.message });
  }
});

app.put("/item/:id", async (req, res) => {
  const { id } = req.params;
  const { name, description, price, imageUrl, category } = req.body;

  if (!name || !description || !price || !category) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const pizzaRef = admin.firestore().collection("items").doc(id);

    const doc = await pizzaRef.get();
    if (!doc.exists) {
      return res.status(404).json({ message: "items not found." });
    }

    await pizzaRef.update({
      name,
      description,
      price: parseFloat(price),
      imageUrl: imageUrl || "",
      category,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).json({ message: "item updated successfully!" });
  } catch (error) {
    console.error("Error updating items:", error);
    res.status(500).json({ error: error.message });
  }
});

app.delete("/item/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const pizzaRef = admin.firestore().collection("items").doc(id);

    await pizzaRef.delete();

    res.status(200).json({ message: "item deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.put("/user/:id", async (req, res) => {
  const { id } = req.params; // User ID from URL
  const { name, email } = req.body; // Data to update

  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required." });
  }

  try {
    // Update Firebase Authentication user
    await auth.updateUser(id, {
      email,
      displayName: name,
    });

    // Update Firestore user document
    const userRef = admin.firestore().collection("users").doc(id);
    await userRef.update({
      displayName: name,
      email,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Fetch the updated user data
    const updatedUserDoc = await userRef.get();
    const updatedUser = { uid: updatedUserDoc.id, ...updatedUserDoc.data() };

    res
      .status(200)
      .json({ message: "User updated successfully.", user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: error.message });
  }
});
const checkAdmin = async (req, res, next) => {
  const userId = req.headers.userid; // Отримуємо userId з заголовків запиту
  console.log(userId);
  if (!userId) {
    return res.status(400).json({ error: "User ID is required in headers." });
  }

  try {
    const userDoc = await admin
      .firestore()
      .collection("users")
      .doc(userId)
      .get();
    const userData = userDoc.exists ? userDoc.data() : null;

    if (userData && userData.role === "admin") {
      req.user = userData;
      next();
    } else {
      return res
        .status(403)
        .json({ error: "Доступ заборонено. Адміністративні права необхідні." });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Помилка сервера при перевірці ролі." });
  }
};
app.get("/all-orders", checkAdmin, async (req, res) => {
  try {
    const ordersRef = admin.firestore().collection("orders");
    const snapshot = await ordersRef.get();

    if (snapshot.empty) {
      return res.status(404).json({ message: "Немає замовлень." });
    }

    const orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/order/:id/status", checkAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Перевірка, чи надано статус
  if (!status) {
    return res.status(400).json({ error: "Статус замовлення є обов'язковим." });
  }

  // Перевірка допустимих статусів
  const allowedStatuses = ["pending", "completed", "canceled"];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: "Недопустимий статус замовлення." });
  }

  try {
    const orderRef = admin.firestore().collection("orders").doc(id);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return res.status(404).json({ error: "Замовлення не знайдено." });
    }

    await orderRef.update({
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).json({ message: "Статус замовлення успішно оновлено." });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: error.message });
  }
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
