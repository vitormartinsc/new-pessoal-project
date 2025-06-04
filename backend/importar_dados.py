import os
import json
import dotenv
import psycopg2
from psycopg2.extras import Json

dotenv.load_dotenv()  # Carrega as variáveis de ambiente do arquivo .env
# Pegando a DATABASE_URL do ambiente
DATABASE_URL = os.getenv('DATABASE_URL')

# Caminhos dos arquivos
fotos_path = os.path.join(os.path.dirname(__file__), 'fotos.json')
mensagens_path = os.path.join(os.path.dirname(__file__), 'mensagem_do_dia.json')
exemplos_path = os.path.join(os.path.dirname(__file__), 'exemplos.json')

def criar_tabelas(cur):
    # Remove as tabelas se existirem
    cur.execute('DROP TABLE IF EXISTS exemplos CASCADE;')
    cur.execute('DROP TABLE IF EXISTS mensagem_do_dia CASCADE;')
    cur.execute('DROP TABLE IF EXISTS fotos CASCADE;')
    # Cria as tabelas novamente
    cur.execute('''
        CREATE TABLE fotos (
            id SERIAL PRIMARY KEY,
            src TEXT NOT NULL,
            caption TEXT NOT NULL
        );
    ''')
    cur.execute('''
        CREATE TABLE mensagem_do_dia (
            id SERIAL PRIMARY KEY,
            mensagem_do_dia TEXT NOT NULL,
            foto_do_dia JSONB NOT NULL,
            data_do_dia DATE UNIQUE NOT NULL
        );
    ''')
    cur.execute('''
        CREATE TABLE exemplos (
            id SERIAL PRIMARY KEY,
            caption TEXT NOT NULL,
            mensagem TEXT NOT NULL
        );
    ''')

def importar_fotos(cur):
    if not os.path.exists(fotos_path):
        print('Arquivo fotos.json não encontrado.')
        return
    with open(fotos_path, 'r', encoding='utf-8') as f:
        fotos = json.load(f)
    for foto in fotos:
        cur.execute(
            """
            INSERT INTO fotos (src, caption) VALUES (%s, %s)
            ON CONFLICT DO NOTHING
            """,
            (foto.get('src'), foto.get('caption'))
        )
    print('Fotos importadas com sucesso!')

def importar_mensagens(cur):
    if not os.path.exists(mensagens_path):
        print('Arquivo mensagem_do_dia.json não encontrado.')
        return
    with open(mensagens_path, 'r', encoding='utf-8') as f:
        mensagens = json.load(f)
    # Normalização para array
    if not isinstance(mensagens, list):
        if 'mensagemDoDia' in mensagens and 'fotoDoDia' in mensagens and 'dataDoDia' in mensagens:
            mensagens = [{
                'mensagem_do_dia': mensagens['mensagemDoDia'],
                'foto_do_dia': mensagens['fotoDoDia'],
                'data_do_dia': mensagens['dataDoDia']
            }]
        else:
            mensagens = [
                {
                    'mensagem_do_dia': msg.get('mensagemDoDia'),
                    'foto_do_dia': msg.get('fotoDoDia'),
                    'data_do_dia': msg.get('dataDoDia')
                } for msg in mensagens.values()
            ]
    else:
        mensagens = [
            {
                'mensagem_do_dia': msg.get('mensagem_do_dia') or msg.get('mensagemDoDia'),
                'foto_do_dia': msg.get('foto_do_dia') or msg.get('fotoDoDia'),
                'data_do_dia': msg.get('data_do_dia') or msg.get('dataDoDia')
            } for msg in mensagens
        ]
    for msg in mensagens:
        cur.execute(
            """
            INSERT INTO mensagem_do_dia (mensagem_do_dia, foto_do_dia, data_do_dia)
            VALUES (%s, %s, %s)
            ON CONFLICT (data_do_dia) DO UPDATE SET mensagem_do_dia = EXCLUDED.mensagem_do_dia, foto_do_dia = EXCLUDED.foto_do_dia
            """,
            (msg['mensagem_do_dia'], Json(msg['foto_do_dia']), msg['data_do_dia'])
        )
    print('Mensagens do dia importadas com sucesso!')

def importar_exemplos(cur):
    if not os.path.exists(exemplos_path):
        print('Arquivo exemplos.json não encontrado.')
        return
    with open(exemplos_path, 'r', encoding='utf-8') as f:
        exemplos = json.load(f)
    for exemplo in exemplos:
        cur.execute(
            """
            INSERT INTO exemplos (caption, mensagem) VALUES (%s, %s)
            ON CONFLICT DO NOTHING
            """,
            (exemplo.get('caption'), exemplo.get('mensagem'))
        )
    print('Exemplos importados com sucesso!')

def main():
    if not DATABASE_URL:
        print('DATABASE_URL não definida no ambiente.')
        return
    conn = psycopg2.connect(DATABASE_URL, sslmode='require')
    try:
        with conn:
            with conn.cursor() as cur:
                criar_tabelas(cur)
                importar_fotos(cur)
                importar_mensagens(cur)
                importar_exemplos(cur)
    finally:
        conn.close()

if __name__ == '__main__':
    main()
