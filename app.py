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
import os
from typing import Optional
from io import BytesIO
import base64
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from PIL import Image
import time
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from guardrails import Guard
from dotenv import load_dotenv
from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor, pipeline

load_dotenv()

# Whisper model configuration (lazy loading)
whisper_pipe = None

def get_whisper_pipeline():
    """Lazy load Whisper pipeline to avoid loading at startup"""
    global whisper_pipe
    
    if whisper_pipe is None:
        logger.info("Loading Whisper model...")
        
        device = "mps" if torch.backends.mps.is_available() else ("cuda:0" if torch.cuda.is_available() else "cpu")
        torch_dtype = torch.float16 if device in ["cuda:0", "mps"] else torch.float32
        
        model_id = os.getenv("WHISPER_MODEL", "openai/whisper-large-v3")
        
        model = AutoModelForSpeechSeq2Seq.from_pretrained(
            model_id, 
            torch_dtype=torch_dtype, 
            low_cpu_mem_usage=True, 
            use_safetensors=True
        )
        model.to(device)
        
        processor = AutoProcessor.from_pretrained(model_id)
        
        whisper_pipe = pipeline(
            "automatic-speech-recognition",
            model=model,
            tokenizer=processor.tokenizer,
            feature_extractor=processor.feature_extractor,
            torch_dtype=torch_dtype,
            device=device,
        )
        
        logger.info(f"Whisper model loaded on device: {device}")
    
    return whisper_pipe

def transcribe_with_whisper(audio_path: str, language: str = None, task: str = "transcribe"):
    """Transcribe or translate audio using Whisper pipeline"""
    try:
        pipe = get_whisper_pipeline()
        
        # Prepare generate_kwargs
        generate_kwargs = {
            "max_new_tokens": 440,
            "num_beams": 1,
            "condition_on_prev_tokens": False,
            "compression_ratio_threshold": 1.35,
            "temperature": (0.0, 0.2, 0.4, 0.6, 0.8, 1.0),
            "logprob_threshold": -1.0,
            "no_speech_threshold": 0.6,
            "return_timestamps": True,
        }
        
        # Add language if specified
        if language:
            generate_kwargs["language"] = language
        
        # Add task (transcribe or translate)
        generate_kwargs["task"] = task
        
        logger.info(f"Transcribing audio: {audio_path}")
        logger.info(f"Generate kwargs: {generate_kwargs}")
        
        # Run the pipeline
        result = pipe(audio_path, generate_kwargs=generate_kwargs)
        
        # Extract text from result
        transcription = result["text"].strip() if "text" in result else ""
        
        logger.info(f"Transcription completed: {transcription[:100]}...")
        return transcription
        
    except Exception as e:
        logger.error(f"Transcription error: {str(e)}")
        raise

def _is_telugu_text(text: str) -> bool:
    """Check if text contains Telugu characters"""
    telugu_range = range(0x0C00, 0x0C7F)  # Telugu Unicode range
    return any(ord(char) in telugu_range for char in text)

# from .guardrails.toxic_language_detector.validator.main import ToxicLanguage

# # from .api.model_downloader import download_model

# from .api.transcribe import transcribe_m4t, validate_audio
# Initialize logger with more detailed format
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# FastAPI app configuration
app = FastAPI(
    title="Conversational AI API",
    description="A Multimodal Conversational AI API with Guardrails and Langchain",
    version="1.0.0",
    docs_url="/api/py/docs",
    openapi_url="/api/py/openapi.json"
)

# Create audio directory if not exists
AUDIO_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'audio')
os.makedirs(AUDIO_DIR, exist_ok=True)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("ALLOWED_ORIGINS", "*")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ValidateRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)

class ProcessOptions(BaseModel):
    temperature: Optional[float] = Field(default=0.7, ge=0, le=1)
    maxTokens: Optional[int] = Field(default=1000, ge=1, le=4096)
    image_data: Optional[str] = None
    audio_data: Optional[str] = None
    sourceLang: Optional[str] = None
    targetLang: Optional[str] = None

class ProcessRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=5000)
    options: Optional[ProcessOptions] = None

class ImageRequest(BaseModel):
    image_data: str = Field(..., description="Base64 encoded image data")

# Initialize Guard with toxic language detection
# guard = Guard().use_many(
#     ToxicLanguage(
#     threshold=float(os.getenv("TOXIC_THRESHOLD", "0.5")),
#     validation_method=os.getenv("VALIDATION_METHOD", "sentence"),
#     on_fail="fix",
#     device=os.getenv("DEVICE", "mps"),
#     use_local=True),
# )

# Initialize LLM
llm = ChatOpenAI(
    base_url=os.getenv("LLM_BASE_URL","https://integrate.api.nvidia.com/v1/"),
    api_key=os.getenv("LLM_API_KEY", "NA"),
    model=os.getenv("LLM_MODEL", "gemma3")
)

def validate_text(text: str) -> dict:
    #validation_result = guard.validate(text)
    # for summary in validation_result.validation_summaries:
    #     return {
    #         "validator_status": 200,
    #         "reason": summary.error_spans[0].reason if summary.error_spans else None
    #     }
    return {"validator_status": "pass", "reason": None}

def process_image_prompt(image_data: str, prompt_text: str) -> str:
    logger.info(f"Processing image prompt: {prompt_text[:100]}...")

    try:
        # Decode and process image
        image_bytes = base64.b64decode(image_data)
        image = Image.open(BytesIO(image_bytes))

        # Convert all image modes to RGB for JPEG compatibility
        if image.mode == 'RGBA':
            # Create white background for transparent images
            background = Image.new('RGB', image.size, (255, 255, 255))
            # Paste using alpha channel as mask
            background.paste(image, mask=image.split()[3])
            image = background
        elif image.mode == 'LA':
            # Grayscale with alpha
            background = Image.new('RGB', image.size, (255, 255, 255))
            background.paste(image.convert('L'), mask=image.split()[1])
            image = background
        elif image.mode not in ('RGB', 'L'):
            # Convert palette mode (P) and other modes to RGB
            image = image.convert('RGB')
        elif image.mode == 'L':
            # Convert grayscale to RGB
            image = image.convert('RGB')

        # Prepare image for LLM
        buffered = BytesIO()
        image.save(buffered, format="JPEG")
        image_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")

        # Create message content - NVIDIA API format with HTML img tag
        messages = [
            {
                "role": "system",
                "content": "You are a helpful assistant that can answer questions, provide information, and engage in conversation on a wide range of topics. If user send the question in telugu, respond in telugu, if user using telugu language but in english words, still respond in telugu language, if english language but in telugu words, still respond in telugu language, if english language and english words, respond in english language. Please do not provide explaination for question in response. Just respond with the final response. Limit your response to 100 words."
            },
            {
                "role": "user",
                "content": f'{prompt_text} <img src="data:image/jpeg;base64,{image_base64}" />'
            }
        ]

        # Process with LLM
        response = llm.invoke(messages)
        return response.content

    except Exception as e:
        logger.error(f"Image processing error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process image: {str(e)}"
        )

# Unused function - commented out because guard is not initialized
# def process_text_prompt(prompt_text: str) -> dict:
#     logger.info("Processing text prompt: %s", prompt_text)
#     prompt = ChatPromptTemplate.from_messages([
#         ("human", prompt_text)
#     ])
#     output_parser = StrOutputParser()
#     chain = prompt | guard.to_runnable() | llm | output_parser
#     logger.info("Running the chain... : %s", chain)
#     response = chain.invoke({})
#     return {"status": "success", "response": response}

