import openai
import os
import json
import random
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

EXEMPLOS_PATH = os.path.join(os.path.dirname(__file__), "exemplos.json")
FOTOS_PATH = os.path.join(os.path.dirname(__file__), "fotos.json")

def gerar_mensagem(caption):
    # Lê exemplos do exemplos.json
    with open(EXEMPLOS_PATH, "r", encoding="utf-8") as f:
        exemplos = json.load(f)
    prompt = (
        "Você é Vitor, namorado da Roberta. Escreva mensagens românticas no seu estilo, com um senso de humor, tem que ser algo mais espontêneo e ao mesmo tempo profundo.\n"
        "Sobre a Roberta: ela é ama animais, é veterinária, tem um sorriso lindo. Ela é muito preocupada com os outros, cobra muito dela. Tem uma bondade super natural, não tem escrúpulos, tem um senso de humor questionável, gosta de piada de tiozão etc.\n\n"
        "Exemplos de mensagens:\n"
    )
    for exemplo in exemplos:
        prompt += f"Imagem: {exemplo['caption']}\nMensagem: {exemplo['mensagem']}\n\n"
    prompt += f"Agora, escreva uma mensagem para Roberta baseada nesta imagem : {caption}. Lembra de fazer algo natural, sem parecer forçado e muito melosa, tem que ser espontâneo e profundo. Não seja meloso de forma alguma e seja o mais natural possível. FIQUE PARECIDO COMIGO E NÃO COM UM ROBÔ"
    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=400,
        temperature=0.9
    )
    return response.choices[0].message.content

if __name__ == "__main__":
    # Lê as fotos do fotos.json
    with open(FOTOS_PATH, "r", encoding="utf-8") as f:
        fotos = json.load(f)
    if not fotos:
        print("Nenhuma foto encontrada em fotos.json.")
    else:
        foto = random.choice(fotos)
        caption = foto["caption"]
        print(f"Caption sorteado: {caption}")
        mensagem = gerar_mensagem(caption)
        print("\nMensagem gerada:\n", mensagem)
