// server.js

import axios from 'axios';
import nonTechnicalArrayKeyword from '../utils/nonTechnicalKeywords.js';
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });
import { MessageCollector } from 'discord.js';




const discordToken = process.env.DISCORD_TOKEN;
const channelID = process.env.DISCORD_CHANNEL_ID;


async function searchQuestion(question) {
  try {
    if (!question) {
      throw new Error("Question is required");
    }



    const foundKeywords = findTechnicalKeywords(question);

    if (foundKeywords.length > 0) {
      const results = [];

      for (const keyword of foundKeywords) {
        const matchedMessages = await searchQuery(keyword);

        // Extract and log specific data from matched messages
        matchedMessages.forEach((message) => {
          console.log('================DISCORD RESULTS========================');
          console.log('Content:', message.content);
          console.log('Username:', message.username);
          console.log('UserID:', message.userId);
          console.log('======================================================');
        });

        results.push({
          keyword,
          found: matchedMessages.length > 0, // Flag indicating keyword found
          matchedMessages,
        });
      }

      return { results };
    } else {
      return { message: "No relevant keywords found" };
    }
  } catch (error) {
    console.error(error);
    throw new Error("An error occurred while searching.");
  }
}
async function searchQuery(keyword) {
  try {
    const response = await axios.get(
      `https://discord.com/api/v10/channels/${channelID}/messages`,
      {
        headers: {
          Authorization: `Bot ${discordToken}`,
        },
      }
    );

    const matchedMessages = response.data.filter((message) =>
      message.content.toLowerCase().includes(keyword.toLowerCase())
    );

    const messages = matchedMessages.map((message) => ({
      content: message.content,
      username: message.author.username,
      userId: message.author.id,
    }));

    return messages;
  } catch (error) {
    console.error("Error searching for messages:", error);
    return [];
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

const question = "what is sprint ";
searchQuestion(question)
  .then((results) => {
    console.log("(((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((")
    console.log(results);
  })
  .catch((error) => console.error(error));
