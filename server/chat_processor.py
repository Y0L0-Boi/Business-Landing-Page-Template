
import sys
import json
from typing import List
from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import FAISS
from langchain.chains import RetrievalQA
from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM
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

        # Initialize the model
        try:
            generator = pipeline('text-generation', model='facebook/opt-125m')
            response = generator(query, max_length=100, num_return_sequences=1)[0]['generated_text']
            return response
        except Exception as model_error:
            print(f"Error loading model: {str(model_error)}", file=sys.stderr)
            return "I'm having trouble initializing. Please try again in a moment."

        # Create retriever
        retriever = vectorstore.as_retriever(
            search_type="similarity",
            search_kwargs={"k": 3}
        )
        
        # Create QA chain
        qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=retriever,
            return_source_documents=True
        )
        
        # Get response
        result = qa_chain({"query": query})
        return result["result"]

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
