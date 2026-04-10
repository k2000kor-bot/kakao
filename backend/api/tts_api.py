"""
Qwen3-TTS 프록시 API
OpenAI 호환 /v1/audio/speech 엔드포인트로 텍스트→음성 및 보이스 클로닝 지원.
딥러닝 기반 참조 음성 보정(노이즈 감소·정규화) 및 자연스러움 지시로 동일 목소리·자연스러운 합성 지원.
QWEN_TTS_BASE_URL 미설정 시 gTTS 폴백 사용.
"""

import asyncio
import base64
import io
import logging
import os
import tempfile
from typing import Literal, Optional

import io
from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import Response
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/tts", tags=["tts"])

# Qwen3-TTS 서버 URL (예: vLLM-Omni 서버 http://localhost:8000)
# 미설정 시 빈 문자열 → /speech 요청 시 gTTS 폴백 사용 (pip install gtts 권장)
QWEN_TTS_BASE_URL = (os.environ.get("QWEN_TTS_BASE_URL") or "").rstrip("/")


# 보이스 클로닝 최대 품질용 기본값 (Base 태스크)
VOICE_CLONE_MAX_NEW_TOKENS = 4096
VOICE_CLONE_RESPONSE_FORMAT = "wav"
VOICE_CLONE_DEFAULT_MAX_TOKENS = 4096

# 특정 상황에 맞는 성우 목소리 지시 (instructions에 반영)
# 영화·드라마 대사: 원하는 목소리를 학습(ref_audio)한 뒤 대본을 그 목소리로 연기하듯 생성할 때 사용
TTS_SITUATION_INSTRUCTIONS: dict[str, str] = {
    "default": "",
    "narration": "차분한 나레이션 톤으로, 듣기 편하게 말해주세요. 억양은 부드럽고 일정하게.",
    "news": "뉴스 앵커처럼 정확하고 신뢰감 있게, 딕션을 분명히 말해주세요.",
    "emotional": "감정이 담긴 연기처럼, 상황에 맞는 억양과 호흡으로 말해주세요.",
    "children": "동화 나레이션처럼 따뜻하고 부드럽게, 아이들이 듣기 좋은 톤으로 말해주세요.",
    "ad": "광고 내레이션처럼 생동감 있고 설득력 있게, 리듬감 있게 말해주세요.",
    "documentary": "다큐멘터리 나레이션처럼 차분하고 객관적으로, 정보를 전달하는 톤으로 말해주세요.",
    "audiobook": "오디오북처럼 자연스럽고 몰입감 있게, 등장인물에 맞는 톤을 살려 말해주세요.",
    "game_character": "게임 캐릭터 대사처럼 캐릭터에 맞는 톤과 감정으로 말해주세요.",
    "announcement": "안내 방송처럼 명확하고 차분하게, 중요한 내용이 잘 전달되도록 말해주세요.",
    "warm_story": "이야기하듯 따뜻하고 친근하게, 청취자가 편안히 들을 수 있게 말해주세요.",
    "professional": "비즈니스·전문가처럼 신뢰감 있고 정중하게, 명확하게 말해주세요.",
    "exciting": "흥미진진하고 역동적으로, 긴장감이나 설렘이 전달되도록 말해주세요.",
    # 영화·드라마 대사: 참조 목소리를 유지하면서 대본을 연기하듯 말하기
    "movie_dialogue": "영화 대사처럼 연기 톤으로 말해주세요. 감정선과 호흡을 살리고, 대사 리듬이 자연스럽게. 딕션은 분명히, 장면에 맞는 톤으로.",
    "drama_dialogue": "드라마 대사처럼 연기하듯 말해주세요. 캐릭터에 맞는 감정과 억양, 말투를 유지하고 대본을 그 목소리로 자연스럽게 전달해 주세요.",
    "film_acting": "영화·드라마 연기처럼 대사를 소화해 주세요. 참조한 목소리 톤을 유지하면서, 주어진 대본을 감정과 호흡에 맞게 말해 주세요.",
}
TTS_SITUATION_TYPES = list(TTS_SITUATION_INSTRUCTIONS.keys())


class TtsSpeechRequest(BaseModel):
    """TTS 음성 생성 요청 (Qwen3-TTS /v1/audio/speech 호환)"""

    input: str = Field(..., description="합성할 텍스트")
    voice: Optional[str] = Field("Vivian", description="스피커/보이스 이름 (CustomVoice)")
    response_format: Optional[Literal["wav", "mp3", "flac", "pcm", "aac", "opus"]] = Field(
        "mp3", description="오디오 포맷 (클로닝 품질 최대화 시 wav 권장)"
    )
    speed: Optional[float] = Field(1.0, ge=0.25, le=4.0, description="재생 속도")
    model: Optional[str] = Field(None, description="모델명 (서버 단일 모델 시 생략)")
    task_type: Optional[Literal["CustomVoice", "VoiceDesign", "Base"]] = Field(
        "CustomVoice", description="CustomVoice / VoiceDesign / Base(클로닝)"
    )
    language: Optional[str] = Field("Auto", description="Auto, Chinese, English, Japanese, Korean")
    instructions: Optional[str] = Field(None, description="스타일/감정 지시")
    max_new_tokens: Optional[int] = Field(
        2048,
        description="최대 생성 토큰 (보이스 클로닝·긴 문장 시 4096 권장)",
    )
    ref_audio: Optional[str] = Field(
        None,
        description="참조 오디오: URL 또는 data:audio/...;base64,... (Base 태스크)",
    )
    ref_text: Optional[str] = Field(
        None,
        description="참조 오디오 대본 (Base 태스크, ICL 시 정확한 대본 권장)",
    )
    x_vector_only_mode: Optional[bool] = Field(
        False,
        description="True: 스피커 임베딩만 사용해 임의 텍스트에 동일 보이스 적용 (ICL 미사용)",
    )
    quality_preset: Optional[Literal["standard", "high", "voice_clone_max"]] = Field(
        None,
        description="voice_clone_max: 클로닝 품질·동일 보이스 유지 최대화 (Base, wav, 4096 토큰)",
    )
    enhance_ref_audio: Optional[bool] = Field(
        False,
        description="True: 참조 음성에 딥러닝 기반 노이즈 감소·음량 정규화 적용 후 클로닝 (자연스러운 결과)",
    )
    naturalness_mode: Optional[Literal["off", "auto", "natural"]] = Field(
        "off",
        description="natural/auto: 합성 시 자연스러움 지시 추가 (일상 말투·부드러운 톤)",
    )
    situation: Optional[str] = Field(
        None,
        description="특정 상황에 맞는 성우 목소리: narration, news, emotional, children, ad, documentary, audiobook, game_character, announcement, warm_story, professional, exciting 등",
    )


