import express from "express";

const router = express.Router();

router.get("/stats", (req, res) => {
  res.json({ data: "Inventory stats" });
});

router.get("/category-stats", (req, res) => {
  res.json({ data: "Category stats" });
});

router.get("/details/:id", (req, res) => {
  const { id } = req.params;
  res.json({ data: `Details for inventory ID: ${id}` });
});

export default router;
