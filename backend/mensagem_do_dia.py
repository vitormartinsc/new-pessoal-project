import openai
import os
import random
import json
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

MODEL_NAME = "ft:gpt-3.5-turbo-1106:personal::Be7RTrqB"

# Lê as fotos e legendas
with open(os.path.join(os.path.dirname(__file__), "fotos.json"), encoding="utf-8") as f:
    fotos = json.load(f)
    fotos_com_legenda = [foto for foto in fotos if foto.get("caption")]

foto = random.choice(fotos_com_legenda) 

system_prompt = "Você conhece o senso de humor e o estilo de vida da Roberta e do Vitor, escreva uma mensagem com base nessa sabedoria de um parágrafo pelo menos, bem fofa e romântica."
user_prompt = f"Gere uma mensagem para Roberta baseada nesta foto e legenda. Escreva um texto maior, como um parágrafo completo, com detalhes e emoção: {foto['caption']}"

messages = [
    {"role": "system", "content": system_prompt},
    {"role": "user", "content": user_prompt}
]

response = openai.chat.completions.create(
    model=MODEL_NAME,
    messages=messages,
    max_tokens=800,  # aumentado para permitir respostas maiores
    temperature=0.9
)

mensagem = response.choices[0].message.content
print("Mensagem do dia:", mensagem)
print("Foto:", foto)