class TtsSpeechFromSourceRequest(BaseModel):
    """YouTube/TikTok 등 URL에서 목소리를 학습해 텍스트를 해당 목소리로 합성하는 요청"""

    source_url: str = Field(..., description="YouTube 또는 TikTok 영상 URL")
    input: str = Field(..., description="합성할 텍스트 (대복할 내용)")
    ref_text_override: Optional[str] = Field(
        None,
        description="참조 대본 수동 입력 (미입력 시 자동 추출 시도)",
    )
    max_ref_seconds: Optional[int] = Field(
        10,
        ge=3,
        le=60,
        description="참조로 사용할 영상 구간 길이(초). 3~60, 기본 10초",
    )
    start_seconds: Optional[float] = Field(
        None,
        ge=0,
        description="해당 목소리만: 구간 시작(초). 여러 화자 중 한 명만 쓸 때",
    )
    end_seconds: Optional[float] = Field(
        None,
        ge=0,
        description="해당 목소리만: 구간 끝(초)",
    )
    quality_preset: Optional[Literal["standard", "high", "voice_clone_max"]] = Field(
        "voice_clone_max",
        description="voice_clone_max 권장 (동일 목소리 품질 최대화)",
    )
    enhance_ref_audio: Optional[bool] = Field(True, description="참조 음성 딥러닝 보정 적용")
    naturalness_mode: Optional[Literal["off", "auto", "natural"]] = Field(
        "natural",
        description="자연스러운 말투 지시",
    )
    response_format: Optional[Literal["wav", "mp3", "flac"]] = Field("mp3", description="출력 오디오 포맷")
    situation: Optional[str] = Field(
        None,
        description="특정 상황에 맞는 성우 목소리: narration, news, emotional, children, ad 등",
    )
    speed: Optional[float] = Field(1.0, ge=0.25, le=4.0, description="재생 속도 (0.25~4.0)")
    instructions: Optional[str] = Field(None, description="스타일/감정 추가 지시 (예: 서러운듯 울먹이며)")


class TtsSpeechFromProjectRequest(BaseModel):
    """노트북 LLM 프로젝트에 등록된 보이스 소스로 텍스트를 해당 목소리로 합성하는 요청"""

    project_id: str = Field(..., description="프로젝트 ID (노트북 LLM)")
    input: str = Field(..., description="합성할 텍스트 (대복할 내용)")
    voice_source_id: Optional[str] = Field(
        None,
        description="사용할 보이스 소스 ID (미입력 시 첫 번째 소스 사용)",
    )
    max_ref_seconds: Optional[int] = Field(10, ge=3, le=60, description="참조 구간 길이(초)")
    quality_preset: Optional[Literal["standard", "high", "voice_clone_max"]] = Field("voice_clone_max")
    enhance_ref_audio: Optional[bool] = Field(True)
    naturalness_mode: Optional[Literal["off", "auto", "natural"]] = Field("natural")
    response_format: Optional[Literal["wav", "mp3", "flac"]] = Field("mp3")
    situation: Optional[str] = Field(None, description="특정 상황에 맞는 성우 목소리")
    speed: Optional[float] = Field(1.0, ge=0.25, le=4.0, description="재생 속도 (0.25~4.0)")
    instructions: Optional[str] = Field(None, description="스타일/감정 추가 지시 (예: 명료하게, 따뜻하게)")


def _get_tts_base_url() -> str:
    if not QWEN_TTS_BASE_URL:
        raise HTTPException(
            status_code=503,
            detail="QWEN_TTS_BASE_URL가 설정되지 않았습니다. Qwen3-TTS 서버 URL을 설정해 주세요.",
        )
    return QWEN_TTS_BASE_URL


def _gtts_available() -> bool:
    """gTTS 폴백 사용 가능 여부."""
    try:
        from gtts import gTTS  # noqa: F401
        return True
    except ImportError:
        return False


def _tts_fallback_gtts_sync(text: str, lang: str = "ko") -> tuple[bytes, str]:
    """Qwen 미설정 시 gTTS로 mp3 생성. (bytes, content_type) 반환. 동기 함수(스레드에서 호출)."""
    text = (text or "").strip()
    if not text:
        raise ValueError("합성할 텍스트가 비어 있습니다.")
    if len(text) > 5000:
        text = text[:5000]
    try:
        from gtts import gTTS
    except ImportError as e:
        raise ValueError(
            "TTS 서버가 설정되지 않았습니다. QWEN_TTS_BASE_URL를 설정하거나 "
            "폴백 음성 사용을 위해 pip install gtts 를 실행해 주세요."
        ) from e
    buf = io.BytesIO()
    tts = gTTS(text=text, lang=lang)
    tts.write_to_fp(buf)
    return buf.getvalue(), "audio/mpeg"