@app.post("/api/py/validate")
async def validate(request: ValidateRequest):
    try:
        result = validate_text(request.text)
        print(result)
        return result
    except Exception as e:
        logger.error("Validation error: %s", str(e))
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/py/health")
def health():
    return 200

@app.post("/api/py/transcribe")
# async def transcribe(request: Request):
#     try:
#         # Read the raw body
#         body = await request.body()
        
#         # Find the audio data boundary
#         content = body.decode('latin1')
#         boundary = content.split('\r\n')[0]
        
#         # Split the content by boundary
#         parts = content.split(boundary)
        
#         # Find the part containing audio data
#         for part in parts:
#             if 'Content-Type: audio/' in part:
#                 # Extract the audio data
#                 audio_data = part.split('\r\n\r\n')[1].split('\r\n')[0]
#                 audio_bytes = audio_data.encode('latin1')
#                 break
#         else:
#             raise ValueError("No audio data found in request")
        
#         # Get target language from query parameters, default to None
#         target_lang = request.query_params.get("targetLang")
        
#         # Transcribe the audio
#         transcription = await transcribe_m4t(audio_data, target_lang)
        
#         # Return the transcription
#         return {"status": "success", "transcription": transcription}

#     except Exception as e:
#         logger.error(f"Transcription error: {str(e)}")
#         raise HTTPException(
#             status_code=500,
#             detail=f"Failed to transcribe audio: {str(e)}"
#         )

async def transcribe_audio(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    lang: str = "te"  # Language parameter: "te" for Telugu, "en" for English
):
    ACCEPTED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/webm', 'audio/wav', 'audio/aac', 'audio/mp4', 'audio/m4a']
    if file.content_type not in ACCEPTED_AUDIO_TYPES:
        raise HTTPException(status_code=400, detail=f"Please upload a valid audio file ({', '.join(ACCEPTED_AUDIO_TYPES)})")

    # Validate language parameter
    if lang not in ["te", "en"]:
        raise HTTPException(status_code=400, detail="Language must be 'te' (Telugu) or 'en' (English)")

    temp_file_path = None
    
    try:
        # Create temporary file for audio
        temp_file_path = os.path.join(AUDIO_DIR, f"audio_{int(time.time())}_{file.filename}")

        # Save uploaded file
        with open(temp_file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)

        logger.info(f"Audio file saved: {temp_file_path}, requested language: {lang}")

        # Prepare base output
        output = {
            "status": "success",
            "tel": None,  # Telugu transcription
            "eng": None,  # English transcription/translation
            "generation": None,
            "language": lang,
        }

        if lang == "te":
            # First, get English translation (this works well)
            logger.info("Translating Telugu audio to English...")
            english_translation = transcribe_with_whisper(
                temp_file_path, 
                language=None,  # Auto-detect source language
                task="translate"  # Translate to English
            )
            output["eng"] = english_translation.strip()
            logger.info(f"English translation: {output['eng'][:100]}...")
            
            # Then translate the English back to Telugu using LLM for better quality
            logger.info("Translating English to Telugu using LLM...")
            try:
                telugu_prompt = f"Translate the following English text to Telugu language. Provide only the Telugu text in Telugu script (తెలుగు లిపి), nothing else:\n\n{english_translation}"
                telugu_messages = [
                    {
                        "role": "system",
                        "content": "You are a professional assistant, helping users who speak telugu and english languages. Respond to the user's query in Telugu language. and english language"
                    },
                    {
                        "role": "user",
                        "content": telugu_prompt
                    }
                ]
                telugu_response = llm.invoke(telugu_messages)
                output["tel"] = telugu_response.content.strip()
                output["generation"] = telugu_response.content.strip()
                logger.info(f"Telugu transcription (via LLM): {output['tel'][:100]}...")
            except Exception as e:
                logger.error(f"Failed to translate to Telugu: {str(e)}")
                # Fallback: try direct Telugu transcription from whisper
                logger.info("Fallback: Attempting direct Telugu transcription from Whisper...")
                try:
                    telugu_transcription = transcribe_with_whisper(
                        temp_file_path, 
                        language="te",
                        task="transcribe"
                    )
                    output["tel"] = telugu_transcription.strip()
                    output["generation"] = telugu_transcription.strip()
                except Exception as fallback_error:
                    logger.error(f"Fallback also failed: {str(fallback_error)}")
                    output["tel"] = f"[Translation failed]"
            
        else:  # lang == "en"
            # Transcribe in English
            logger.info("Transcribing audio in English...")
            english_transcription = transcribe_with_whisper(
                temp_file_path, 
                language="en",
                task="transcribe"
            )
            output["eng"] = english_transcription.strip()
            output["generation"] = english_transcription.strip()
            logger.info(f"English transcription: {output['eng'][:100]}...")
            
            # Translate English to Telugu using LLM
            logger.info("Translating English to Telugu using LLM...")
            try:
                telugu_prompt = f"Translate the following English text to Telugu language. Only provide the Telugu translation, nothing else:\n\n{english_transcription}"
                telugu_messages = [
                    {
                        "role": "system",
                        "content": "You are a professional translator. Translate English text to Telugu accurately. Only provide the translation without any explanations."
                    },
                    {
                        "role": "user",
                        "content": telugu_prompt
                    }
                ]
                telugu_response = llm.invoke(telugu_messages)
                output["tel"] = telugu_response.content.strip()
                logger.info(f"Telugu translation: {output['tel'][:100]}...")
            except Exception as e:
                logger.error(f"Failed to translate to Telugu: {str(e)}")
                output["tel"] = f"[Translation failed: {str(e)}]"

        logger.info(f"Final output - Telugu: {output['tel'][:50] if output['tel'] else 'None'}, English: {output['eng'][:50] if output['eng'] else 'None'}")

        # Cleanup file in background
        background_tasks.add_task(lambda: os.remove(temp_file_path) if os.path.exists(temp_file_path) else None)

        return JSONResponse(content=output)

    except Exception as e:
        logger.error(f"Transcription error: {str(e)}", exc_info=True)
        
        # Cleanup file if error occurs
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except:
                pass
        
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to transcribe audio: {str(e)}"
        )

