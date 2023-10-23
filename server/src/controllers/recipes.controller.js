import { pool } from "../db.js";
import fs from "fs";

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
  const { name, tags, prepTime, ingredients, prepProcess, notes, createdBy } = req.body;

  const creationDate = getCurrentDate();
  const lastModifiedDate = creationDate;

  const imgPreviousName = req.file.filename;
  const imgNewFileName = getImgNewFileName(name, req);
  const imgPreviousPath = `src/uploads/${imgPreviousName}`
  const imgNewPath = `src/uploads/${imgNewFileName}`;

  console.log({ imgPreviousPath });
  console.log({ imgNewPath });

  fs.rename(imgPreviousPath, imgNewPath, (err) => {
    if (err) throw err;
  }) 

  try { 
    const [result] = await pool.query(`
    INSERT INTO recipes 
    (name, tags, prepTime, ingredients, prepProcess, notes, createdBy, creationDate, lastModifiedDate, imgFileName) 
    VALUES
      (IFNULL(?, ""), IFNULL(?, ""), IFNULL(?, ""), IFNULL(?, ""), IFNULL(?, ""), IFNULL(?, ""), IFNULL(?, ""), IFNULL(?, ""), IFNULL(?, ""), IFNULL(?, ""))
    `, [name, tags, prepTime, ingredients, prepProcess, notes, createdBy, creationDate, lastModifiedDate, imgNewFileName]);
  
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

// message functions
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

// process functions
const getCurrentDate = () => {
  const dateObj = new Date();
  const dateArray = dateObj.toString().split(" ");

  const day = dateArray[2];
  const month = dateArray[1];
  const year = dateArray[3];
  const timeArray = dateArray[4].split(":");
  const time = timeArray[0] + ":" + timeArray[1];

  const fullDate = `${day}/${month}/${year}-${time}`;

  return fullDate;
};

const getImgNewFileName = (name, req) => {
  const recipeName = name.split(" ").join("");
  const imgOriginalExtension = req.file.originalname.split(".")[1];
  const imgNewFileName = recipeName + "." + imgOriginalExtension;

  return imgNewFileName;
};