"""YouTube URL → video_id 추출 (_extract_youtube_video_id) 단위 테스트."""

from pathlib import Path
import sys

backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from api.project_session_api import _extract_youtube_video_id  # noqa: E402
from api.video_knowledge import extract_youtube_urls  # noqa: E402


def test_extract_watch_v():
    assert _extract_youtube_video_id("https://www.youtube.com/watch?v=abc_X-12&list=PLx") == "abc_X-12"


def test_extract_m_youtube():
    assert _extract_youtube_video_id("https://m.youtube.com/watch?v=Mob123") == "Mob123"


def test_extract_youtu_be():
    assert _extract_youtube_video_id("https://youtu.be/dQw4w9WgXcQ?t=42") == "dQw4w9WgXcQ"


def test_extract_shorts():
    assert _extract_youtube_video_id("https://www.youtube.com/shorts/ShortVid01?q=1") == "ShortVid01"


def test_extract_embed():
    assert _extract_youtube_video_id("https://www.youtube.com/embed/Emb12345") == "Emb12345"


def test_extract_nocookie_embed():
    assert _extract_youtube_video_id("https://www.youtube-nocookie.com/embed/Privacy1") == "Privacy1"


def test_extract_music_youtube_watch():
    assert _extract_youtube_video_id("https://music.youtube.com/watch?v=MusicVid1&list=LM") == "MusicVid1"


def test_extract_invalid():
    assert _extract_youtube_video_id("https://example.com/watch?v=nope") is None
    assert _extract_youtube_video_id("") is None


def test_extract_youtube_urls_in_message():
    text = "보기 https://www.youtube.com/shorts/Sh0rt01 그리고 https://youtu.be/BeLink02"
    urls = extract_youtube_urls(text)
    assert "https://www.youtube.com/shorts/Sh0rt01" in urls
    assert "https://youtu.be/BeLink02" in urls
    assert len(urls) == 2


def test_extract_youtube_urls_skips_non_youtube():
    assert extract_youtube_urls("https://example.com and https://news.test/x") == []
