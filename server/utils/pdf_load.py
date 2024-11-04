import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from termcolor import colored
from langchain_community.document_loaders import PyPDFLoader
import fitz  # PyMuPDF
import os
def extract_pdf_content_and_links(pdf_path):
    """
    Extract both text content and links from a PDF file.
    
    Args:
        pdf_path (str): Path to the PDF file
        
    Returns:
        tuple: (text_content, links)
    """
    # Use LangChain's PyPDFLoader for text content
    loader = PyPDFLoader(pdf_path)
    pages = loader.load()
    text_content = "\n".join([page.page_content for page in pages])
    
    # Use PyMuPDF (fitz) to extract links
    doc = fitz.open(pdf_path)
    links = []
    
    for page_num in range(len(doc)):
        page = doc[page_num]
        page_links = page.get_links()
        for link in page_links:
            if "uri" in link:  # External URL
                links.append({
                    "url": link["uri"],
                    "page": page_num + 1
                })
    
    doc.close()
    return text_content, links

# # Example usage
# if __name__ == "__main__":
#     # print(os.getcwd())
#     pdf_path = "ResumeS&M.pdf"
#     content, links = extract_pdf_content_and_links(pdf_path)
    
#     with open("content.txt", "w") as f:
#         for link in links:
#             f.write(f"Link: {link['url']}\n")
#         f.write(content)
        