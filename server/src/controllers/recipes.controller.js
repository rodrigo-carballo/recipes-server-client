import { pool } from "../db.js";

export const getRecipes = async (req, res) => {
  try {
    const [result] = await pool.query("SELECT * FROM recipes");
    res.json(result);
    
  } catch (error) {
    somethingWentWrong(res, error);
  }
};

export const getRecipe = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query("SELECT * FROM recipes WHERE id = ?", [id]);

    if (result.length === 0) {
      return recipeNotFound(res);
    }

    res.json(result);
    
  } catch (error) {
    somethingWentWrong(res, error);
  }
}

export const postRecipe = async (req, res) => {
  const { name, img, tags, prepTime, ingredients, prepProcess, notes } = req.body;

  try {
    const [result] = await pool.query(`
    INSERT INTO recipes (name, img, tags, prepTime, ingredients, prepProcess, notes) VALUES
      (IFNULL(?, ""), IFNULL(?, ""), IFNULL(?, ""), IFNULL(?, ""), IFNULL(?, ""), IFNULL(?, ""), IFNULL(?, ""))
    `, [name, img, tags, prepTime, ingredients, prepProcess, notes]);
  
    recipeCreated(res);
    
  } catch (error) {
    somethingWentWrong(res, error);
  }  
}

export const patchRecipe = async (req, res) => {
  const { id } = req.params;

  const { name, img, tags, prepTime, ingredients, prepProcess, notes } = req.body;
  
  try {
    const [response] = await pool.query(
      `UPDATE recipes SET
      name = IFNULL (?, name),
      img = IFNULL (?, img),
      tags = IFNULL (?, tags),
      prepTime = IFNULL (?, prepTime),
      ingredients = IFNULL (?, ingredients),
      prepProcess = IFNULL (?, prepProcess),
      notes = IFNULL (?, notes)
      WHERE id = ?`, [name, img, tags, prepTime, ingredients, prepProcess, notes, id]
    );
    
    if (response.affectedRows === 0) {
      return recipeNotFound(res);
    }
  
    recipeUpdated(res);
    
  } catch (error) {
    somethingWentWrong(res, error);
  }
}

export const deleteRecipe = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      `DELETE FROM recipes
      WHERE id = ?`, [id]
    );
  
    if (result.affectedRows === 0) {
      return recipeToDeleteNotFound(res);
    }
  
    recipeDeleted(res);
    
  } catch (error) {
    somethingWentWrong(res, error);
  }
}

// MESSAGES FUNCTIONS
const somethingWentWrong = (res, error) => {
  res.status(500).json({
    message: "Something went wrong",
    error: (error)
  })
};

const recipeNotFound = (res) => {
  res.status(404).json({message: "Recipe not found"})
};

const recipeCreated = (res) => {
  res.json({message: "Recipe created"});
};

const recipeUpdated = (res) => {
  res.json({message: "Recipe updated"});
};

const recipeDeleted = (res) => {
  res.json({message: "Recipe deleted"});
};

const recipeToDeleteNotFound = (res) => {
  res.status(404).json({message: "Recipe to delete not found"});
};