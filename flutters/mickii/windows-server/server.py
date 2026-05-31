"""
Mickii Windows Server
Receives commands from the Mickii Android app over Wi-Fi (WebSocket)
and translates them into real mouse/keyboard actions on Windows.

Requirements:
    pip install websockets pyautogui pynput

Run:
    python server.py
"""

import asyncio
import json
import logging
import socket
import sys
import threading
import time

import pyautogui
import websockets
from pynput.keyboard import Controller as KeyboardController, Key
from pynput.mouse import Controller as MouseController, Button

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("mickii")

# ──────────────────────────────────────────────
# Configuration
# ──────────────────────────────────────────────
HOST = "0.0.0.0"   # listen on all interfaces
PORT = 9000
MOUSE_SENSITIVITY = 1.8   # multiplier for pointer speed

# Safety: disable pyautogui fail-safe (move mouse to corner to stop)
pyautogui.FAILSAFE = False
pyautogui.PAUSE = 0

mouse = MouseController()
keyboard = KeyboardController()

# ──────────────────────────────────────────────
# Special key mapping  (Mickii name → pynput Key)
# ──────────────────────────────────────────────
SPECIAL_KEYS: dict[str, Key] = {
    "enter":     Key.enter,
    "backspace": Key.backspace,
    "tab":       Key.tab,
    "escape":    Key.esc,
    "space":     Key.space,
    "shift":     Key.shift,
    "ctrl":      Key.ctrl,
    "alt":       Key.alt,
    "win":       Key.cmd,
    "up":        Key.up,
    "down":      Key.down,
    "left":      Key.left,
    "right":     Key.right,
    "delete":    Key.delete,
    "home":      Key.home,
    "end":       Key.end,
    "pageup":    Key.page_up,
    "pagedown":  Key.page_down,
    "f1":  Key.f1,  "f2":  Key.f2,  "f3":  Key.f3,  "f4":  Key.f4,
    "f5":  Key.f5,  "f6":  Key.f6,  "f7":  Key.f7,  "f8":  Key.f8,
    "f9":  Key.f9,  "f10": Key.f10, "f11": Key.f11, "f12": Key.f12,
    # Media keys
    "media_play_pause": Key.media_play_pause,
    "media_next":       Key.media_next,
    "media_previous":   Key.media_previous,
    "volume_up":        Key.media_volume_up,
    "volume_down":      Key.media_volume_down,
    "volume_mute":      Key.media_volume_mute,
}

# ──────────────────────────────────────────────
# Command handlers
# ──────────────────────────────────────────────

def handle_mouse_move(data: dict) -> None:
    """Relative mouse movement from touchpad drag."""
    dx = data.get("dx", 0) * MOUSE_SENSITIVITY
    dy = data.get("dy", 0) * MOUSE_SENSITIVITY
    current = mouse.position
    mouse.position = (current[0] + dx, current[1] + dy)


def handle_mouse_click(data: dict) -> None:
    btn_name = data.get("button", "left")
    double   = data.get("double", False)
    count    = 2 if double else 1
    btn = {"left": Button.left, "right": Button.right, "middle": Button.middle}.get(btn_name, Button.left)
    mouse.click(btn, count)


def handle_scroll(data: dict) -> None:
    dx = data.get("dx", 0)
    dy = data.get("dy", 0)
    mouse.scroll(dx, dy)


def handle_key(data: dict) -> None:
    key_name = data.get("key", "").lower()
    action   = data.get("action", "tap")   # tap | press | release

    key = SPECIAL_KEYS.get(key_name)

    if key:
        if action == "press":
            keyboard.press(key)
        elif action == "release":
            keyboard.release(key)
        else:
            keyboard.press(key)
            keyboard.release(key)
    elif len(key_name) == 1:
        # Regular printable character
        if action == "press":
            keyboard.press(key_name)
        elif action == "release":
            keyboard.release(key_name)
        else:
            keyboard.press(key_name)
            keyboard.release(key_name)
    else:
        log.warning("Unknown key: %s", key_name)


def handle_text(data: dict) -> None:
    """Type a full string at once (e.g. paste from clipboard)."""
    text = data.get("text", "")
    keyboard.type(text)


def handle_media(data: dict) -> None:
    action = data.get("action", "")
    key_map = {
        "play_pause": "media_play_pause",
        "next":       "media_next",
        "previous":   "media_previous",
        "volume_up":  "volume_up",
        "volume_down":"volume_down",
        "mute":       "volume_mute",
    }
    key_name = key_map.get(action)
    if key_name:
        handle_key({"key": key_name, "action": "tap"})
    else:
        log.warning("Unknown media action: %s", action)


HANDLERS = {
    "mouse_move":   handle_mouse_move,
    "mouse_click":  handle_mouse_click,
    "scroll":       handle_scroll,
    "key":          handle_key,
    "text":         handle_text,
    "media":        handle_media,
}

# ──────────────────────────────────────────────
# WebSocket server
# ──────────────────────────────────────────────

async def handle_client(ws):
    addr = ws.remote_address
    log.info("Client connected: %s:%s", *addr)
    try:
        async for raw in ws:
            try:
                msg = json.loads(raw)
                cmd = msg.get("cmd")
                handler = HANDLERS.get(cmd)
                if handler:
                    handler(msg)
                else:
                    log.warning("Unknown command: %s", cmd)
            except json.JSONDecodeError:
                log.error("Invalid JSON: %s", raw[:80])
            except Exception as exc:
                log.error("Error handling command: %s", exc)
    except websockets.ConnectionClosedOK:
        pass
    except websockets.ConnectionClosedError as exc:
        log.warning("Connection closed with error: %s", exc)
    finally:
        log.info("Client disconnected: %s:%s", *addr)


def get_local_ip() -> str:
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        return s.getsockname()[0]
    except Exception:
        return "127.0.0.1"
    finally:
        s.close()


async def main():
    local_ip = get_local_ip()
    log.info("=" * 48)
    log.info("  Mickii Server starting...")
    log.info("  Connect your phone to:  ws://%s:%s", local_ip, PORT)
    log.info("=" * 48)

    async with websockets.serve(handle_client, HOST, PORT):
        await asyncio.Future()   # run forever


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        log.info("Server stopped.")