def _enhance_ref_audio(ref_audio_data_url: str) -> str:
    """
    참조 음성에 딥러닝/신호처리 기반 보정 적용: 노이즈 감소·음량 정규화.
    동일 목소리 클로닝 품질·자연스러움 향상을 위해 사용.
    라이브러리 미설치 시 원본 그대로 반환.
    """
    if not ref_audio_data_url.strip().startswith("data:audio"):
        return ref_audio_data_url
    try:
        # data:audio/wav;base64,xxx 파싱
        header, b64 = ref_audio_data_url.split(",", 1)
        mime = "audio/wav"
        if ";base64" in header:
            mime = header.split(";")[0].replace("data:", "").strip() or "audio/wav"
        raw = base64.b64decode(b64)
    except Exception as e:
        logger.warning("ref_audio base64 decode failed: %s", e)
        return ref_audio_data_url

    try:
        import numpy as np
    except ImportError:
        return ref_audio_data_url

    y, sr = None, None
    try:
        import librosa
    except ImportError:
        logger.debug("librosa not available, skipping ref audio enhancement")
        return ref_audio_data_url

    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
        f.write(raw)
        path = f.name
    try:
        y, sr = librosa.load(path, sr=None, mono=True)
    except Exception as e:
        logger.warning("librosa load failed: %s", e)
        return ref_audio_data_url
    finally:
        try:
            os.unlink(path)
        except OSError:
            pass

    # 음량 정규화 (RMS) — 자연스러운 레벨로
    rms = (np.mean(y ** 2) + 1e-8) ** 0.5
    if rms > 1e-8:
        target_rms = 0.05
        y = y * (target_rms / rms)
        y = np.clip(y, -1.0, 1.0)

    # 노이즈 감소 (선택)
    try:
        import noisereduce as nr
        y = nr.reduce_noise(y=y, sr=sr, prop_decrease=0.75, stationary=True)
    except ImportError:
        pass
    except Exception as e:
        logger.debug("noisereduce failed: %s", e)

    # wav로 인코딩
    try:
        import soundfile as sf
        buf = io.BytesIO()
        sf.write(buf, y, sr, format="WAV")
        out_bytes = buf.getvalue()
    except ImportError:
        try:
            import scipy.io.wavfile as wavio
            buf = io.BytesIO()
            wavio.write(buf, sr, (y * 32767).astype(np.int16))
            out_bytes = buf.getvalue()
        except ImportError:
            return ref_audio_data_url
    except Exception as e:
        logger.warning("soundfile write failed: %s", e)
        return ref_audio_data_url

    b64_out = base64.b64encode(out_bytes).decode("utf-8")
    return f"data:{mime};base64,{b64_out}"


def _apply_naturalness_instructions(instructions: Optional[str], mode: Optional[str]) -> Optional[str]:
    """자연스러움 모드에 따라 instructions에 자연스러운 말투 지시를 추가."""
    if mode not in ("auto", "natural"):
        return instructions
    natural_hint = "자연스럽고 부드럽게, 일상적인 말투로 말해주세요. 억양과 호흡을 자연스럽게."
    if instructions:
        return f"{instructions} {natural_hint}"
    return natural_hint


def _get_situation_instructions(situation: Optional[str]) -> Optional[str]:
    """특정 상황에 맞는 성우 목소리 지시 반환. 없으면 None."""
    if not situation or not situation.strip():
        return None
    key = situation.strip().lower()
    return TTS_SITUATION_INSTRUCTIONS.get(key) or None


def _merge_instructions(*parts: Optional[str]) -> Optional[str]:
    """여러 지시 문구를 공백으로 이어 반환. 비어 있으면 None."""
    merged = " ".join((p or "").strip() for p in parts if (p or "").strip())
    return merged.strip() or None


def _is_supported_media_url(url: str) -> bool:
    """YouTube/TikTok 등 지원 URL인지 확인."""
    url_lower = (url or "").strip().lower()
    return (
        "youtube.com" in url_lower
        or "youtu.be" in url_lower
        or "tiktok.com" in url_lower
        or "vm.tiktok.com" in url_lower
    )


