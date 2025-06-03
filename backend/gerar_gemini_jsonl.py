import re
import json

# Caminho do arquivo de entrada e saída
input_path = 'Conversa do WhatsApp com Roberta.txt'
output_path = 'gemini_tuning.jsonl'

# Regex para identificar linhas de mensagem padrão WhatsApp
msg_pattern = re.compile(r'^(\d{1,2}/\d{1,2}/\d{2,4}),? (\d{2}:\d{2}) - ([^:]+): (.*)$')

exemplos = []

with open(input_path, 'r', encoding='utf-8') as f:
    for line in f:
        match = msg_pattern.match(line)
        if match:
            data, hora, autor, texto = match.groups()
            texto = texto.strip()
            if texto and not texto.lower().startswith(('mensagem apagada', 'imagem omitida', 'áudio omitido', 'vídeo omitido', 'figura omitida', 'chamada de voz', 'chamada de vídeo')):
                exemplo = {
                    "input": "Gere uma mensagem romântica/motivacional para Roberta no meu estilo.",
                    "output": texto
                }
                exemplos.append(exemplo)

# Salvar em formato JSONL
with open(output_path, 'w', encoding='utf-8') as f:
    for exemplo in exemplos:
        f.write(json.dumps(exemplo, ensure_ascii=False) + '\n')

print(f'{len(exemplos)} exemplos salvos em {output_path}')
