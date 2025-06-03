import openai
import os

# Carrega a chave da API do .env ou variável de ambiente
from dotenv import load_dotenv
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

# Caminho do arquivo de treinamento
training_file = "openai_tuning.jsonl"

# 1. Faz upload do arquivo
def upload_file():
    print("Fazendo upload do arquivo de treinamento...")
    file = openai.files.create(
        file=open(training_file, "rb"),
        purpose="fine-tune"
    )
    print("Arquivo enviado! file_id:", file.id)
    return file.id

# 2. Inicia o fine-tuning
def start_fine_tune(file_id):
    print("Iniciando fine-tuning...")
    job = openai.fine_tuning.jobs.create(
        training_file=file_id,
        model="gpt-3.5-turbo-1106"
    )
    print("Fine-tuning iniciado! job_id:", job.id)
    print("Nome do modelo será retornado ao final do processo.")
    return job.id

if __name__ == "__main__":
    file_id = upload_file()
    start_fine_tune(file_id)
