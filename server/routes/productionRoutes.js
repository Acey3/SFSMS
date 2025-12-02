import express from "express";
import { createProduction, getProductions } from "../controllers/productionController.js";

const router = express.Router();

router.post("/", createProduction);
router.get("/", getProductions);

export default router;
