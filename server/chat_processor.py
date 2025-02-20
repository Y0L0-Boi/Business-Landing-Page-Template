import sys
import json
from typing import List
from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import FAISS
import os

def load_knowledge_base():
    # Initialize document storage
    documents = []
    knowledge_dir = os.path.join(os.path.dirname(__file__), '../knowledge')

    # Load PDF documents
    for filename in os.listdir(knowledge_dir):
        if filename.endswith('.pdf'):
            loader = PyPDFLoader(os.path.join(knowledge_dir, filename))
            documents.extend(loader.load())

    # Split documents into chunks
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    texts = text_splitter.split_documents(documents)

    # Create embeddings
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    # Create vector store
    db = FAISS.from_documents(texts, embeddings)
    return db

def process_query(vectorstore, query: str) -> str:
    try:
        if not query.strip():
            return "Please provide a question about mutual funds or financial topics."

        # Get relevant documents
        docs = vectorstore.similarity_search(query, k=2)

        # Extract and combine relevant text
        if docs:
            response = "Based on the available information:\n\n"
            response += "\n".join([doc.page_content for doc in docs])
            return response[:500] + "..." if len(response) > 500 else response
        else:
            return "I couldn't find specific information about that topic. Please try asking about mutual funds or investment-related questions."

    except Exception as e:
        print(f"Error in process_query: {str(e)}", file=sys.stderr)
        return "I encountered an issue while processing your request. Please ask about mutual funds or investment topics."

def main():
    # Load knowledge base
    vectorstore = load_knowledge_base()

    # Process input
    for line in sys.stdin:
        try:
            input_data = json.loads(line)
            query = input_data.get('message', '')
            response = process_query(vectorstore, query)
            print(response)
        except json.JSONDecodeError:
            print("Error: Invalid JSON input")
        except Exception as e:
            print(f"Error processing query: {str(e)}")
        break

if __name__ == "__main__":
    main()