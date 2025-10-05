from gtts import gTTS
import os

text = "Hello! I'm your AI assistant."
tts = gTTS(text=text, lang='en', tld="co.uk")
tts.save("output.mp3")
os.system("start output.mp3")  # On Windows (use "afplay" on macOS)
