import subprocess
import time

INTERVAL_MINUTES = 1  # Altere para o intervalo desejado

while True:
    print("\nVerificando status do fine-tuning...")
    result = subprocess.run(["python", "backend/check_fine_tune_status.py"], capture_output=True, text=True)
    print(result.stdout)
    if "Status: succeeded" in result.stdout or "Status: failed" in result.stdout:
        print("Processo finalizado. Encerrando monitoramento.")
        break
    print(f"Aguardando {INTERVAL_MINUTES} minutos para próxima verificação...")
    time.sleep(INTERVAL_MINUTES * 60)