@app.post("/api/py/process")
async def process_request(prompt_request: ProcessRequest):
    logger.info(f"Processing request with prompt: {prompt_request.prompt[:100]}...")

    try:
        # Validate text input
        validation_result = validate_text(prompt_request.prompt)
        print("=== Validation result: ", validation_result)
        if validation_result["validator_status"] == "fail":
            return {
                "status": "fail",
                "response": validation_result["reason"]
            }

        # Process based on input type
        if prompt_request.options and prompt_request.options.image_data:
            response = process_image_prompt(
                prompt_request.options.image_data,
                prompt_request.prompt
            )
        else:
            # Text-only processing
            messages = [{"role": "user", "content": prompt_request.prompt}]
            response = llm.invoke(messages)
            response = response.content
            print("=== Prompt : ",prompt_request.prompt)
            print("=== Response : ",response)

        return {
            "status": "success",
            "response": response
        }

    except Exception as e:
        logger.error(f"Request processing error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process request: {str(e)}"
        )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception handler caught: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "error": "An unexpected error occurred. Please try again later."
        }
    )

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/")
def read_root():
    return {"message": "Welcome to the Toxic Language Detector API!"}

def setup():
    logger.info("Setting up the application... : Backend API")
    # logger.info("Looking for Transformers model :  Seamless-M4T-V2-Large")
    # SEAMLESS_MODEL_PATH="~/.cache/huggingface/hub/facebook/seamless-m4t-v2-large"
    # if not os.path.exists(SEAMLESS_MODEL_PATH):
    #     logger.info("Downloading Seamless-M4T-V2-Large model...")
    #     download_model(SEAMLESS_MODEL_PATH)
