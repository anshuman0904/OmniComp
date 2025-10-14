import express from "express";
import routes from "./routes/routes.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use("/compress", routes);

app.listen(PORT, () => {
	console.log("Server started on PORT: ", PORT);
});