def _download_audio_from_source_url(
    url: str,
    max_seconds: int = 10,
    start_seconds: Optional[float] = None,
    end_seconds: Optional[float] = None,
) -> tuple[bytes, str]:
    """
    YouTube/TikTok URL에서 오디오만 추출. 최대 max_seconds 구간 사용.
    start_seconds/end_seconds 지정 시 해당 구간만 사용(여러 화자 중 한 명만 학습 시).
    반환: (wav_bytes, "audio/wav"). yt-dlp·ffmpeg 필요.
    """
    if not _is_supported_media_url(url):
        raise HTTPException(
            status_code=400,
            detail="지원 URL: YouTube(youtube.com, youtu.be), TikTok(tiktok.com, vm.tiktok.com)",
        )
    try:
        import yt_dlp
    except ImportError:
        raise HTTPException(
            status_code=501,
            detail="영상에서 음성 추출을 위해 yt-dlp가 필요합니다. pip install yt-dlp",
        )
    out_dir = tempfile.mkdtemp()
    out_path = os.path.join(out_dir, "audio.%(ext)s")
    ydl_opts = {
        "format": "bestaudio/best",
        "outtmpl": out_path,
        "quiet": True,
        "no_warnings": True,
        "postprocessors": [
            {
                "key": "FFmpegExtractAudio",
                "preferredcodec": "wav",
                "preferredquality": None,
            }
        ],
    }
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
    except Exception as e:
        logger.warning("yt-dlp download failed: %s", e)
        raise HTTPException(status_code=502, detail=f"영상 다운로드 실패: {e!s}")
    wav_candidates = [
        os.path.join(out_dir, f)
        for f in os.listdir(out_dir)
        if f.endswith(".wav")
    ]
    if not wav_candidates:
        for f in os.listdir(out_dir):
            if f.startswith("audio."):
                wav_candidates = [os.path.join(out_dir, f)]
                break
    if not wav_candidates:
        raise HTTPException(status_code=502, detail="오디오 추출 결과 없음")
    wav_file = wav_candidates[0]
    try:
        with open(wav_file, "rb") as f:
            raw = f.read()
    finally:
        try:
            for f in os.listdir(out_dir):
                os.unlink(os.path.join(out_dir, f))
            os.rmdir(out_dir)
        except OSError:
            pass
    # 참조 구간: start_seconds/end_seconds 지정 시 해당 구간만, 아니면 앞부분 max_seconds
    try:
        import librosa
        import numpy as np
        y, sr = librosa.load(io.BytesIO(raw), sr=None, mono=True)
        if start_seconds is not None or end_seconds is not None:
            start_s = int(sr * (start_seconds if start_seconds is not None else 0))
            end_s = int(sr * end_seconds) if end_seconds is not None else len(y)
            end_s = min(max(start_s, end_s), len(y))
            start_s = min(start_s, end_s)
            y_trim = y[start_s:end_s]
        else:
            y_trim = y
        n_max = int(sr * max_seconds) if max_seconds else len(y_trim)
        y_trim = y_trim[: min(len(y_trim), n_max)]
        if len(y_trim) == 0:
            raise ValueError("구간이 비어 있음")
        buf = io.BytesIO()
        try:
            import soundfile as sf
            sf.write(buf, y_trim, sr, format="WAV")
        except ImportError:
            import scipy.io.wavfile as wavio
            wavio.write(buf, sr, (y_trim * 32767).astype(np.int16))
        raw = buf.getvalue()
    except Exception as e:
        if max_seconds and max_seconds < 60:
            logger.debug("trim ref audio failed (using full): %s", e)
    return raw, "audio/wav"


def _transcribe_audio_for_ref(audio_bytes: bytes, mime: str) -> Optional[str]:
    """오디오에서 참조 대본 추출 (Whisper 등). 미설치 시 None."""
    try:
        import whisper
    except ImportError:
        return None
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
        f.write(audio_bytes)
        path = f.name
    try:
        model = whisper.load_model("base")
        result = model.transcribe(path, language="ko", fp16=False)
        return (result.get("text") or "").strip() or None
    except Exception as e:
        logger.debug("whisper transcribe failed: %s", e)
        return None
    finally:
        try:
            os.unlink(path)
        except OSError:
            pass


def _content_type_for_format(fmt: str) -> str:
    m = {
        "wav": "audio/wav",
        "mp3": "audio/mpeg",
        "flac": "audio/flac",
        "pcm": "audio/basic",
        "aac": "audio/aac",
        "opus": "audio/opus",
    }
    return m.get(fmt, "audio/mpeg")


async def _proxy_speech(payload: dict) -> tuple[bytes, str]:
    """Qwen3-TTS 서버에 /v1/audio/speech 요청을 보내고 (bytes, content_type) 반환."""
    import aiohttp

    base = _get_tts_base_url()
    url = f"{base}/v1/audio/speech"
    fmt = payload.get("response_format", "mp3")
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload, timeout=aiohttp.ClientTimeout(total=300)) as resp:
                if resp.status != 200:
                    text = await resp.text()
                    logger.warning("Qwen TTS error %s: %s", resp.status, text[:500])
                    raise HTTPException(
                        status_code=502,
                        detail=f"Qwen3-TTS 서버 오류: {resp.status} - {text[:200]}",
                    )
                body = await resp.read()
    except aiohttp.ClientConnectorError as e:
        logger.warning("Qwen TTS connection failed: %s", e)
        raise HTTPException(
            status_code=503,
            detail=f"Qwen TTS 서버에 연결할 수 없습니다. 서버({base})가 실행 중인지 확인해 주세요. Qwen TTS 서버 URL 변경 시 QWEN_TTS_BASE_URL 환경 변수를 설정하세요.",
        )
    except aiohttp.ClientError as e:
        logger.warning("Qwen TTS client error: %s", e)
        raise HTTPException(
            status_code=503,
            detail=f"Qwen TTS 서버 연결 오류: {e!s}",
        )
    return body, _content_type_for_format(fmt)


def _apply_quality_preset(payload: dict, preset: Optional[str]) -> dict:
    """quality_preset에 따라 보이스 클로닝·품질 최대화 파라미터 적용."""
    if preset != "voice_clone_max":
        if preset == "high":
            payload.setdefault("max_new_tokens", VOICE_CLONE_MAX_NEW_TOKENS)
            payload.setdefault("response_format", VOICE_CLONE_RESPONSE_FORMAT)
        return payload
    # voice_clone_max: 동일 보이스로 자유 텍스트 합성 품질 최대화 (Base + wav + 4096 토큰)
    payload["task_type"] = "Base"
    payload["max_new_tokens"] = VOICE_CLONE_MAX_NEW_TOKENS
    payload["response_format"] = VOICE_CLONE_RESPONSE_FORMAT
    return payload


