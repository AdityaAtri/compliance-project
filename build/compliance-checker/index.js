"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceChecker = void 0;
const _ = __importStar(require("lodash"));
const scrapper_1 = require("./scrapper");
const constants_1 = require("./constants");
const helper_1 = require("./helper");
const fetch = require('node-fetch');
const checkComplianceDetails = (request) => __awaiter(void 0, void 0, void 0, function* () {
    const { websiteURL } = request;
    if (_.isEmpty(websiteURL)) {
        throw new Error('Website URL is empty');
    }
    const webpageContent = yield scrapper_1.Scrapper.scrapeContentFromWebsiteURL(websiteURL);
    const compliancePolicy = yield scrapper_1.Scrapper.scrapeContentFromWebsiteURL(constants_1.COMPLIANCE_POLICY_URL);
    const parsedCompliancePolicy = JSON.parse(compliancePolicy);
    const textFromCompliancePolicy = (0, helper_1.extractText)(parsedCompliancePolicy.article.content.children);
    // const compliancePolicySummary = await fetch("https://api-inference.huggingface.co/models/openai-community/gpt2", {
    //     method: 'POST',
    //     headers: {
    //         'Authorization': `Bearer ${HUGGING_FACE_API_KEY}`,
    //         'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //         inputs: `Get me the summary of given compliance policy: ${textFromCompliancePolicy}. The response should contain every essential point in not more than 500 words`,
    //     }),
    // });
    // console.log(await compliancePolicySummary.json());
    const isChunkRequired = true;
    const tokenLimit = 300;
    const webpageChunks = (0, helper_1.chunkText)(webpageContent, tokenLimit, isChunkRequired);
    const policyChunks = (0, helper_1.chunkText)(textFromCompliancePolicy, tokenLimit, isChunkRequired);
    const results = [];
    for (const webChunk of webpageChunks) {
        for (const policyChunk of policyChunks) {
            const prompt = `
            You are a compliance checker. Your task is to analyze the following text against the provided policy.
            
            Policy:
            ${webChunk}
            
            Text to analyze:
            ${policyChunk}
            
            Your response must always be in valid JSON format and should only identify compliance violations. Each violation should be represented as an object using this structure.
            {
                "issue": "Description of the violation",
                "location": "Exact text that violates the policy",
                "solution": "How it should be fixed according to the policy"
            }
            For multiple violations, return an array of such objects. If no violations are found, return an empty array:
            []
            
            Important rules:
            1. The response must always be in JSON format.
            2. Do not provide any additional notes or explanations beyond the JSON object.`;
            const url = 'https://api.together.xyz/v1/chat/completions';
            const options = {
                method: 'POST',
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    Authorization: 'Bearer 200049fdfb4754f10e793bb9c0aec8ae8808a61721e2be27ab2067a13e98dcb3'
                },
                body: JSON.stringify({
                    model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
                    temperature: 0.7,
                    frequency_penalty: 0,
                    presence_penalty: 0,
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ]
                })
            };
            const response = yield fetch(url, options);
            const result = yield response.json();
            console.log(result);
            if (!_.isEmpty(result.choices[0].message.content)) {
                results.push((result.choices[0].message.content));
            }
            // const response = await fetch("https://api-inference.huggingface.co/models/deepset/roberta-base-squad2", {
            //     method: 'POST',
            //     headers: {
            //         'Authorization': `Bearer ${HUGGING_FACE_API_KEY}`,
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify({
            //         "inputs": {
            //             "question": "Analyze webpage content against the compliance policy. List any sections that do not comply with the policy",
            //             "context": `
            //                 Webpage content - ${webChunk} and
            //                 Compliance policy - ${policyChunk}`
            //         }
            //     }),
            // });
            //
            // if (!response.ok) {
            //     throw new Error(`Error checking compliance: ${response.statusText}`);
            // }
            // const result = await response.json();
            yield (0, helper_1.delay)(1000);
        }
    }
    // console.log(results);
    // return results;
    // const response = await fetch("https://api-inference.huggingface.co/models/EleutherAI/gpt-j-6b", {
    //     method: 'POST',
    //     headers: {
    //         'Authorization': `Bearer ${HUGGING_FACE_API_KEY}`,
    //         'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //         inputs: `Analyze the following webpage content against the compliance policy: ${textFromCompliancePolicy}. Identify and list any sections that do not comply with the policy in detail. Webpage content: ${webpageContent}`,
    //     }),
    // });
    // console.log(await response.json());
    // return response;
    return results;
});
exports.ComplianceChecker = {
    checkComplianceDetails,
};
