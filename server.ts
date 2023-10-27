import express from "express";
import cors from "cors";
import routes from "./routes";
import { allowedOrigins } from "./config/origin";
import { getOriginInfo } from "./middlleware/originDetector";

const app = express();
const port = 80;

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin
      // (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        let msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        console.log(msg, origin);
        return;
      }
      return callback(null, true);
    },
  })
);

app.use("/api", getOriginInfo, routes);

app.listen(port, () => {
  console.log(`Server is listening on ${port}`);
});
