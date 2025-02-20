
import sys
import json
from typing import List
from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import FAISS
from langchain.chains import RetrievalQA
from langchain.llms import LlamaCpp
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

        # Create retriever
        retriever = vectorstore.as_retriever(
            search_type="similarity",
            search_kwargs={"k": 3}
        )
        
        # Get relevant documents
        docs = retriever.get_relevant_documents(query)
        
        # Construct response based on retrieved documents
        if not docs:
            return "I couldn't find specific information about that. Try asking about mutual funds, portfolio allocation, or investment procedures."
        
        # Extract and format relevant information
        contexts = []
        for doc in docs:
            content = doc.page_content.strip()
            if content:
                contexts.append(content)
        
        if not contexts:
            return "Please try asking about specific mutual fund topics or investment strategies."
            
        # Process and format the response
        response = " ".join(contexts)
        # Limit response length and ensure complete sentences
        if len(response) > 500:
            response = ". ".join(response[:500].split(". ")[:-1]) + "."
        return response

    except Exception as e:
        print(f"Error in process_query: {str(e)}", file=sys.stderr)
        return "I encountered an issue while processing your request. Please ask about mutual funds or investment topics."

    except Exception as e:
        print(f"Error processing query: {str(e)}", file=sys.stderr)
        return "I apologize, but I encountered an error while processing your request. Please try again with a different question about mutual funds or financial topics."

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
