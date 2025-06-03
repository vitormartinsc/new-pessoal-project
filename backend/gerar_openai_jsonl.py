import json
import re

# Defina os nomes exatamente como aparecem na conversa
NOME_VITOR = "Vitor Martins"
NOME_ROBERTA = "Roberta"

# Lê legendas das fotos
with open('backend/fotos.json', 'r', encoding='utf-8') as f:
    fotos = json.load(f)
legendas = [foto['caption'] for foto in fotos if foto.get('caption')]

# Lê mensagens do WhatsApp e monta pares Roberta -> Vitor
msg_pattern = re.compile(r'^(\d{1,2}/\d{1,2}/\d{2,4}),? (\d{2}:\d{2}) - ([^:]+): (.*)$')
conversas = []
with open('backend/Conversa do WhatsApp com Roberta.txt', 'r', encoding='utf-8') as f:
    mensagens = []
    for line in f:
        match = msg_pattern.match(line)
        if match:
            autor = match.group(3).strip()
            texto = match.group(4).strip()
            if texto and not texto.lower().startswith(('mensagem apagada', 'imagem omitida', 'áudio omitido', 'vídeo omitido', 'figura omitida', 'chamada de voz', 'chamada de vídeo', '<mídia oculta>', 'null')):
                mensagens.append({"autor": autor, "texto": texto})

# Monta pares: user = Roberta, assistant = Vitor
pares = []
for i in range(len(mensagens) - 1):
    atual = mensagens[i]
    proxima = mensagens[i + 1]
    if atual["autor"] == NOME_ROBERTA and proxima["autor"] == NOME_VITOR:
        pares.append({"user": atual["texto"], "assistant": proxima["texto"]})

# Junta legendas como exemplos extras (opcional)
for legenda in legendas:
    pares.append({"user": "Legenda de foto", "assistant": legenda})

system_prompt = "Você é Vitor, namorado da Roberta. Escreva mensagens românticas/motivacionais no seu estilo."

with open('openai_tuning.jsonl', 'w', encoding='utf-8') as f:
    for par in pares:
        item = {
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": par["user"]},
                {"role": "assistant", "content": par["assistant"]}
            ]
        }
        f.write(json.dumps(item, ensure_ascii=False) + '\n')

print(f"{len(pares)} exemplos salvos em openai_tuning.jsonl")
