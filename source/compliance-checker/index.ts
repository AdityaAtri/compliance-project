import {GetComplianceRequest, GetComplianceResponse} from './types';
import * as _ from 'lodash';
import {Scrapper} from './scrapper';
import {COMPLIANCE_POLICY_URL} from "./constants";
import {chunkText, extractText, delay} from "./helper";
const fetch = require('node-fetch');


const checkComplianceDetails = async (request: GetComplianceRequest): Promise<GetComplianceResponse> => {
    const { websiteURL } = request;
    if (_.isEmpty(websiteURL)) {
        throw new Error('Website URL is empty');
    }
    const webpageContent = await Scrapper.scrapeContentFromWebsiteURL(websiteURL);
    const compliancePolicy = await Scrapper.scrapeContentFromWebsiteURL(COMPLIANCE_POLICY_URL);
    const parsedCompliancePolicy = JSON.parse(compliancePolicy);
    const textFromCompliancePolicy = extractText(parsedCompliancePolicy.article.content.children);
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
    const tokenLimit = 100;
    const webpageChunks = chunkText(webpageContent, tokenLimit, isChunkRequired);
    const policyChunks = chunkText(textFromCompliancePolicy, tokenLimit, isChunkRequired);

    const results: any[] = [];
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
            const response = await fetch(url, options);
            const result = await response.json();
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
            await delay(1000);
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
};


export const ComplianceChecker = {
    checkComplianceDetails,
};