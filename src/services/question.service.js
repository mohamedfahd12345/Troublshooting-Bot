
import { Question } from '../models/question.model.js';
import { Answer } from '../models/answer.model.js'

export async function addQuestion(question_text, has_answer, tag, answerText, rate) {
  const newQuestion = await Question.create({
    question_text, tag, has_answer
  });
  let question_id = newQuestion.id;

  let answersArray = [];
  for (const item of answerText) {
    const newAnswer = await Answer.create({
      answer_text: item, rate, question_id
    });

    let ansewrAsDoc = {
      AnswerId: newAnswer.dataValues.id,
      Rate: rate,
      AnswerText: item
    };

    answersArray.push(ansewrAsDoc);

  }

  return { questionId: question_id, finalAnswersArray: answersArray };
}


export async function updateQuestion(questionId, question_text, has_answer, tag, answer_text) {
  try {
    const resultQuestion = await Question.update(
      { question_text, tag, has_answer, updatedAt: Date.now() },
      {
        where: {
          id: questionId
        },
      }
    );

    for (const item of answer_text) {
      let itemAnswer = item.AnswerText;
      let itemRate = item.Rate;

      const resultAnswer = await Answer.update(
        { answer_text: itemAnswer , rate: itemRate, updatedAt: Date.now() },
        {
          where: {
            question_id: questionId,
            id: item.AnswerId
          },
        }
      );
    }

  }
  catch (error) {
    console.error('Error:', error);
  }

}

export async function deleteQuestionById(questionId) {
  const resultDelAnswer = await Answer.destroy({
    where: { question_id: questionId },
    force: true,
  });

  const result = await Question.destroy({
    where: { id: questionId },
    force: true,
  });
  return result;
}

export async function deleteAnswerById(answerId){
  const resultDelAnswer = await Answer.destroy({
    where: { id : answerId },
    force: true,
  });
  return resultDelAnswer;
}

export async function updateRate(questionId, answerId , newRate) {
  const resultAnswer = await Answer.update(
    { rate: newRate, updatedAt: Date.now() },
    {
      where: {
        question_id: questionId,
        id : answerId
      },
    }
  );

  return resultAnswer;
}


//-----------------------------------INSETR DEMO-----------------------------------------------------
//  let answers = ['use docker1', 'use vm1', 'ask GPT11']
//  console.log(await addQuestion('what is vm OR DOCKER11', true, 'jobs', answers, 3.33));
//-----------------------------------------------------------------------------------------------------



//-----------------------------------Updaet DEMO-----------------------------------------------------
// let arr =  [
//   {
//     AnswerId: '3a4a785d-8394-42ef-9c51-fb0e1232044a',
//     Rate: 3.33,
//     AnswerText: 'use docker visit this'
//   },
//   {
//     AnswerId: '75f4ddda-51cc-4c22-8730-9ea150a28682',
//     Rate: 3.33,
//     AnswerText: 'use vm'
//   },
//   {
//     AnswerId: 'f74d1021-2a39-4319-8ca7-d7d367dec2be',
//     Rate: 3.33,
//     AnswerText: 'ask CHATGPT'
//   }
// ];

// await updateQuestion('22619a08-adb9-4e62-a0b7-73acd8289ccc', "how to dowload docker" , true , "dev" , arr );
//---------------------------------------------------------------------------------------------------------------




//-----------------------------------Updaet Rate DEMO-----------------------------------------------------
//await updateRate('22619a08-adb9-4e62-a0b7-73acd8289ccc' , 'f74d1021-2a39-4319-8ca7-d7d367dec2be' , 10);
//---------------------------------------------------------------------------------------------------------------


//-----------------------------------Delete  Question DEMO-----------------------------------------------------
//await deleteQuestionById('0612cfab-f9c2-46f3-a189-d249fee17fbd');
//---------------------------------------------------------------------------------------------------------------


//await deleteAnswerById('75f4ddda-51cc-4c22-8730-9ea150a28682');