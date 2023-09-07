import axios from 'axios';
import nonTechnicalArrayKeyword from './nonTechnicalKeywords.js'
import dotenv from 'dotenv';
import { MessageCollector } from 'discord.js';
dotenv.config();
dotenv.config({ path: '../../.env' });
const discordToken = process.env.DISCORD_TOKEN;
const channelID = process.env.DISCORD_CHANNEL_ID;

export async function getAnswerFromDiscord(question) {
  try {

    const foundKeywords = findTechnicalKeywords(question);
    const results = [];

    if (foundKeywords.length > 0) {

      for (const keyword of foundKeywords) {
        const matchedMessages = await searchQuery(keyword);
        if (matchedMessages.length > 0) {
          results.push(...matchedMessages);
        }

      }

      return results;
    } else {
      return [];
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while searching." });
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
    let result = [];

    // const messages = matchedMessages.map((message) => ({
    //   content: message.content,
    //   // username: message.author.username,
    //   // userId: message.author.id,
    // }));

    const messages = matchedMessages.map((message) => {
      result.push(message.content);
    })

    return result;
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

//console.log(await getAnswerFromDiscord('what is sprint'));