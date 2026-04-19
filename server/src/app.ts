import express from "express";
import { NODE_ENV, PORT } from "./config";
import cors from "cors";
import { errorsMiddleware } from "./middlewares/errorsMiddleware";
import { router as imagesRouter } from "./features/images/images.router";
import { initDb } from "./config/database";

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("File Storage API");
});

app.use("/api/images", imagesRouter);

app.use(errorsMiddleware);

const start = async () => {
  await initDb();
  if (NODE_ENV !== "production") {
    app.listen(PORT, () => {
      console.log("Server is running on http://localhost:" + PORT);
    });
  }
};

start();

export default app;
