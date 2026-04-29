import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock Data
  let products = [
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

  let orders: any[] = [];

  // API Routes
  app.get("/api/products", (req, res) => {
    res.json(products);
  });

  app.post("/api/admin/products", (req, res) => {
    const nextId = products.length > 0 
      ? (Math.max(...products.map(p => parseInt(p.id) || 0)) + 1).toString()
      : "1";
      
    const newProduct = {
      id: nextId,
      rating: 5.0,
      reviews: 0,
       ...req.body
    };
    products.push(newProduct);
    res.status(201).json(newProduct);
  });

  app.put("/api/admin/products/:id", (req, res) => {
    const index = products.findIndex(p => p.id === req.params.id);
    if (index !== -1) {
      products[index] = { ...products[index], ...req.body };
      res.json(products[index]);
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  });

  app.delete("/api/admin/products/:id", (req, res) => {
    products = products.filter(p => p.id !== req.params.id);
    res.status(204).send();
  });

  app.patch("/api/admin/orders/:id", (req, res) => {
    const index = orders.findIndex(o => o.id === req.params.id);
    if (index !== -1) {
      const updatedOrder = { ...orders[index], ...req.body, updatedAt: new Date().toISOString() };
      orders[index] = updatedOrder;
      
      // Simulate Notification
      console.log(`[NOTIFICATION] Order ${req.params.id} updated to ${req.body.status}. Notification sent.`);
      
      res.json(updatedOrder);
    } else {
      res.status(404).json({ error: "Order not found" });
    }
  });

  app.post("/api/orders", (req, res) => {
    const order = {
      id: `ORD-${Math.floor(Math.random() * 1000000)}`,
      status: "Processing",
      date: new Date().toISOString(),
      ...req.body
    };
    orders.push(order);
    res.status(201).json(order);
  });

  app.get("/api/orders/:id", (req, res) => {
    const order = orders.find(o => o.id === req.params.id);
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ error: "Order not found" });
    }
  });

  app.get("/api/admin/orders", (req, res) => {
    res.json(orders);
  });

  app.get("/api/admin/analytics", (req, res) => {
    const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
    const orderCount = orders.length;
    res.json({ totalSales, orderCount });
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
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
