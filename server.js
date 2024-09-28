require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const db = require("./db");
const { createItemSchema, updateItemSchema } = require("./validators/item");

const app = express();
app.use(bodyParser.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.post("/articles", async (req, res) => {
  const id = Math.random().toString(36).substring(2, 12).toUpperCase();
  const newArticle = { id, ...req.body };

  try {
    await createItemSchema.validate(newArticle);
    db.query("INSERT INTO article SET ?", newArticle, (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.status(201).json({
        ...newArticle,
        ...(newArticle.price && {
          price: Number(newArticle.price.toFixed(2)),
        }),
      });
    });
  } catch (error) {
    return res.status(400).json({ message: error.errors });
  }
});

app.get("/articles", (req, res) => {
  db.query("SELECT * FROM article", (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

app.get("/articles/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM article WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0)
      return res.status(404).json({ message: "Articulo no encontrado" });
    res.json(results[0]);
  });
});

app.put("/articles/:id", async (req, res) => {
  const { id } = req.params;
  const { description, model } = req.body;

  const updatedArticle = { id, description, model };

  try {
    await updateItemSchema.validate(updatedArticle);
    db.query(
      "UPDATE article SET description = ?, model = ? WHERE id = ?",
      [description, model, id],
      (err, result) => {
        if (err) return res.status(500).json({ error: err });
        if (result.affectedRows === 0)
          return res.status(404).json({ message: "Articulo no encontrado" });
        res.json({ id, description, model });
      }
    );
  } catch (error) {
    return res.status(400).json({ message: error.errors });
  }
});

app.delete("/articles/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM article WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Articulo no encontrado" });
    res.status(204).send();
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running");
});
