import axios from 'axios';
import nonTechnicalArrayKeyword from '../utils/nonTechnicalKeywords.js';
import dotenv from 'dotenv';
dotenv.config({path:'../../.env'});

// Confluence API credentials
const confluenceBaseUrl = process.env.CONFLUENCE_URL;
const username = process.env.CONFLUENCE_USERNAME;
const password = process.env.CONFLUENCE_PASSWORD;

const pageId = process.env.CONFLUENCE_PAGE_ID;

const auth = {
  username: username,
  password: password,
};

// Function to retrieve page content by page ID
async function getPageContent(pageId) {
  try {
    const response = await axios.get(
      `${confluenceBaseUrl}/rest/api/content/${pageId}?expand=body.storage,title`,
      {
        auth,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return {
      title: response.data.title,
      body: response.data.body.storage.value,
    };
  } catch (error) {
    console.error("Error fetching page content:", error.message);
    throw error;
  }
}


async function searchQuery(keyword) {
  try {
    const pageContent = await getPageContent(pageId);

    const keywordFoundInTitle = pageContent.title
      .toLowerCase()
      .includes(keyword);
    const keywordFoundInBody = pageContent.body.toLowerCase().includes(keyword);

    let articleContent = ""; // Initialize with empty string
    let articleFound = false; // Initialize with false

    const boldTextRegex = /<strong>|<b>(.*?)<\/b>/gi; // Define bold text regex here

    if (keywordFoundInBody) {
      const bodyLines = pageContent.body.split("\n");
      let foundBoldText = false;
      let tempArticleContent = "";

      for (const line of bodyLines) {
        if (line.match(boldTextRegex)) {
          if (foundBoldText) {
            break;
          }
          foundBoldText = true;
        }

        if (foundBoldText) {
          tempArticleContent += line + "\n";
        }
      }

      if (tempArticleContent) {
        // Split the content into paragraphs
        const paragraphs = tempArticleContent.split("<p />");

        // Find the paragraph that contains the keyword
        const paragraphWithKeyword = paragraphs.find((paragraph) =>
          paragraph.toLowerCase().includes(keyword)
        );

        if (paragraphWithKeyword) {
          articleContent = paragraphWithKeyword;
          articleFound = true; // Set to true if article content is found
        }
      }
    }

    return {
      keywordFoundInTitle,
      keywordFoundInBody,
      keywordFound: keywordFoundInTitle || keywordFoundInBody, // Flag indicating keyword was found
      articleFound,
      articleContent,
    };
  } catch (error) {
    console.error("Error searching keyword:", error.message);
    throw error;
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
async function searchQuestion(question) {
  const foundKeywords = findTechnicalKeywords(question);

  const results = [];

  for (const keyword of foundKeywords) {
    const { articleFound, articleContent } = await searchQuery(keyword);
    results.push({
      keyword,
      articleFound,
      articleContent,
    });
    
  }

  return results;
}
const question = "what is javascript";

searchQuestion(question)
  .then((results) => {
    
    console.log("Results:", results);
  })
  .catch((error) => {
    // Handle errors
    console.error("Error processing question:", error.message);
  });
