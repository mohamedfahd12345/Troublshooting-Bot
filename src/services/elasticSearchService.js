import elasticsearch from '@elastic/elasticsearch'

export const client = new elasticsearch.Client({
  node: 'http://localhost:9200'
})
client.ping()
  .then(response => console.log("You are connected to Elasticsearch!"))
  .catch(error => console.error(error))


export async function createIndex() {
  try {
    await client.indices.create({ index: 'questions' });
    console.log('Index created');
  } catch (error) {
    console.error('Error creating index:', error);
  }
}


export async function AddDocument(docId, question, answer, tag) {
  try {
    const indexName = 'questions';
    const Question = {
      Question: question,
      Answer: answer,
      Tag: tag
    };


    await client.index({
      index: indexName,
      id: docId,
      body: Question
    })

    console.log('Question inserted:');
    return;
  } catch (error) {
    console.error('Error inserting Question:', error);
  }
}



export async function SearchForDocument(question) {

  const body = await client.search({
    index: 'questions',
    body: {
      query: {
        match: {
          Question: question
        }
      }
    }
  })

  return body.hits.hits;
}

export async function retrieveAllDocuments() {
  try {
    const indexName = 'questions';

    const body = await client.search({
      index: indexName,
      body: {
        query: {
          match_all: {} // Match all documents
        }
      }
    });


    return body.hits.hits;
  } catch (error) {
    console.error('Error retrieving documents:', error);
    throw error;
  }
}

export async function UpdateDocument(id, updatedFields) {

  try {
    await client.update({
      index: "questions",
      id,
      body: {
        doc: updatedFields,
      },
    });
    console.log('Document updated');
  } catch (error) {
    console.error('Error updating document:', error);
  }
}

export async function updateRate(questionId, answerId, newRate) {
  try {
    let targetDoc = await GetDocumentById(questionId);
   
    let id = questionId;
    for (const index in targetDoc._source.Answer) {
      if(targetDoc._source.Answer[index].AnswerId == answerId){
        targetDoc._source.Answer[index].Rate = newRate;
        break;
      }
    }

    //NOTE:-> must be {index , id ,body} do not update nameing 
    await client.update({
      index: "questions",
      id,
      body: {
        doc: targetDoc._source,
      },
    });

    console.log('Document updated');
  } catch (error) {
    console.error('Error updating document:', error);
  }
}

export async function DeleteDocument(docId) {
  console.log('Document ');
  try {
    const indexName = 'questions';
    const documentId = docId;

    await client.delete({
      index: indexName,
      id: documentId
    });

    console.log('Document deleted');
  } catch (error) {
    console.error('Error deleting document:', error);
  }
}

export async function GetDocumentById(documentId) {
  try {
    const indexName = 'questions';

    const getResponse = await client.get({
      index: indexName,
      id: documentId
    });

    return getResponse;
  } catch (error) {
    if (error.statusCode === 404) {
      console.log('Document not found');
    } else {
      console.error('Error retrieving document:', error);
    }
  }
}

export async function createIndexMapping(indexName) {
  try {
    await client.indices.create({
      index: indexName,
      body: {
        mappings: {
          properties: {
            Question: { type: 'text' },
            Answer: { type: 'text' },
          },
        },
      },
    });
    console.log('Index created');
  } catch (error) {
    console.error('Error creating index:', error);
  }
}



export async function DeleteIndex(indexName) {
  try {
    await client.indices.delete({ index: indexName });
    console.log(`Index '${indexName}' successfully deleted.`);
  } catch (error) {
    console.error(
      `An error occurred while deleting the index '${indexName}': ${error}`
    );
  }
};

export async function deleteAllDocuments(indexName) {
  try {
    const response = await client.deleteByQuery({
      index: indexName,
      body: {
        query: {
          match_all: {} // Match all documents
        }
      }
    });

    console.log(`Deleted all  documents from index "${indexName}".`);
  } catch (error) {
    console.error('Error:', error);
  }
}

export async function checkDocumentExistence(documentId) {
  try {

    const response = await client.exists({
      index: "questions",
      id: documentId,
    });

    return response;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

export async function searchQuestionByMatchingPhrase(question) {
  try {
    const response = await client.search({
      index: 'questions',
      body: {
        query: {
          match_phrase: {  // do and and order and must all terms exist in target filed
            Question: question,
          },
        },
      },
    });

    return response.hits.hits;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

export async function searchWithMultiMatch(question) {
  try {
    const response = await client.search({
      index: 'questions',
      body: {
        query: {
          multi_match: {
            query: question,
            fields: ['Question', 'Answer'],
          },
        },
      },
    });

    return response.hits.hits;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

//await updateRate('05a58f47-4595-4707-a704-2af2fb6ff4ea' , 'e006ea2c-4f45-41d1-bc71-765d0939473c' , 10);
//console.log(await retrieveAllDocuments());
//await createIndex();
//await DeleteIndex('questions');

//await deleteAllDocuments('questions');