"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const compliance_checker_1 = require("./compliance-checker");
const server = (0, express_1.default)();
const serverPort = 3000;
server.get("/", (req, res) => {
    return res.send("Compliance project - Success");
});
server.get("/check-compliance", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const websiteURL = req.query.websiteURL;
        if (!websiteURL) {
            return res.status(400).send({ error: "Missing 'websiteURL' parameter" });
        }
        const result = yield compliance_checker_1.ComplianceChecker.checkComplianceDetails({
            websiteURL
        });
        return res.status(200).json(result);
    }
    catch (error) {
        console.error(error);
        return res
            .status(500)
            .send({ error: "Error checking compliance", details: error.message });
    }
}));
server.listen(serverPort, () => {
    console.log("Server started on port: " + serverPort);
});
