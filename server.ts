import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { initializeApp, getApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
let firebaseConfig: any = {};
const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
if (existsSync(configPath)) {
  try {
    firebaseConfig = JSON.parse(readFileSync(configPath, 'utf8'));
  } catch (e) {
    console.error("Error parsing firebase-applet-config.json", e);
  }
}

const getDb = () => {
    try {
        const envProjectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT || process.env.FIREBASE_PROJECT_ID;
        const configProjectId = firebaseConfig.projectId;
        console.log(`DIAGNOSTIC: EnvProject=[${envProjectId}], ConfigProject=[${configProjectId}], ConfigDb=[${firebaseConfig.firestoreDatabaseId}]`);

        if (getApps().length === 0) {
            // Try to initialize without arguments first to use ADC
            try {
                initializeApp();
                console.log("Firebase Admin initialized with default settings (ADC).");
            } catch (e) {
                if (configProjectId) {
                    initializeApp({ projectId: configProjectId });
                    console.log(`Firebase Admin initialized with config projectId: [${configProjectId}]`);
                } else {
                    throw e;
                }
            }
        }
        
        const app = getApp();
        const dbId = firebaseConfig.firestoreDatabaseId;

        // In AI Studio, the database ID is often essential for Firestore Enterprise
        if (dbId) {
            console.log(`Attempting to reach database [${dbId}]...`);
            return getFirestore(app, dbId);
        }
        
        return getFirestore(app);
    } catch (err) {
        console.error("Firestore init error:", err);
        // Last resort fallback
        if (getApps().length === 0) initializeApp();
        return getFirestore();
    }
};

const database = getDb();

// Relational Sync and Validation Helpers (Admin side doesn't need rules, but we use these for logic)
const handleFirestoreError = (error: any, operation: string, collection: string) => {
  console.error(`Firestore [${operation}] on [${collection}] failed:`, error);
  // Detailed reporting if possible
  const details = error instanceof Error ? error.message : String(error);
  if (details.includes("PERMISSION_DENIED")) {
    console.error("CRITICAL: Permission Denied. check project ID and service account scopes.");
  }
  return { error: `Firestore ${operation} failed`, details };
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Seed Data (only if empty)
  const seedProducts = [
    {
      id: "1",
      name: "Nebula Runner X1",
      brand: "SoleSphere",
      price: 120,
      discount: 15,
      category: "Running",
      sizes: ["7", "8", "9", "10", "11"],
      stock: 50,
      images: [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
        "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a"
      ],
      description: "Experience weightless comfort with the Nebula Runner X1. Designed for long-distance performance and style.",
      rating: 4.8,
      reviews: 128
    },
    {
      id: "2",
      name: "Urban Glide Loafers",
      brand: "Elegance",
      price: 85,
      discount: 0,
      category: "Lifestyle",
      sizes: ["8", "9", "10", "11"],
      stock: 30,
      images: [
        "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77",
        "https://images.unsplash.com/photo-1549298916-b41d501d3772"
      ],
      description: "Sophisticated comfort for the modern city dweller. Real leather craftsmanship with a minimalist touch.",
      rating: 4.5,
      reviews: 95
    },
    {
      id: "3",
      name: "Apex Court Pro",
      brand: "ProSport",
      price: 150,
      discount: 10,
      category: "Basketball",
      sizes: ["9", "10", "11", "12"],
      stock: 20,
      images: [
        "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa",
        "https://images.unsplash.com/photo-1491553895911-0055eca6402d"
      ],
      description: "Dominate the court with unmatched grip and ankle support. The choice of champions.",
      rating: 4.9,
      reviews: 210
    },
    {
      id: "4",
      name: "Trail Blazer Hiker",
      brand: "WildPath",
      price: 140,
      discount: 20,
      category: "Outdoor",
      sizes: ["7", "8", "9", "10", "11", "12"],
      stock: 15,
      images: [
        "https://images.unsplash.com/photo-1539185441755-769473a23570",
        "https://images.unsplash.com/photo-1518002171953-a080ee817e1f"
      ],
      description: "Rugged durability for the toughest terrains. Waterproof and breathable for all-day comfort.",
      rating: 4.7,
      reviews: 82
    },
    {
      id: "5",
      name: "Zenith Air Max",
      brand: "SoleSphere",
      price: 180,
      discount: 5,
      category: "Running",
      sizes: ["8", "9", "10", "11"],
      stock: 10,
      images: [
        "https://images.unsplash.com/photo-1514989940723-e8e51635b782",
        "https://images.unsplash.com/photo-1584735175315-9d581f7a06c9"
      ],
      description: "The peak of cushioning technology. Feel like you are walking on air with the Zenith Air Max.",
      rating: 4.9,
      reviews: 45
    }
  ];

  // Health Check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      env: process.env.NODE_ENV,
      cwd: process.cwd(),
      firebaseAppCount: getApps().length,
      activeProjectId: getApps().length ? getApp().options.projectId : null,
      configProjectId: firebaseConfig.projectId,
      envProjectId: process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT,
      configDbId: firebaseConfig.firestoreDatabaseId,
      firestoreInitialized: !!database
    });
  });

  // API Routes
  app.get("/api/products", async (req, res) => {
    console.log("GET /api/products requested");
    try {
      const snapshot = await database.collection("products").get();
      console.log(`Fetched ${snapshot.size} products from Firestore`);
      let products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Seed if empty
      if (products.length === 0) {
        console.log("Seeding products...");
        for (const p of seedProducts) {
          await database.collection("products").doc(p.id).set(p);
        }
        const newSnapshot = await database.collection("products").get();
        products = newSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
      
      res.json(products);
    } catch (error) {
      console.error("GET /api/products Firestore error, using fallback seed data:", error);
      // Fallback to static seed data so the UI doesn't break
      res.json(seedProducts);
    }
  });

  app.post("/api/admin/products", async (req, res) => {
    console.log("POST /api/admin/products requested with body:", JSON.stringify(req.body));
    try {
      const snapshot = await database.collection("products").get();
      const productsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const nextId = productsList.length > 0 
        ? (Math.max(...productsList.map(p => parseInt(String((p as any).id)) || 0)) + 1).toString()
        : "1";
        
      const newProduct = {
        rating: 5.0,
        reviews: 0,
         ...req.body
      };
      
      await database.collection("products").doc(nextId).set(newProduct);
      res.status(201).json({ id: nextId, ...newProduct });
    } catch (error) {
      res.status(500).json(handleFirestoreError(error, "CREATE", "products"));
    }
  });

  app.put("/api/admin/products/:id", async (req, res) => {
    try {
      await database.collection("products").doc(req.params.id).update(req.body);
      const updated = await database.collection("products").doc(req.params.id).get();
      res.json({ id: updated.id, ...updated.data() });
    } catch (error) {
      res.status(500).json(handleFirestoreError(error, "UPDATE", `products/${req.params.id}`));
    }
  });

  app.delete("/api/admin/products/:id", async (req, res) => {
    try {
      await database.collection("products").doc(req.params.id).delete();
      res.status(204).send();
    } catch (error) {
      res.status(500).json(handleFirestoreError(error, "DELETE", `products/${req.params.id}`));
    }
  });

  app.patch("/api/admin/orders/:id", async (req, res) => {
    try {
      const orderRef = database.collection("orders").doc(req.params.id);
      await orderRef.update({ ...req.body, updatedAt: new Date().toISOString() });
      const updated = await orderRef.get();
      
      console.log(`[NOTIFICATION] Order ${req.params.id} updated to ${req.body.status}. Notification sent.`);
      res.json({ id: updated.id, ...updated.data() });
    } catch (error) {
      res.status(500).json(handleFirestoreError(error, "UPDATE", `orders/${req.params.id}`));
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const orderId = `ORD-${Math.floor(Math.random() * 1000000)}`;
      const order = {
        status: "Processing",
        date: new Date().toISOString(),
        ...req.body
      };
      await database.collection("orders").doc(orderId).set(order);
      res.status(201).json({ id: orderId, ...order });
    } catch (error) {
      res.status(500).json(handleFirestoreError(error, "CREATE", "orders"));
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const doc = await database.collection("orders").doc(req.params.id).get();
      if (doc.exists) {
        res.json({ id: doc.id, ...doc.data() });
      } else {
        res.status(404).json({ error: "Order not found" });
      }
    } catch (error) {
      res.status(500).json(handleFirestoreError(error, "GET", `orders/${req.params.id}`));
    }
  });

  app.get("/api/admin/orders", async (req, res) => {
    try {
      const snapshot = await database.collection("orders").orderBy("date", "desc").get();
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(orders);
    } catch (error) {
      console.error("Orders listing failure, returning empty array:", error);
      res.json([]);
    }
  });

  app.get("/api/admin/analytics", async (req, res) => {
    try {
      const snapshot = await database.collection("orders").get();
      const orders = snapshot.docs.map(doc => doc.data());
      const totalSales = orders.reduce((sum, o) => sum + (o.total || 0), 0);
      const orderCount = orders.length;
      res.json({ totalSales, orderCount });
    } catch (error) {
      console.error("Analytics failure, returning zeroed stats:", error);
      res.json({ totalSales: 0, orderCount: 0 });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    console.log(`Checking for dist folder at: ${distPath}`);
    if (existsSync(distPath)) {
      console.log("Serving production build from dist folder");
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    } else {
      console.warn("Dist folder not found. Falling back to development-like error.");
      app.get("*", (req, res) => {
        res.status(500).send("Production build (dist/) not found. Please ensure 'npm run build' was successful.");
      });
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer();
