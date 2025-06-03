import json

system_prompt = "Você é Vitor, namorado da Roberta. Escreva mensagens românticas/motivacionais no seu estilo. Escreva um texto longo, bonito, como um parágrafo."

# Lê exemplos de um arquivo JSON externo
with open('backend/exemplos.json', 'r', encoding='utf-8') as f:
    exemplos = json.load(f)

with open('openai_tuning.jsonl', 'w', encoding='utf-8') as f:
    for exemplo in exemplos:
        item = {
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Escreva uma mensagem para Roberta baseada nesta imagem: {exemplo['caption']}"},
                {"role": "assistant", "content": exemplo["mensagem"]}
            ]
        }
        f.write(json.dumps(item, ensure_ascii=False) + '\n')

print(f"{len(exemplos)} exemplos salvos em openai_tuning.jsonl")
