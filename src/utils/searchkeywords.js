import technicalArrayKeyword from './technicalKeywords.js';

export async  function findTechnicalKeywords(question) {
    const keywords = question.toLowerCase().split(" ");
    let foundKeywords = "";
  
    for (const keyword of keywords) {
      if (technicalArrayKeyword.includes(keyword)) {
        foundKeywords+= keyword;
        foundKeywords+= " ";
      }
    }
    return foundKeywords;
  }

