import os
import tempfile
from fastapi.responses import FileResponse
from gtts import gTTS


def process_tts(text : str):
    lang = "en"

    # Generate temporary mp3 file
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
    tts = gTTS(text=text, lang=lang)
    tts.save(tmp.name)


    # Return the mp3 file directly
    return FileResponse(tmp.name, media_type="audio/mpeg", filename="speech.mp3")

