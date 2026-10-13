"""
OriirO AI - Full System Launcher
================================
Launches the OriirO AI engine, verifies local Ollama connection,
and executes interactive dual-stream reflexive reasoning.
"""

import sys
import time
import os

# Set UTF-8 encoding for Windows console
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

sys.path.append(os.path.join(os.path.dirname(__file__), "model"))
from ollama_adapter import OllamaOriirOBridge
from oriiro_model import OriirOConfig, OriirOModel

def launch():
    print("=" * 70)
    print("  *** ENCLENCHEMENT DE L'INTELLIGENCE REFLEXIVE ORIIR-O ***  ")
    print("=" * 70)
    print("\n[System Check] Initializing OriirO-1 Engine Components...")
    
    config = OriirOConfig(d_model=512, n_heads=8, n_layers=6, reflection_depth=3)
    print(f"  + OriirO Architecture Configured: d_model={config.d_model}, n_heads={config.n_heads}, n_layers={config.n_layers}")

    bridge = OllamaOriirOBridge()
    is_up = bridge.check_connection()
    models = bridge.list_models()

    if is_up:
        print(f"  + Ollama Local Server Online: Detected {len(models)} model(s) {models}")
        active_model = models[0]
    else:
        print("  ! Ollama Server Offline - Operating in Native Reflexive Mode")
        active_model = "OriirO-1 Native"

    print(f"\n[Web Studio] Studio active at: http://localhost:8088")
    print("\n" + "-" * 70)
    print(" Executing OriirO Dual-Stream Reasoning Query...")
    print("-" * 70 + "\n")

    query = "Explique l'importance de l'architecture OriirO et de l'attention miroir réflexive."
    
    print(f"PROMPT : \"{query}\"\n")
    print("STREAMING REFLEXION PROCESS...")

    result = bridge.generate_with_reflexion(
        prompt=query,
        model_name=active_model,
        system_prompt="Tu es OriirO, une IA dotée d'une architecture d'attention réflexive bidirectionnelle. Réponds de façon élégante et précise en français.",
        reflection_depth=3
    )

    print("\n" + "=" * 70)
    print("RÉPONSE VALIDÉE PAR ORIIR-O :")
    print("=" * 70)
    print(result["text"])
    print("\n" + "-" * 70)
    print("MÉTRIQUES DE TÉLÉMÉTRIE RÉFLEXIVE :")
    print(f" Engine           : {result['engine']}")
    print(f" Modèle           : {result['model']}")
    print(f" Latence globale  : {result['metrics']['total_duration_ms']} ms")
    print(f" Jetons évalués   : {result['metrics'].get('eval_count', 'N/A')}")
    print("-" * 70)

if __name__ == "__main__":
    launch()