@router.post("/speech")
async def tts_speech(request: TtsSpeechRequest) -> Response:
    """
    텍스트→음성 생성. QWEN_TTS_BASE_URL 설정 시 Qwen3-TTS, 미설정 시 gTTS 폴백.
    quality_preset=voice_clone_max 시 보이스 클로닝 품질·동일 보이스 유지를 최대화합니다.
    """
    text = (request.input or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="input(합성할 텍스트)이 필요합니다.")

    # Qwen 미설정 → gTTS 폴백 (블로킹 방지로 스레드에서 실행)
    if not QWEN_TTS_BASE_URL:
        try:
            body, content_type = await asyncio.to_thread(
                _tts_fallback_gtts_sync, text, "ko"
            )
            return Response(content=body, media_type=content_type)
        except ValueError as e:
            raise HTTPException(status_code=503, detail=str(e))
        except Exception as e:
            logger.exception("TTS gTTS fallback error: %s", e)
            raise HTTPException(status_code=502, detail=f"음성 생성 실패: {e!s}")

    payload = request.model_dump(exclude_none=True)
    if "input" not in payload:
        payload["input"] = request.input
    if "quality_preset" in payload:
        preset = payload.pop("quality_preset", None)
        payload = _apply_quality_preset(payload, preset)
    # Base 태스크일 때 기본 max_new_tokens 상향 (품질·긴 문장 대응)
    if payload.get("task_type") == "Base" and "max_new_tokens" not in payload:
        payload["max_new_tokens"] = VOICE_CLONE_DEFAULT_MAX_TOKENS
    if payload.get("task_type") == "Base" and "response_format" not in payload:
        payload["response_format"] = VOICE_CLONE_RESPONSE_FORMAT

    # 딥러닝/신호처리 기반 참조 음성 보정 (같은 목소리·자연스러운 합성)
    enhance_ref = payload.pop("enhance_ref_audio", False)
    naturalness_mode = payload.pop("naturalness_mode", None)
    if enhance_ref and payload.get("ref_audio") and str(payload["ref_audio"]).startswith("data:audio"):
        try:
            payload["ref_audio"] = _enhance_ref_audio(payload["ref_audio"])
        except Exception as e:
            logger.warning("ref_audio enhancement failed (using original): %s", e)

    # 자연스러움 지시 추가
    if naturalness_mode:
        payload["instructions"] = _apply_naturalness_instructions(
            payload.get("instructions"), naturalness_mode
        )
    situation = payload.pop("situation", None)
    if situation:
        sit_inst = _get_situation_instructions(situation)
        if sit_inst:
            payload["instructions"] = _merge_instructions(payload.get("instructions"), sit_inst)

    try:
        body, content_type = await _proxy_speech(payload)
        return Response(content=body, media_type=content_type)
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("TTS proxy error: %s", e)
        raise HTTPException(status_code=502, detail=f"TTS 처리 중 오류: {e!s}")


@router.post("/speech-from-source")
async def tts_speech_from_source(request: TtsSpeechFromSourceRequest) -> Response:
    """
    YouTube/TikTok URL에서 목소리를 학습해, 입력 텍스트를 해당 목소리로 합성(대복).
    - source_url: YouTube 또는 TikTok 영상 URL
    - input: 말할 텍스트 (대복할 내용)
    - ref_text_override: 참조 대본(미입력 시 Whisper로 자동 추출 시도)
    """
    if not _is_supported_media_url(request.source_url):
        raise HTTPException(
            status_code=400,
            detail="지원 URL: YouTube(youtube.com, youtu.be), TikTok(tiktok.com, vm.tiktok.com)",
        )
    max_sec = request.max_ref_seconds or 10
    try:
        audio_bytes, mime = _download_audio_from_source_url(
            request.source_url,
            max_seconds=max_sec,
            start_seconds=request.start_seconds,
            end_seconds=request.end_seconds,
        )
    except HTTPException:
        raise
    ref_audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")
    ref_audio_data_url = f"data:{mime};base64,{ref_audio_b64}"
    ref_text = request.ref_text_override
    if not ref_text:
        ref_text = _transcribe_audio_for_ref(audio_bytes, mime)

    payload = {
        "input": request.input,
        "task_type": "Base",
        "ref_audio": ref_audio_data_url,
        "response_format": request.response_format or "mp3",
        "max_new_tokens": VOICE_CLONE_DEFAULT_MAX_TOKENS,
        "quality_preset": request.quality_preset or "voice_clone_max",
        "enhance_ref_audio": request.enhance_ref_audio if request.enhance_ref_audio is not None else True,
        "naturalness_mode": request.naturalness_mode or "natural",
        "speed": request.speed if request.speed is not None else 1.0,
    }
    if ref_text:
        payload["ref_text"] = ref_text
    payload = _apply_quality_preset(payload, payload.pop("quality_preset", None))
    enhance_ref = payload.pop("enhance_ref_audio", False)
    naturalness_mode = payload.pop("naturalness_mode", None)
    if enhance_ref and payload.get("ref_audio"):
        try:
            payload["ref_audio"] = _enhance_ref_audio(payload["ref_audio"])
        except Exception as e:
            logger.warning("ref_audio enhancement failed (using original): %s", e)
    if naturalness_mode:
        payload["instructions"] = _apply_naturalness_instructions(payload.get("instructions"), naturalness_mode)
    if request.situation:
        sit_inst = _get_situation_instructions(request.situation)
        if sit_inst:
            payload["instructions"] = _merge_instructions(payload.get("instructions"), sit_inst)
    if request.instructions and request.instructions.strip():
        payload["instructions"] = _merge_instructions(
            payload.get("instructions"), request.instructions.strip()
        )
    try:
        body, content_type = await _proxy_speech(payload)
        return Response(content=body, media_type=content_type)
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("TTS speech-from-source error: %s", e)
        raise HTTPException(status_code=502, detail=f"TTS 처리 중 오류: {e!s}")


