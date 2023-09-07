import axios from 'axios';
import { WebClient } from "@slack/web-api";

import nonTechnicalArrayKeyword from '../utils/nonTechnicalKeywords.js';
import dotenv from 'dotenv';
dotenv.config({path:'../../.env'});

const token = process.env.SLACK_TOKEN;
const channelId = process.env.SLACK_CHANNEL_ID;
// Create a new instance of the WebClient class with the token read from your environment variable
const web = new WebClient(token);





async function searchQuery(keyword) {
  try {
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Bearer ${token}`,
    };

    const data = new URLSearchParams({
      query: keyword,
      count: 10,
      sort: "timestamp",
      sort_dir: "desc",
    }).toString();

    const response = await axios.post(
      "https://slack.com/api/search.messages",
      data,
      { headers }
    );

    const result = response.data;

    if (result.ok) {
      if (result.messages.total > 0) {
        // console.log(
        //   "-------------------FOUND A QUESTION-----------------------"
        // );
        // console.log(
        //   `Channel has a question related to the keyword: ${keyword}`
        // );
        // console.log("Found messages:");
        result.messages.matches.forEach((match) => {
          console.log(match.text);
        });

        const foundQuestionData = {
          found: true,
          question: `Channel has a question related to the keyword: ${keyword}`,
          foundQuestion: result.messages.matches.map((match) => match.text),
        };

        return foundQuestionData;
      } else {
        // console.log("------------------NO QUESTION------------------------");
        // console.log(
        //   `No question found in the channel for the keyword: ${keyword}`
        // );
        return { found: false };
      }
    } else {
      console.error("Failed to search messages:", result.error);
      return { found: false };
    }
  } catch (error) {
    console.error("An error occurred:", error);
    return { found: false };
  }
}
const question = "what is javascript";

async function searchQuestion(question) {
  const foundKeywords = findTechnicalKeywords(question);
  const keywordResults = [];

  for (const keyword of foundKeywords) {
    const questionData = await searchQuery(keyword);
    keywordResults.push({
      keyword: keyword,
      found: questionData.found,
      foundQuestion: questionData.foundQuestion,
    });
  }

  return keywordResults;
}
//Find technical keywords in the question
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

searchQuestion(question)
  .then((results) => {
    console.log(results);
  })
  .catch((error) => {
    console.error("Error:", error);
  });

