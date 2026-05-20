import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { routes } from "./routes";
import { errorHandler } from "./middlewares/errorHandler";
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(routes);
app.use(errorHandler);
const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