@router.post("/speech-from-project")
async def tts_speech_from_project(request: TtsSpeechFromProjectRequest) -> Response:
    """
    노트북 LLM 프로젝트에 등록된 보이스 소스(YouTube/TikTok 등)로 텍스트를 해당 목소리로 합성.
    - project_id: 프로젝트 ID
    - input: 말할 텍스트 (대복할 내용)
    - voice_source_id: 사용할 보이스 소스 ID (미입력 시 첫 번째 소스)
    """
    from api.project_session_api import get_project_voice_sources, load_project

    if not load_project(request.project_id):
        raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다")
    sources = get_project_voice_sources(request.project_id)
    if not sources:
        raise HTTPException(
            status_code=400,
            detail="이 프로젝트에 보이스 소스가 없습니다. YouTube/TikTok URL을 보이스 소스로 추가해 주세요.",
        )
    chosen = None
    if request.voice_source_id:
        for s in sources:
            if s.get("id") == request.voice_source_id:
                chosen = s
                break
    if not chosen:
        chosen = sources[0]
    url = (chosen.get("url") or "").strip()
    if not url or not _is_supported_media_url(url):
        raise HTTPException(status_code=400, detail="선택된 보이스 소스 URL이 유효하지 않습니다")
    ref_text_override = chosen.get("ref_text")
    start_sec = chosen.get("start_seconds")
    end_sec = chosen.get("end_seconds")
    reference_url = (chosen.get("reference_url") or "").strip()

    max_sec = request.max_ref_seconds or 10
    try:
        audio_bytes, mime = _download_audio_from_source_url(
            url,
            max_seconds=max_sec,
            start_seconds=start_sec,
            end_seconds=end_sec,
        )
    except HTTPException:
        raise

    # 심화 학습: reference_url이 있으면 같은 목소리 추가 구간을 이어 붙여 참조 품질 향상
    if reference_url and _is_supported_media_url(reference_url):
        try:
            audio_bytes_2, _ = _download_audio_from_source_url(
                reference_url, max_seconds=max_sec
            )
            import numpy as np
            import librosa
            y1, sr1 = librosa.load(io.BytesIO(audio_bytes), sr=None, mono=True)
            y2, sr2 = librosa.load(io.BytesIO(audio_bytes_2), sr=sr1, mono=True)
            y_merged = np.concatenate([y1, y2])
            total_max = min(60, len(y1) / sr1 + 10)
            n = min(len(y_merged), int(sr1 * total_max))
            y_merged = y_merged[:n]
            buf = io.BytesIO()
            try:
                import soundfile as sf
                sf.write(buf, y_merged, sr1, format="WAV")
            except ImportError:
                import scipy.io.wavfile as wavio
                wavio.write(buf, sr1, (y_merged * 32767).astype(np.int16))
            audio_bytes = buf.getvalue()
        except Exception as e:
            logger.warning("reference_url 병합 실패, 메인 URL만 사용: %s", e)

    ref_audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")
    ref_audio_data_url = f"data:{mime};base64,{ref_audio_b64}"
    ref_text = ref_text_override
    if not ref_text:
        ref_text = _transcribe_audio_for_ref(audio_bytes, mime)

    payload = {
        "input": request.input,
        "task_type": "Base",
        "ref_audio": ref_audio_data_url,
        "response_format": request.response_format or "mp3",
        "max_new_tokens": VOICE_CLONE_DEFAULT_MAX_TOKENS,
        "quality_preset": request.quality_preset or "voice_clone_max",
        "enhance_ref_audio": request.enhance_ref_audio if request.enhance_ref_audio is not None else True,
        "naturalness_mode": request.naturalness_mode or "natural",
        "speed": request.speed if request.speed is not None else 1.0,
    }
    if ref_text:
        payload["ref_text"] = ref_text
    payload = _apply_quality_preset(payload, payload.pop("quality_preset", None))
    enhance_ref = payload.pop("enhance_ref_audio", False)
    naturalness_mode = payload.pop("naturalness_mode", None)
    if enhance_ref and payload.get("ref_audio"):
        try:
            payload["ref_audio"] = _enhance_ref_audio(payload["ref_audio"])
        except Exception as e:
            logger.warning("ref_audio enhancement failed (using original): %s", e)
    if naturalness_mode:
        payload["instructions"] = _apply_naturalness_instructions(payload.get("instructions"), naturalness_mode)
    if request.situation:
        sit_inst = _get_situation_instructions(request.situation)
        if sit_inst:
            payload["instructions"] = _merge_instructions(payload.get("instructions"), sit_inst)
    if request.instructions and request.instructions.strip():
        payload["instructions"] = _merge_instructions(
            payload.get("instructions"), request.instructions.strip()
        )
    try:
        body, content_type = await _proxy_speech(payload)
        return Response(content=body, media_type=content_type)
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("TTS speech-from-project error: %s", e)
        raise HTTPException(status_code=502, detail=f"TTS 처리 중 오류: {e!s}")


@router.get("/voices")
async def tts_voices():
    """
    Qwen3-TTS CustomVoice 모델에서 사용 가능한 보이스 목록 조회.
    """
    import aiohttp

    base = _get_tts_base_url()
    url = f"{base}/v1/audio/voices"
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                if resp.status != 200:
                    text = await resp.text()
                    logger.warning("Qwen TTS voices error %s: %s", resp.status, text[:300])
                    return {"success": True, "voices": [], "message": "voices endpoint not available"}
                data = await resp.json()
                return {"success": True, "voices": data if isinstance(data, list) else data.get("data", data)}
    except HTTPException:
        raise
    except aiohttp.ClientConnectorError as e:
        logger.warning("TTS voices connection failed: %s", e)
        raise HTTPException(
            status_code=503,
            detail=f"Qwen TTS 서버에 연결할 수 없습니다. 서버({base})가 실행 중인지 확인해 주세요.",
        )
    except Exception as e:
        logger.warning("TTS voices fetch error: %s", e)
        return {"success": True, "voices": [], "message": str(e)}


