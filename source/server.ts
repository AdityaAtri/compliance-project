import express, { Application, Request, Response } from "express";
import { ComplianceChecker } from "./compliance-checker";
const server: Application = express();
const serverPort = 3000;

server.get("/", (req: any, res: any) => {
  return res.send("Compliance project - Success");
});

server.get("/check-compliance", async (req: any, res: any) => {
  try {
    const websiteURL = req.query.websiteURL;
    if (!websiteURL) {
      return res.status(400).send({ error: "Missing 'websiteURL' parameter" });
    }
    const result = await ComplianceChecker.checkComplianceDetails({
      websiteURL
    });
    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ error: "Error checking compliance", details: error.message });
  }
});

server.listen(serverPort, () => {
  console.log("Server started on port: " + serverPort);
});
