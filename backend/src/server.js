import express from "express";
import routes from "./routes/routes.js";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use("/api", routes);

app.listen(PORT, () => {
	console.log("Server started on PORT: ", PORT);
});