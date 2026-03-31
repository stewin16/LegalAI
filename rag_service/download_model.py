import os
from sentence_transformers import SentenceTransformer

def download():
    model_name = "all-MiniLM-L6-v2"
    print(f"Pre-downloading model: {model_name}...")
    # This force-downloads the model to the local cache during build time
    model = SentenceTransformer(model_name)
    print("Model downloaded successfully!")

if __name__ == "__main__":
    download()
