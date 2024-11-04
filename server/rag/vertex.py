#https://github.com/GoogleCloudPlatform/generative-ai/blob/main/gemini/use-cases/retrieval-augmented-generation/Document_QnA_using_gemini_and_vector_search.ipynb
# Define project information
PROJECT_ID = "[headless-utils]"  # @param {type:"string"}
LOCATION = "asia-south1"  # @param {type:"string"}
# Initialize Vertex AI
import vertexai
vertexai.init(project=PROJECT_ID, location=LOCATION)
     
from datetime import datetime

# File system operations and displaying images
import os

# Import utility functions for timing and file handling
import time

# Libraries for downloading files, data manipulation, and creating a user interface
import uuid

from PIL import Image as PIL_Image
import fitz

# Initialize Vertex AI libraries for working with generative models
from google.cloud import aiplatform
import pandas as pd
from vertexai.generative_models import GenerativeModel, Image
from vertexai.language_models import TextEmbeddingModel

# Print Vertex AI SDK version
print(f"Vertex AI SDK version: {aiplatform.__version__}")

# Import LangChain components
import langchain

print(f"LangChain version: {langchain.__version__}")
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.document_loaders import DataFrameLoader
