import axios from "axios";
import { WebClient } from "@slack/web-api";
import nonTechnicalArrayKeyword from './nonTechnicalKeywords.js'
import dotenv from 'dotenv';
dotenv.config();

dotenv.config({ path: '../../.env' });
const token = process.env.SLACK_TOKEN;
const channelId = process.env.SLACK_CHANNEL_ID;
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
     
        result.messages.matches.forEach((match) => {
          
        });

        const foundQuestionData = {
          found: true,
          question: `Channel has a question related to the keyword: ${keyword}`,
          foundQuestion: result.messages.matches.map((match) => match.text),
        };

        return foundQuestionData;
      } else {
        
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




export async function getAnswerFromSlack(question) {
  const foundKeywords = findTechnicalKeywords(question);

  const keywordResults = [];

  for (const keyword of foundKeywords) {
    const questionData = await searchQuery(keyword); // Await the asynchronous searchQuery
    if (questionData.found) {
      keywordResults.push({
        keyword: keyword,
        found: questionData.found,
        foundQuestion: questionData.foundQuestion,
      });
    }

  }
  const hasFoundAnyKeyword = keywordResults.some((result) => result.found);

  if (hasFoundAnyKeyword) {
    return {
      data: keywordResults.map(result => result.foundQuestion).flat(),
      found: true
    };
  } else {
    return {
      data: null,
      found: false
    };
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

//console.log(await getAnswerFromSlack('what is Linux'));

// console.log("-----------------------------------------------------------------")
//console.log(await getAnswerFromSlack('how to dowload Linux'));

//  let r =  await getAnswerFromSlack('how to dowload Linux');
// if(r.found == true){
//   console.log(r.data);
// }

//console.log(await searchQuery(' Linux docker')) // found = false;
//console.log(await searchQuery(' Linux ')); // found = true; 

