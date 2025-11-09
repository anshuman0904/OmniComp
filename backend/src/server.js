import express from "express";
import routes from "./routes/routes.js";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

if (process.env.NODE_ENV !== "production") {
	app.use(cors());
}
app.use("/api", routes);

if (process.env.NODE_ENV === "production")
{
    app.use(express.static(path.join(__dirname,"../frontend/dist")));
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname,"../frontend","dist","index.html"));
    });
}

app.listen(PORT, () => {
	console.log("Server started on PORT: ", PORT);
});