@router.get("/config")
async def tts_config():
    """TTS 사용 가능 여부. Qwen 미설정 시 gTTS 폴백 있으면 available: true."""
    has_explicit_url = bool(os.environ.get("QWEN_TTS_BASE_URL", "").strip())
    qwen_available = bool(QWEN_TTS_BASE_URL)
    gtts_ok = _gtts_available()
    available = qwen_available or gtts_ok
    if qwen_available:
        message = "Qwen3-TTS 사용 가능"
    elif gtts_ok:
        message = "gTTS 폴백 사용 가능 (QWEN_TTS_BASE_URL 설정 시 더 나은 음질)"
    else:
        message = "QWEN_TTS_BASE_URL를 설정하거나 pip install gtts 로 폴백을 사용해 주세요."
    return {
        "success": True,
        "available": available,
        "base_url_configured": has_explicit_url,
        "message": message,
    }


@router.get("/situations")
async def tts_situations():
    """특정 상황에 맞는 성우 목소리 프리셋 목록 (UI 선택용). 영화·드라마 대사 스타일 포함."""
    labels = {
        "default": "기본",
        "narration": "나레이션",
        "news": "뉴스/앵커",
        "emotional": "감정 연기",
        "children": "동화/어린이",
        "ad": "광고",
        "documentary": "다큐멘터리",
        "audiobook": "오디오북",
        "game_character": "게임 캐릭터",
        "announcement": "안내 방송",
        "warm_story": "따뜻한 이야기",
        "professional": "비즈니스/전문가",
        "exciting": "흥미진진/역동",
        "movie_dialogue": "영화 대사",
        "drama_dialogue": "드라마 대사",
        "film_acting": "영화·드라마 연기",
    }
    items = [
        {"id": k, "label": labels.get(k, k), "instructions_preview": (TTS_SITUATION_INSTRUCTIONS.get(k) or "")[:80]}
        for k in TTS_SITUATION_TYPES
    ]
    return {"success": True, "situations": items}


# ----- 샘플 대본 스타일 분석·생성 (톤/스타일/어투/말투 반영) -----


# 문서 유형 힌트: 톤다운안·기업보도 등 샘플 특성 반영 (로드데건설 7000억 톤다운안_수정본 등)
SCRIPT_STYLE_HINT_TONE_DOWN = "tone_down"  # 톤다운안·보도자료 (중립·신중·격식)
SCRIPT_STYLE_HINT_CORPORATE = "corporate"   # 기업·PR (정중·객관)
SCRIPT_STYLE_HINT_GENERAL = "general"       # 일반 대본


def _suggest_document_hint_from_filename(filename: str) -> Optional[str]:
    """파일명에서 문서 유형 힌트 추천 (톤다운안, 기업·보도 등)."""
    if not (filename or "").strip():
        return None
    name = (filename or "").lower().replace(" ", "")
    if "톤다운" in filename or "tone_down" in name or "보도" in filename:
        return SCRIPT_STYLE_HINT_TONE_DOWN
    if "기업" in filename or "corporate" in name or "pr" in name or "보도자료" in filename:
        return SCRIPT_STYLE_HINT_CORPORATE
    return None


def _extract_dialogue_only(text: str) -> str:
    """대본에서 대화(말하는 부분)만 추출. 지문·괄호 안 설명 제거, '이름: 대사'는 대사만 반환 (목소리 생성용)."""
    import re
    lines = []
    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line:
            continue
        if (line.startswith("(") and line.endswith(")")) or (line.startswith("[") and line.endswith("]")):
            continue
        if re.match(r"^[(\[]", line) and re.search(r"[)\]]\s*$", line):
            continue
        if ":" in line:
            idx = line.find(":")
            after = line[idx + 1:].strip()
            if after:
                lines.append(after)
            continue
        lines.append(line)
    result = "\n".join(lines).strip()
    return result if result else text


class ScriptStyleAnalyzeRequest(BaseModel):
    """샘플 대본 스타일 분석 요청"""
    sample_script: str = Field(..., min_length=1, description="분석할 샘플 대본 텍스트")
    document_hint: Optional[str] = Field(
        None,
        description="문서 유형 힌트: tone_down(톤다운·보도), corporate(기업·PR), general",
    )
    source_filename: Optional[str] = Field(None, description="원본 파일명 (참고용)")


class ScriptStyleGenerateRequest(BaseModel):
    """샘플 스타일로 대본 생성 요청"""
    sample_script: str = Field(..., min_length=1, description="참조할 샘플 대본 (톤/스타일 반영)")
    topic_or_outline: str = Field(..., min_length=1, description="생성할 대본의 주제 또는 개요")
    document_hint: Optional[str] = Field(
        None,
        description="문서 유형 힌트: tone_down(톤다운·보도), corporate(기업·PR), general",
    )
    source_filename: Optional[str] = Field(None, description="원본 파일명 (참고용)")


def _extract_text_from_docx_bytes(data: bytes) -> str:
    """docx 파일 바이트에서 텍스트 추출. python-docx 미설치 시 ValueError 발생."""
    try:
        import docx  # type: ignore
    except ImportError as e:
        logger.warning(f"python-docx 미설치: {e}")
        raise ValueError(
            "docx 파일 추출을 위해 python-docx가 필요합니다. 서버에서 pip install python-docx 를 실행해 주세요."
        ) from e
    try:
        doc = docx.Document(io.BytesIO(data))
        return "\n".join(p.text for p in doc.paragraphs if p.text).strip()
    except Exception as e:
        logger.warning(f"docx 텍스트 추출 실패: {e}")
        return ""


