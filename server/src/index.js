import express from "express";
import cors from "cors";

// multer for image handling
import multer from "multer";

import { index } from "./controllers/index.controller.js";
import {
  deleteRecipe,
  getRecipe,
  getRecipes,
  patchRecipe, 
  postRecipe
} from "./controllers/recipes.controller.js";

// express
const app = express();
app.use(express.json());

// cors
app.use(cors());

// multer
const upload = multer({ dest: "src/uploads"});

const PORT = process.env.PORT || 3000;

// MIDDLEWARE para habilitar CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://127.0.0.1:5500");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// GET
app.get("/api", index);
app.get("/", index);

app.get("/api/recipes", getRecipes);
app.get("/api/recipes/:id", getRecipe);

// POST
app.post("/api/recipes", upload.single("img"), postRecipe);

// PATCH
app.patch("/api/recipes/:id", patchRecipe);

// DELETE
app.delete("/api/recipes/:id", deleteRecipe);

// NOT FOUND
app.use((req, res, next) => {
  res.status(404).json({
    message: "Endpoint not found."
  })
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}...`);
})