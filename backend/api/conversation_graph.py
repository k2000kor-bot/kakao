"""
대화 업로드 및 대화 관계도(참여자 간 발화 흐름·동조/반대 분류) 생성.
- TXT(카카오 형식) 및 CSV(카카오톡 CSV 내보내기) 파싱
- 메시지별 동조/반대/중립 분류 (재개발·조합 등 주제 반영)
- 기간 필터 적용 후 노드(참여자·동조/반대 건수)·엣지(발화 흐름·동조·반대·대립) 계산
"""

import csv
import io
import os
import re
import sqlite3
import uuid
from collections import defaultdict
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple

# DB 경로: backend/api 기준 상위(backend)에 저장
_SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
_BACKEND_DIR = os.path.dirname(_SCRIPT_DIR)
DB_PATH = os.path.join(_BACKEND_DIR, "conversation_uploads.db")


def _get_conn() -> sqlite3.Connection:
    return sqlite3.connect(DB_PATH)


def init_db() -> None:
    """업로드·메시지 테이블 생성"""
    conn = _get_conn()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS conversation_uploads (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            filename TEXT NOT NULL,
            uploaded_at TEXT NOT NULL
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS conversation_messages (
            id TEXT PRIMARY KEY,
            upload_id TEXT NOT NULL,
            sender_id TEXT NOT NULL,
            sender_name TEXT NOT NULL,
            content TEXT NOT NULL,
            ts TEXT NOT NULL,
            FOREIGN KEY (upload_id) REFERENCES conversation_uploads(id)
        )
    """)
    cur.execute("CREATE INDEX IF NOT EXISTS idx_messages_upload_ts ON conversation_messages(upload_id, ts)")
    conn.commit()
    conn.close()


def _parse_kakao_like_content(content: str) -> List[Dict[str, Any]]:
    """
    카카오톡 내보내기 형식 비슷한 텍스트 파싱.
    - 날짜 줄: 2024년 1월 1일
    - 메시지: 2024년 1월 1일 오전 10:00, 0116 : 내용
    반환: [ {"sender_id", "sender_name", "content", "ts": iso}, ... ]
    """
    messages = []
    lines = content.split("\n")
    current_date = None
    # 메시지 라인: (오전|오후) H:MM, SENDER : 내용
    msg_re = re.compile(
        r"^(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일\s*(오전|오후)\s*(\d{1,2}):(\d{2}),\s*([^:]+)\s*:\s*(.*)$"
    )
    date_only_re = re.compile(r"^(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일\s*$")

    for line in lines:
        line = line.strip()
        if not line:
            continue
        # 날짜만 있는 줄
        m = date_only_re.match(line)
        if m:
            y, mo, d = int(m.group(1)), int(m.group(2)), int(m.group(3))
            current_date = datetime(y, mo, d)
            continue
        # 메시지 줄
        m = msg_re.match(line)
        if m:
            y, mo, d = int(m.group(1)), int(m.group(2)), int(m.group(3))
            ampm, h, mi = m.group(4), int(m.group(5)), int(m.group(6))
            sender = m.group(7).strip()
            text = m.group(8)
            if ampm == "오후" and h != 12:
                h += 12
            elif ampm == "오전" and h == 12:
                h = 0
            ts = datetime(y, mo, d, h, mi)
            sender_id = sender if re.match(r"^\d{4}$", sender) else sender[:50]
            sender_name = sender if len(sender) > 4 else f"참여자{sender}"
            messages.append({
                "sender_id": sender_id,
                "sender_name": sender_name,
                "content": text,
                "ts": ts.isoformat(),
            })
        elif current_date is not None:
            # 일부 형식: "오전 10:00, 0116 : 내용"
            alt = re.match(r"^(오전|오후)\s*(\d{1,2}):(\d{2}),\s*([^:]+)\s*:\s*(.*)$", line)
            if alt:
                ampm, h, mi = alt.group(1), int(alt.group(2)), int(alt.group(3))
                sender = alt.group(4).strip()
                text = alt.group(5)
                if ampm == "오후" and h != 12:
                    h += 12
                elif ampm == "오전" and h == 12:
                    h = 0
                ts = current_date.replace(hour=h, minute=mi)
                sender_id = sender if re.match(r"^\d{4}$", sender) else sender[:50]
                sender_name = sender if len(sender) > 4 else f"참여자{sender}"
                messages.append({
                    "sender_id": sender_id,
                    "sender_name": sender_name,
                    "content": text,
                    "ts": ts.isoformat(),
                })

    return sorted(messages, key=lambda x: x["ts"])


# CSV 컬럼명 매핑 (한글/영어)
_CSV_DATE_KEYS = ("날짜", "date", "Date", "날짜 ")
_CSV_TIME_KEYS = ("시간", "time", "Time", "시간 ")
_CSV_USER_KEYS = ("유저", "이름", "사용자", "user", "User", "이름 ", "유저 ")
_CSV_MSG_KEYS = ("메시지", "내용", "message", "Message", "메시지 ", "내용 ")


def _normalize_csv_header(cell: str) -> str:
    return (cell or "").strip().lower().replace(" ", "")


def _parse_csv_content(content: str) -> List[Dict[str, Any]]:
    """
    카카오톡 CSV 내보내기 형식 파싱.
    컬럼: 날짜/Date, 시간/Time, 유저/User/이름, 메시지/Message/내용
    날짜 예: 2026. 3. 2. / 2026-03-02, 시간 예: 오전 10:30 / 18:14
    """
    messages = []
    # BOM 제거
    if content.startswith("\ufeff"):
        content = content[1:]
    reader = csv.reader(io.StringIO(content))
    rows = list(reader)
    if not rows:
        return messages
    header = [cell.strip().strip('"') for cell in rows[0]]
    col_date = col_time = col_user = col_msg = None
    for i, cell in enumerate(header):
        n = _normalize_csv_header(cell)
        if n in ("날짜", "date"):
            col_date = i
        elif n in ("시간", "time"):
            col_time = i
        elif n in ("유저", "이름", "사용자", "user"):
            col_user = i
        elif n in ("메시지", "내용", "message"):
            col_msg = i
    if col_user is None or col_msg is None:
        return messages
    if col_date is None:
        col_date = 0
    if col_time is None:
        col_time = 1 if col_date == 0 else 0

    def parse_date(s: str) -> Optional[datetime]:
        if not s or not s.strip():
            return None
        s = s.strip().strip('"')
        # 2026. 3. 2. / 2026-03-02
        m = re.match(r"(\d{4})[.\s\-]+(\d{1,2})[.\s\-]+(\d{1,2})", s)
        if m:
            return datetime(int(m.group(1)), int(m.group(2)), int(m.group(3)))
        return None

    def parse_time(s: str, base_date: datetime) -> Optional[datetime]:
        if not s or not base_date:
            return None
        s = s.strip().strip('"')
        # 오전 10:30 / 오후 6:14 / 18:14
        m = re.match(r"(오전|오후)?\s*(\d{1,2}):(\d{2})", s)
        if m:
            ampm, h, mi = m.group(1), int(m.group(2)), int(m.group(3))
            if ampm == "오후" and h != 12:
                h += 12
            elif ampm == "오전" and h == 12:
                h = 0
            return base_date.replace(hour=h, minute=mi)
        m = re.match(r"(\d{1,2}):(\d{2})", s)
        if m:
            h, mi = int(m.group(1)), int(m.group(2))
            if h < 8:
                h += 12
            return base_date.replace(hour=h, minute=mi)
        return base_date

    current_date = None
    for row in rows[1:]:
        if len(row) <= max(col_date, col_time, col_user, col_msg):
            continue
        date_cell = row[col_date].strip().strip('"') if col_date < len(row) else ""
        time_cell = row[col_time].strip().strip('"') if col_time < len(row) else ""
        user_cell = row[col_user].strip().strip('"') if col_user < len(row) else ""
        msg_cell = row[col_msg].strip().strip('"') if col_msg < len(row) else ""
        if not user_cell and not msg_cell:
            continue
        d = parse_date(date_cell)
        if d:
            current_date = d
        if not current_date:
            current_date = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        ts = parse_time(time_cell, current_date) or current_date
        sender = user_cell or "알 수 없음"
        sender_id = sender[:50] if len(sender) > 4 else sender
        sender_name = sender
        messages.append({
            "sender_id": sender_id,
            "sender_name": sender_name,
            "content": msg_cell,
            "ts": ts.isoformat(),
        })

    return sorted(messages, key=lambda x: x["ts"])


# 동조/반대 키워드 (재개발·조합·주거 등 맥락)
_STANCE_AGREE = (
    "동의", "찬성", "찬성합니다", "찬성해요", "찬성함", "동의합니다", "동의해요", "좋아요", "좋습니다",
    "맞아요", "맞습니다", "그렇습니다", "동조", "찬성해", "동의해", "좋아", "맞아", "그래", "옳다",
    "지지", "지지합니다", "찬성합니다", "동의함", "옳습니다", "옳아요",
)
_STANCE_DISAGREE = (
    "반대", "반대합니다", "반대해요", "반대함", "반대해", "싫어", "아니요", "아니야", "아니에요",
    "찬성할 수 없", "동의할 수 없", "반대의견", "반대합니다", "반대의", "불찬성", "반대야",
    "아닌", "틀렸", "그렇지 않", "반대해요", "반대함", "반대합니다",
)


def _classify_stance(content: str) -> str:
    """메시지 내용으로 동조/반대/중립 분류. '동조' | '반대' | '중립'"""
    if not content or not isinstance(content, str):
        return "중립"
    text = content.strip()
    if len(text) < 2:
        return "중립"
    agree = sum(1 for k in _STANCE_AGREE if k in text)
    disagree = sum(1 for k in _STANCE_DISAGREE if k in text)
    if disagree > agree:
        return "반대"
    if agree > disagree:
        return "동조"
    return "중립"


def save_upload(name: str, filename: str, content: str) -> Dict[str, Any]:
    """
    대화 텍스트 저장. CSV(.csv) 또는 카카오 TXT 형식 자동 판별 후 파싱.
    name: 대화방/업로드 이름, filename: 원본 파일명, content: 전체 텍스트
    """
    init_db()
    upload_id = str(uuid.uuid4())
    uploaded_at = datetime.utcnow().isoformat() + "Z"
    # CSV 여부: 확장자 또는 첫 줄에 CSV 헤더(날짜,시간,유저,메시지 등)
    is_csv = (filename or "").lower().endswith(".csv")
    if not is_csv and content.strip():
        first = content.strip().split("\n")[0][:200]
        is_csv = (
            ("날짜" in first or "date" in first.lower())
            and ("메시지" in first or "message" in first.lower() or "유저" in first or "user" in first.lower())
        )
    if is_csv:
        messages = _parse_csv_content(content)
    else:
        messages = _parse_kakao_like_content(content)

    conn = _get_conn()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO conversation_uploads (id, name, filename, uploaded_at) VALUES (?, ?, ?, ?)",
        (upload_id, name or filename or "대화", filename or "", uploaded_at),
    )
    for msg in messages:
        cur.execute(
            "INSERT INTO conversation_messages (id, upload_id, sender_id, sender_name, content, ts) VALUES (?, ?, ?, ?, ?, ?)",
            (str(uuid.uuid4()), upload_id, msg["sender_id"], msg["sender_name"], msg["content"], msg["ts"]),
        )
    conn.commit()
    conn.close()

    return {
        "upload_id": upload_id,
        "name": name or filename or "대화",
        "filename": filename or "",
        "uploaded_at": uploaded_at,
        "message_count": len(messages),
    }


def list_uploads() -> List[Dict[str, Any]]:
    """업로드 목록 (id, name, filename, uploaded_at, message_count)"""
    init_db()
    conn = _get_conn()
    cur = conn.cursor()
    cur.execute("""
        SELECT u.id, u.name, u.filename, u.uploaded_at,
               (SELECT COUNT(*) FROM conversation_messages m WHERE m.upload_id = u.id)
        FROM conversation_uploads u
        ORDER BY u.uploaded_at DESC
    """)
    rows = cur.fetchall()
    conn.close()
    return [
        {
            "id": r[0],
            "name": r[1],
            "filename": r[2],
            "uploaded_at": r[3],
            "message_count": r[4],
        }
        for r in rows
    ]


def get_relationship_graph(
    upload_id: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
) -> Dict[str, Any]:
    """
    대화 관계도: 노드(참여자), 엣지(연속 발화 흐름 A->B 횟수).
    start_date, end_date: ISO 날짜 또는 datetime 문자열 (포함). 없으면 전체 기간.
    반환: { "nodes": [ { "id", "label", "message_count" } ], "edges": [ { "source", "target", "weight" } ] }
    """
    init_db()
    conn = _get_conn()
    cur = conn.cursor()
    cur.execute("SELECT id, name FROM conversation_uploads WHERE id = ?", (upload_id,))
    row = cur.fetchone()
    if not row:
        conn.close()
        return {"nodes": [], "edges": [], "upload_id": upload_id, "error": "upload_not_found"}

    # 메시지 시간순 조회 (기간 필터, content 포함하여 동조/반대 분류)
    conditions = ["upload_id = ?"]
    params = [upload_id]
    if start_date:
        conditions.append("ts >= ?")
        params.append(start_date)
    if end_date:
        conditions.append("ts <= ?")
        params.append(end_date)
    sql = (
        "SELECT sender_id, sender_name, content, ts FROM conversation_messages WHERE "
        + " AND ".join(conditions)
        + " ORDER BY ts"
    )
    cur.execute(sql, params)
    rows = cur.fetchall()
    conn.close()

    if not rows:
        return {"nodes": [], "edges": [], "upload_id": upload_id}

    # 메시지별 스탠스 분류
    rows_with_stance = [
        (r[0], r[1], r[2] or "", r[3], _classify_stance(r[2] or ""))
        for r in rows
    ]

    # 노드: 참여자별 메시지 수 + 동조/반대/중립 건수
    node_counts: Dict[str, int] = defaultdict(int)
    node_names: Dict[str, str] = {}
    node_stance: Dict[str, Dict[str, int]] = defaultdict(lambda: {"동조": 0, "반대": 0, "중립": 0})
    for sender_id, sender_name, _content, _ts, stance in rows_with_stance:
        node_counts[sender_id] += 1
        node_names[sender_id] = sender_name or sender_id
        node_stance[sender_id][stance] += 1

    def dominant_stance(counts: Dict[str, int]) -> str:
        if counts["반대"] > counts["동조"] and counts["반대"] > counts["중립"]:
            return "반대"
        if counts["동조"] > counts["반대"] and counts["동조"] > counts["중립"]:
            return "동조"
        return "중립"

    nodes = [
        {
            "id": nid,
            "label": node_names.get(nid, nid),
            "message_count": node_counts[nid],
            "stance_동조": node_stance[nid]["동조"],
            "stance_반대": node_stance[nid]["반대"],
            "stance_중립": node_stance[nid]["중립"],
            "dominant_stance": dominant_stance(node_stance[nid]),
        }
        for nid in node_counts
    ]

    # 엣지: 연속 발화 흐름(weight) + 동조/반대/대립 횟수
    edge_flow: Dict[Tuple[str, str], int] = defaultdict(int)
    edge_동조: Dict[Tuple[str, str], int] = defaultdict(int)
    edge_반대: Dict[Tuple[str, str], int] = defaultdict(int)
    edge_대립: Dict[Tuple[str, str], int] = defaultdict(int)
    for i in range(1, len(rows_with_stance)):
        prev_id, _, _, _, prev_stance = rows_with_stance[i - 1]
        curr_id, _, _, _, curr_stance = rows_with_stance[i]
        if prev_id == curr_id:
            continue
        key = (prev_id, curr_id)
        edge_flow[key] += 1
        if prev_stance == curr_stance:
            if prev_stance == "동조":
                edge_동조[key] += 1
            elif prev_stance == "반대":
                edge_반대[key] += 1
        else:
            if (prev_stance, curr_stance) in (("동조", "반대"), ("반대", "동조")):
                edge_대립[key] += 1

    all_keys = set(edge_flow.keys()) | set(edge_동조.keys()) | set(edge_반대.keys()) | set(edge_대립.keys())
    edges = [
        {
            "source": a,
            "target": b,
            "weight": edge_flow.get((a, b), 0),
            "weight_동조": edge_동조.get((a, b), 0),
            "weight_반대": edge_반대.get((a, b), 0),
            "weight_대립": edge_대립.get((a, b), 0),
            "edge_type": (
                "대립" if edge_대립.get((a, b), 0) > 0 else "반대" if edge_반대.get((a, b), 0) > 0 else "동조" if edge_동조.get((a, b), 0) > 0 else "flow"
            ),
        }
        for (a, b) in all_keys
    ]

    return {
        "upload_id": upload_id,
        "nodes": nodes,
        "edges": edges,
        "start_date": start_date,
        "end_date": end_date,
    }
