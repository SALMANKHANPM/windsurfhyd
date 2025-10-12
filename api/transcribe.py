from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
import tempfile
import os
import logging
from typing import Dict
import torch
import torchaudio
import soundfile as sf
from transformers import AutoProcessor, SeamlessM4Tv2Model
import numpy as np
from scipy.io import wavfile
from datetime import datetime
import base64
import io
import shutil
import librosa
import time

import logging 

# Load model directly
from transformers import AutoProcessor, AutoModelForSpeechSeq2Seq


try:
    processor = AutoProcessor.from_pretrained("swechatelangana/whisper-small-te-146h")
    model = AutoModelForSpeechSeq2Seq.from_pretrained("swechatelangana/whisper-small-te-146h")
    device = torch.device("cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu")
    model.to(device)
    logger.info(f"Model loaded successfully on {device}")
except Exception as e:
    logger.error(f"Failed to load model: {str(e)}")
    raise RuntimeError("Model loading failed") from e

def transcribe_whisper(audio_file, language: str = "tel") -> Dict:
    try:
        audio_array, sampling_rate = sf.read(audio_file)
        audio_tensor = torch.tensor(audio_array, dtype=torch.float32)

        resampled_audio = torchaudio.functional.resample(
            audio_tensor,
            orig_freq=sampling_rate,
            new_freq=model.config.sampling_rate
        )

        audio_inputs = processor(audios=resampled_audio, return_tensors="pt", sampling_rate=model.config.sampling_rate).to(device)

        output_tokens_tel = model.generate(**audio_inputs, forced_bos_token_id=processor.tokenizer.lang_code_to_id[language])
        output_tokens_eng = model.generate(**audio_inputs, forced_bos_token_id=processor.tokenizer.lang_code_to_id["eng"])

        return {
            "transcription": processor.decode(output_tokens_tel[0], skip_special_tokens=True),
            "translation": processor.decode(output_tokens_eng[0], skip_special_tokens=True)
        }
        
    except Exception as e:
        logger.error(f"Transcription error: {str(e)}")
        raise RuntimeError("Transcription failed") from e

# Create audio directory if not exists
AUDIO_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'audio')
os.makedirs(AUDIO_DIR, exist_ok=True)

async def validate_audio(file_path: str) -> tuple:
    try:
        # Read the audio file
        with open(file_path, 'rb') as f:
            audio_bytes = f.read()

        # Create a temporary file to store the audio data
        with tempfile.NamedTemporaryFile(suffix='.webm', delete=False) as temp_file:
            temp_file.write(audio_bytes)
            temp_file_path = temp_file.name

        # Load and validate the audio file using librosa which can handle various formats
        audio_data, sample_rate = librosa.load(temp_file_path, sr=16000, mono=True)
        
        # Clean up the temporary file
        os.unlink(temp_file_path)

        # Validate duration (max 5 minutes)
        duration = librosa.get_duration(y=audio_data, sr=sample_rate)
        if duration > 300:  # 5 minutes in seconds
            raise ValueError("Audio file too long (max 5 minutes)")

        # Validate audio properties
        if len(audio_data.shape) > 1:
            raise ValueError("Only mono audio supported")

        if len(audio_data) == 0:
            raise ValueError("Empty audio file")

        return audio_data, sample_rate

    except Exception as e:
        raise ValueError(f"Audio validation failed: {str(e)}")

