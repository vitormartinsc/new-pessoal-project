import openai
import os
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

# Substitua pelo seu job_id do fine-tuning
job_id = "ftjob-zp3FdHdvrYBJuqgpyCtisWaH"

job = openai.fine_tuning.jobs.retrieve(job_id)
print("Status:", job.status)
print("Nome do modelo:", getattr(job, "fine_tuned_model", None))
