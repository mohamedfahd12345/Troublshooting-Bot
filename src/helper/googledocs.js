import { google } from 'googleapis';
import axios from 'axios';
import nonTechnicalArrayKeyword from '../utils/nonTechnicalKeywords.js';
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

const documentId = process.env.GOOGLE_DOCS_ID;
const question = "How do javascript ?"



async function searchQuery(keyword) {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: "credentials.json",
      scopes: "https://www.googleapis.com/auth/documents",
    });

    const client = await auth.getClient();
    const googleDocs = google.docs({ version: "v1", auth: client });

    const document = await googleDocs.documents.get({
      documentId,
    });

    // Extract the content of the document
    const content = document.data.body.content;

    // Flags to track article and keyword found status, and capturing content
    let articleFound = false;
    let articleContent = "";

    let keywordFound = false;
    let capturingContent = false;

    // Iterate through the content of the document
    for (const item of content) {
      if (articleFound) {
        break; // Exit the loop if the article is found
      }

      if (item.paragraph) {
        for (const element of item.paragraph.elements) {
          if (element.textRun) {
            const contentText = element.textRun.content;

            if (capturingContent && element.textRun.textStyle.bold) {
              articleFound = true; // Mark article as found if bold text encountered
              break;
            }

            if (contentText.toLowerCase().includes(keyword)) {
              keywordFound = true; // Mark keyword as found
              capturingContent = true; // Start capturing content
            }

            if (capturingContent) {
              articleContent += contentText; // Accumulate content text
            }
          }
        }
      }
    }

    // Return information about whether article and keyword were found, along with the article content
    return { articleFound, articleContent };
  } catch (error) {
    // Handle errors: log the error and return default values
    console.error("Error searching for keywords:", error);
    return { articleFound: false, articleContent: "" };
  }
}
function findTechnicalKeywords(question) {
  const keywords = question.toLowerCase().split(" ");
  const foundKeywords = [];

  for (const keyword of keywords) {
    if (!nonTechnicalArrayKeyword.includes(keyword)) {
      foundKeywords.push(keyword);
    }
  }

  return foundKeywords;
}

export async function searchQuestion(question) {

  const foundKeywords = findTechnicalKeywords(question);
  const results = [];

  if (foundKeywords.length > 0) {

    for (const keyword of foundKeywords) {
      const { articleFound, articleContent } = await searchQuery(keyword);
      if (articleFound) {
        results.push(articleContent);
      }
    
    }
    return results;
  } else {
    return [];
  }
}
console.log(await searchQuestion(question));