@router.post("/script-style/extract-document")
async def script_style_extract_document(file: UploadFile = File(...)):
    """워드(docx) 또는 텍스트 파일에서 대본 텍스트 추출 (샘플 대본 입력용)."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="파일명이 없습니다.")
    ext = (file.filename or "").rsplit(".", 1)[-1].lower()
    try:
        raw = await file.read()
        if not raw:
            raise HTTPException(status_code=400, detail="빈 파일입니다.")
        if ext == "docx":
            try:
                text = _extract_text_from_docx_bytes(raw)
            except ValueError as e:
                raise HTTPException(status_code=503, detail=str(e))
        elif ext == "txt":
            text = raw.decode("utf-8", errors="replace").strip()
        else:
            raise HTTPException(
                status_code=400,
                detail="지원 형식: .docx, .txt",
            )
        if not text:
            raise HTTPException(status_code=400, detail="추출된 텍스트가 없습니다.")
        suggested = _suggest_document_hint_from_filename(file.filename or "")
        dialogue_only = _extract_dialogue_only(text)
        return {
            "success": True,
            "text": text,
            "dialogue_only": dialogue_only,
            "suggested_document_hint": suggested,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("문서 추출 실패")
        raise HTTPException(status_code=500, detail=f"문서 추출 실패: {e}")


@router.post("/script-style/analyze")
async def script_style_analyze(body: ScriptStyleAnalyzeRequest):
    """샘플 대본의 톤·스타일·어투·말투를 분석해 요약과 핵심 특성을 반환. 톤다운안·기업보도 등 문서 유형 힌트 반영."""
    sample = (body.sample_script or "").strip()
    if not sample:
        raise HTTPException(status_code=400, detail="sample_script가 비어 있습니다.")
    hint = (body.document_hint or "").strip() or None
    filename_note = f" (원본 파일명: {body.source_filename})" if (body.source_filename or "").strip() else ""
    try:
        from api.unified_chat_api import generate_chat_response
        hint_instruction = ""
        if hint == SCRIPT_STYLE_HINT_TONE_DOWN:
            hint_instruction = (
                "이 문서는 톤다운안·보도자료일 수 있으므로, 격식·중립·신중한 표현, "
                "과장 완화·객관적 서술을 특히 분석해 주세요. "
            )
        elif hint == SCRIPT_STYLE_HINT_CORPORATE:
            hint_instruction = (
                "이 문서는 기업·PR·보도 자료일 수 있으므로, 정중함·객관성·숫자·사실 전달 방식을 특히 분석해 주세요. "
            )
        prompt = (
            "다음 대본의 톤(tone), 스타일(문체), 어투(격식/비격식), 말투(감정·리듬·호흡)를 분석해 주세요. "
            + hint_instruction +
            "한국어로 요약과 핵심 특성을 짧게 나열해 주세요. 불릿 포인트로 정리해도 됩니다."
            + filename_note + "\n\n"
            "대본:\n" + (sample[:8000] if len(sample) > 8000 else sample)
        )
        content = await generate_chat_response(prompt, "detailed", None)
        summary = (content or "").strip()
        # 키 특성은 요약에서 첫 3~5문장 또는 줄 단위로 추출 (간단히)
        lines = [ln.strip() for ln in summary.split("\n") if ln.strip()][:10]
        key_traits = lines if len(lines) > 1 else [summary[:500]] if summary else []
        return {
            "success": True,
            "style_summary": summary,
            "key_traits": key_traits,
        }
    except Exception as e:
        logger.exception("스타일 분석 실패")
        raise HTTPException(status_code=500, detail=f"스타일 분석 실패: {e}")


@router.post("/script-style/generate")
async def script_style_generate(body: ScriptStyleGenerateRequest):
    """샘플 대본의 톤·스타일·어투·말투를 유지한 채, 주제/개요에 맞는 새 대본을 생성. 톤다운·기업보도 힌트 시 중립·격식 유지."""
    sample = (body.sample_script or "").strip()
    topic = (body.topic_or_outline or "").strip()
    if not sample:
        raise HTTPException(status_code=400, detail="sample_script가 비어 있습니다.")
    if not topic:
        raise HTTPException(status_code=400, detail="topic_or_outline가 비어 있습니다.")
    hint = (body.document_hint or "").strip() or None
    try:
        from api.unified_chat_api import generate_chat_response
        hint_instruction = ""
        if hint == SCRIPT_STYLE_HINT_TONE_DOWN:
            hint_instruction = "톤다운·보도 스타일이므로 과장 없이 중립·신중·격식체를 유지해 주세요. "
        elif hint == SCRIPT_STYLE_HINT_CORPORATE:
            hint_instruction = "기업·PR 스타일이므로 정중·객관·사실 위주로 유지해 주세요. "
        prompt = (
            "아래 '참조 대본'의 톤, 스타일, 어투, 말투를 그대로 살려서 "
            "'생성할 주제/개요'에 맞는 새 대본만 작성해 주세요. "
            + hint_instruction +
            "설명이나 부가 문구 없이 대본 본문만 출력해 주세요.\n\n"
            "참조 대본:\n" + (sample[:8000] if len(sample) > 8000 else sample) + "\n\n"
            "생성할 주제/개요:\n" + (topic[:2000] if len(topic) > 2000 else topic)
        )
        content = await generate_chat_response(prompt, "detailed", None)
        generated = (content or "").strip()
        return {"success": True, "generated_script": generated}
    except Exception as e:
        logger.exception("스타일 대본 생성 실패")
        raise HTTPException(status_code=500, detail=f"대본 생성 실패: {e}")
