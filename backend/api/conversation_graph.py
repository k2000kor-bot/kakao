"""
대화 업로드·파싱·관계도 생성 (SQLite).
프론트 conversationGraphService 계약: upload_id, nodes, edges, stance 필드.
"""
from __future__ import annotations

import csv
import io
import os
import re
import sqlite3
import uuid
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

_STANCE_AGREE = (
    "찬성",
    "동의",
    "동조",
    "지지",
    "긍정",
    "맞아",
    "맞습니다",
    "좋아",
    "좋습니다",
    "수용",
    "찬",
)
_STANCE_DISAGREE = (
    "반대",
    "거부",
    "불가",
    "싫",
    "안돼",
    "안 돼",
    "우려",
    "문제",
    "반박",
)

_MSG_LINE = re.compile(
    r"^(?P<date>\d{4}[-./]\s*\d{1,2}[-./]\s*\d{1,2}(?:\s+\d{1,2}:\d{2}(?::\d{2})?)?)"
    r",\s*(?P<user>[^:]+?)\s*:\s*(?P<msg>.*)$",
    re.DOTALL,
)
_DATE_HEADER = re.compile(r"^(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일\s*$")
_TIME_ONLY = re.compile(
    r"^(?:(?:오전|오후)\s*)?(\d{1,2}):(\d{2})(?::(\d{2}))?\s*,\s*(?P<user>[^:]+?)\s*:\s*(?P<msg>.*)$",
)
_KAKAO_EXPORT_MSG = re.compile(
    r"^(\d{4}년 \d{1,2}월 \d{1,2}일 (?:오전|오후) \d{1,2}:\d{2}),\s*([^:]+?)\s*:\s*(.+)$",
)
_KAKAO_EXPORT_DATE_LINE = re.compile(r"^\d{4}년 \d{1,2}월 \d{1,2}일 (?:오전|오후) \d{1,2}:\d{2}$")
_KAKAO_EXPORT_DATETIME = re.compile(
    r"^(\d{4})년 (\d{1,2})월 (\d{1,2})일 (오전|오후) (\d{1,2}):(\d{2})$",
)


def _db_path() -> str:
    default = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "conversation_uploads.db")
    path = os.environ.get("CONVERSATION_GRAPH_DB", default)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    return path


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(_db_path())
    conn.row_factory = sqlite3.Row
    return conn


def _init_db(conn: sqlite3.Connection) -> None:
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS conversation_uploads (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            filename TEXT NOT NULL,
            content TEXT NOT NULL,
            uploaded_at TEXT NOT NULL,
            message_count INTEGER NOT NULL DEFAULT 0
        )
        """
    )
    conn.commit()


@dataclass
class ParsedMessage:
    ts: Optional[datetime]
    user: str
    message: str
    stance: str


def _is_system_message(text: str) -> bool:
    m = (text or "").strip()
    if not m:
        return True
    if m in ("사진", "동영상", "이모티콘", "음성메시지", "파일"):
        return True
    if "삭제된 메시지" in m:
        return True
    if "님이 들어왔습니다" in m or "님이 나갔습니다" in m or "님을 초대했습니다" in m:
        return True
    return False


def _parse_korean_export_datetime(date_time: str) -> Optional[datetime]:
    m = _KAKAO_EXPORT_DATETIME.match(date_time.strip())
    if not m:
        return None
    y, mo, d = int(m.group(1)), int(m.group(2)), int(m.group(3))
    ampm, h, mi = m.group(4), int(m.group(5)), int(m.group(6))
    if ampm == "오후" and h < 12:
        h += 12
    elif ampm == "오전" and h == 12:
        h = 0
    return datetime(y, mo, d, h, mi, 0)


def classify_stance(text: str) -> str:
    t = (text or "").strip().lower()
    if not t or len(t) < 2:
        return "중립"
    agree = sum(1 for k in _STANCE_AGREE if k in t)
    disagree = sum(1 for k in _STANCE_DISAGREE if k in t)
    if agree > disagree and agree > 0:
        return "동조"
    if disagree > agree and disagree > 0:
        return "반대"
    return "중립"


def _parse_datetime_str(date_str: str) -> Optional[datetime]:
    s = date_str.strip().replace(".", "-").replace("/", "-")
    s = re.sub(r"\s+", " ", s)
    ampm = None
    if "오전" in s:
        ampm = "am"
        s = s.replace("오전", "").strip()
    elif "오후" in s:
        ampm = "pm"
        s = s.replace("오후", "").strip()
    for fmt in (
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d %H:%M",
        "%Y-%m-%d",
    ):
        try:
            dt = datetime.strptime(s, fmt)
            if ampm == "pm" and dt.hour < 12:
                dt = dt.replace(hour=dt.hour + 12)
            elif ampm == "am" and dt.hour == 12:
                dt = dt.replace(hour=0)
            return dt
        except ValueError:
            continue
    return None


_DATE_HEADERS = frozenset({"date", "날짜", "일자"})
_TIME_HEADERS = frozenset({"time", "시간", "시각"})
_USER_HEADERS = frozenset({"user", "유저", "사용자", "이름", "name", "닉네임"})
_MSG_HEADERS = frozenset({"message", "메시지", "내용", "content", "msg"})


def _norm_header(cell: str) -> str:
    return cell.strip().lower().strip('"').replace(" ", "")


def _csv_column_map(header: List[str]) -> Optional[Dict[str, int]]:
    h = [_norm_header(c) for c in header]
    idx_date = next((i for i, x in enumerate(h) if x in _DATE_HEADERS), None)
    idx_time = next((i for i, x in enumerate(h) if x in _TIME_HEADERS), None)
    idx_user = next((i for i, x in enumerate(h) if x in _USER_HEADERS), None)
    idx_msg = next((i for i, x in enumerate(h) if x in _MSG_HEADERS), None)
    if idx_user is None or idx_msg is None:
        return None
    if idx_date is None and len(h) >= 3:
        # Date,User,Message (datetime in first column)
        if h[0] in _DATE_HEADERS or h[0] == "date":
            idx_date, idx_user, idx_msg = 0, 1, 2
        else:
            return None
    if idx_date is None:
        return None
    return {"date": idx_date, "time": idx_time, "user": idx_user, "message": idx_msg}


def _parse_kakao_csv(content: str) -> List[ParsedMessage]:
    text = content.lstrip("\ufeff")
    rows = list(csv.reader(io.StringIO(text)))
    if len(rows) < 2:
        return []
    col = _csv_column_map(rows[0])
    if not col:
        return []
    out: List[ParsedMessage] = []
    header_norm = [_norm_header(c) for c in rows[0]]
    max_col = max(v for v in col.values() if v is not None)
    for row in rows[1:]:
        if len(row) <= max_col:
            continue
        if [_norm_header(c) for c in row[: len(header_norm)]] == header_norm:
            continue
        date_part = row[col["date"]].strip().strip('"')
        time_part = row[col["time"]].strip().strip('"') if col.get("time") is not None else ""
        user = row[col["user"]].strip().strip('"')
        msg = row[col["message"]].strip().strip('"')
        if col["message"] < len(row) - 1:
            msg = ",".join([msg] + row[col["message"] + 1 :]).strip().strip('"')
        if not user or not msg:
            continue
        combined = f"{date_part} {time_part}".strip() if time_part else date_part
        ts = _parse_datetime_str(combined) or _parse_datetime_str(date_part)
        out.append(ParsedMessage(ts=ts, user=user, message=msg, stance=classify_stance(msg)))
    return out


def _parse_kakao_txt_export(content: str) -> List[ParsedMessage]:
    """카카오톡 PC/모바일 TXT보내기 (예: 2025년 6월 24일 오전 9:22, 홍길동 : …)."""
    if "님과 카카오톡 대화" not in content and not _KAKAO_EXPORT_MSG.search(content):
        return []
    out: List[ParsedMessage] = []
    for raw_line in content.splitlines():
        line = raw_line.strip()
        if not line or line.startswith("저장한 날짜") or "님과 카카오톡 대화" in line:
            continue
        if _KAKAO_EXPORT_DATE_LINE.match(line):
            continue
        m = _KAKAO_EXPORT_MSG.match(line)
        if not m:
            continue
        dt_str, user, msg = m.group(1), m.group(2).strip(), m.group(3).strip()
        if _is_system_message(msg) or not user:
            continue
        ts = _parse_korean_export_datetime(dt_str)
        out.append(ParsedMessage(ts=ts, user=user, message=msg, stance=classify_stance(msg)))
    return out


def parse_messages(content: str) -> List[ParsedMessage]:
    if not content or not content.strip():
        return []
    csv_msgs = _parse_kakao_csv(content)
    if csv_msgs:
        return [m for m in csv_msgs if not _is_system_message(m.message)]

    kakao_txt = _parse_kakao_txt_export(content)
    if kakao_txt:
        return kakao_txt

    messages: List[ParsedMessage] = []
    current_date: Optional[datetime] = None
    for raw_line in content.splitlines():
        line = raw_line.strip()
        if not line:
            continue
        m_date = _DATE_HEADER.match(line)
        if m_date:
            y, mo, d = int(m_date.group(1)), int(m_date.group(2)), int(m_date.group(3))
            current_date = datetime(y, mo, d)
            continue
        m = _MSG_LINE.match(line)
        if m:
            ts = _parse_datetime_str(m.group("date"))
            user = m.group("user").strip()
            msg = m.group("msg").strip()
            if user and msg and not _is_system_message(msg):
                messages.append(
                    ParsedMessage(ts=ts, user=user, message=msg, stance=classify_stance(msg))
                )
            continue
        m2 = _TIME_ONLY.match(line)
        if m2 and current_date:
            h = int(m2.group(1))
            mi = int(m2.group(2))
            sec = int(m2.group(3) or 0)
            if "오후" in line and h < 12:
                h += 12
            if "오전" in line and h == 12:
                h = 0
            ts = current_date.replace(hour=h, minute=mi, second=sec)
            user = m2.group("user").strip()
            msg = m2.group("msg").strip()
            if user and msg and not _is_system_message(msg):
                messages.append(
                    ParsedMessage(ts=ts, user=user, message=msg, stance=classify_stance(msg))
                )
    return messages


def _slug_user(name: str) -> str:
    base = re.sub(r"\s+", "_", name.strip())[:48] or "user"
    return re.sub(r"[^\w가-힣.-]", "", base) or "user"


def _in_date_range(ts: Optional[datetime], start_date: Optional[str], end_date: Optional[str]) -> bool:
    if ts is None:
        return start_date is None and end_date is None
    day = ts.date()
    if start_date:
        try:
            if day < datetime.strptime(start_date[:10], "%Y-%m-%d").date():
                return False
        except ValueError:
            pass
    if end_date:
        try:
            if day > datetime.strptime(end_date[:10], "%Y-%m-%d").date():
                return False
        except ValueError:
            pass
    return True


# 시공사·제안 항목 키워드 (기획서 10장 — 간접 선호 분석 MVP)
_CONTRACTOR_KEYWORDS: List[Tuple[str, List[str]]] = [
    ("GS건설", ["gs건설", "gs 건설", "지에스"]),
    ("DL이앤씨", ["dl이앤씨", "dl 이앤씨", "대림"]),
    ("포스코이앤씨", ["포스코", "posco"]),
    ("삼성물산", ["삼성물산", "래미안"]),
    ("현대건설", ["현대건설", "힐스테이트"]),
    ("HDC", ["hdc", "현대산업개발"]),
]
_PROPOSAL_KEYWORDS: List[Tuple[str, List[str]]] = [
    ("공사비", ["공사비", "분담금", "조합비", "확정공사비"]),
    ("금융조건", ["금융", "이자", "대출", "금리", "확정금리"]),
    ("브랜드/설계", ["브랜드", "설계", "마감재", "특화"]),
    ("착공속도", ["착공", "일정", "지연", "인허가"]),
    ("하자/신뢰", ["하자", "신뢰", "실적", "보증"]),
]
_POSITIVE_REACTION = ("좋", "괜찮", "찬성", "동의", "낫", "지지", "만족", "긍정")
_NEGATIVE_REACTION = ("우려", "반대", "문제", "불안", "근거", "의심", "비판")


def _truncate(text: str, limit: int = 120) -> str:
    t = (text or "").replace("\n", " ").strip()
    return t if len(t) <= limit else t[: limit - 1] + "…"


def _pick_genealogy_root(nodes: List[Dict[str, Any]], edges: List[Dict[str, Any]]) -> str:
    if not nodes:
        return ""
    outbound: Dict[str, int] = {}
    for e in edges:
        outbound[e["source"]] = outbound.get(e["source"], 0) + int(e.get("weight") or 0)
    best = nodes[0]["id"]
    best_score = -1
    for n in nodes:
        score = int(n.get("message_count") or 0) * 2 + outbound.get(n["id"], 0)
        if score > best_score:
            best_score = score
            best = n["id"]
    return best


def _assign_genealogy_parents(
    root_id: str,
    nodes: List[Dict[str, Any]],
    edges: List[Dict[str, Any]],
) -> Dict[str, Optional[str]]:
    parent_by: Dict[str, Optional[str]] = {n["id"]: None if n["id"] == root_id else None for n in nodes}
    for n in nodes:
        if n["id"] == root_id:
            continue
        best_parent: Optional[str] = None
        best_w = -1
        for e in edges:
            if e.get("target") != n["id"]:
                continue
            w = int(e.get("weight") or 0) + int(e.get("weight_동조") or 0)
            if w > best_w:
                best_w = w
                best_parent = e.get("source")
        parent_by[n["id"]] = best_parent if best_parent and best_parent != n["id"] else root_id
    return parent_by


def _genealogy_tier_label(depth: int, message_count: int) -> str:
    if message_count < 3:
        return "관망"
    if depth <= 0:
        return "대화 주도"
    if depth == 1:
        return "1차 응답·동조"
    return "확산·연결"


def _analyze_contractor_signals(messages: List[ParsedMessage]) -> List[Dict[str, Any]]:
    """발언에서 시공사·제안 항목 언급과 긍정/부정 반응 신호를 집계한다."""
    signals: Dict[Tuple[str, str], Dict[str, Any]] = {}
    for m in messages:
        text = (m.message or "").lower()
        if not text:
            continue
        for contractor, keys in _CONTRACTOR_KEYWORDS:
            if not any(k in text for k in keys) and contractor.lower() not in text:
                continue
            for proposal, pkeys in _PROPOSAL_KEYWORDS:
                if not any(pk in text for pk in pkeys):
                    continue
                key = (contractor, proposal)
                if key not in signals:
                    signals[key] = {
                        "contractor": contractor,
                        "proposal_item": proposal,
                        "positive_count": 0,
                        "negative_count": 0,
                        "neutral_count": 0,
                        "sample_messages": [],
                    }
                row = signals[key]
                if any(p in text for p in _POSITIVE_REACTION) or m.stance == "동조":
                    row["positive_count"] += 1
                elif any(p in text for p in _NEGATIVE_REACTION) or m.stance == "반대":
                    row["negative_count"] += 1
                else:
                    row["neutral_count"] += 1
                if len(row["sample_messages"]) < 2:
                    row["sample_messages"].append(
                        {
                            "user": m.user,
                            "text": _truncate(m.message),
                            "stance": m.stance,
                        }
                    )
    out = list(signals.values())
    out.sort(
        key=lambda r: r["positive_count"] + r["negative_count"],
        reverse=True,
    )
    return out[:12]


def _collect_transition_evidence(
    messages: List[ParsedMessage],
    user_ids: Dict[str, str],
    edges: List[Dict[str, Any]],
    limit_edges: int = 6,
) -> List[Dict[str, Any]]:
    """엣지별 근거 발언(직전→다음 발화) 샘플."""
    id_to_user = {v: k for k, v in user_ids.items()}
    ranked = sorted(
        edges,
        key=lambda e: int(e.get("weight") or 0)
        + int(e.get("weight_동조") or 0)
        + int(e.get("weight_반대") or 0)
        + int(e.get("weight_대립") or 0),
        reverse=True,
    )
    evidence: List[Dict[str, Any]] = []
    for e in ranked[:limit_edges]:
        src_user = id_to_user.get(e["source"], e["source"])
        tgt_user = id_to_user.get(e["target"], e["target"])
        samples: List[Dict[str, Any]] = []
        prev: Optional[ParsedMessage] = None
        for m in messages:
            if prev and prev.user == src_user and m.user == tgt_user:
                samples.append(
                    {
                        "from_user": prev.user,
                        "from_text": _truncate(prev.message),
                        "from_stance": prev.stance,
                        "to_user": m.user,
                        "to_text": _truncate(m.message),
                        "to_stance": m.stance,
                    }
                )
                if len(samples) >= 2:
                    break
            prev = m
        evidence.append(
            {
                "type": "edge",
                "source": e["source"],
                "target": e["target"],
                "edge_type": e.get("edge_type") or "flow",
                "summary": f"{src_user} → {tgt_user}",
                "messages": samples,
            }
        )
    return evidence


def _build_graph_meta(
    messages: List[ParsedMessage],
    nodes: List[Dict[str, Any]],
    edges: List[Dict[str, Any]],
    user_ids: Dict[str, str],
) -> Dict[str, Any]:
    root_id = _pick_genealogy_root(nodes, edges)
    parent_by = _assign_genealogy_parents(root_id, nodes, edges)
    depth_by: Dict[str, int] = {root_id: 0}
    queue = [root_id]
    while queue:
        cur = queue.pop(0)
        d = depth_by[cur]
        for n in nodes:
            if parent_by.get(n["id"]) == cur and n["id"] not in depth_by:
                depth_by[n["id"]] = d + 1
                queue.append(n["id"])
    for n in nodes:
        if n["id"] not in depth_by:
            depth_by[n["id"]] = 1

    participant_roles: Dict[str, Dict[str, Any]] = {}
    for n in nodes:
        nid = n["id"]
        mc = int(n.get("message_count") or 0)
        depth = depth_by.get(nid, 0)
        participant_roles[nid] = {
            "genealogy_tier": _genealogy_tier_label(depth, mc),
            "depth": depth,
            "parent_id": parent_by.get(nid),
        }

    stance_breakdown = {"동조": 0, "반대": 0, "중립": 0}
    for n in nodes:
        key = n.get("dominant_stance") or "중립"
        if key in stance_breakdown:
            stance_breakdown[key] += 1

    return {
        "message_count": len(messages),
        "participant_count": len(nodes),
        "edge_count": len(edges),
        "stance_breakdown": stance_breakdown,
        "genealogy_root_id": root_id,
        "participant_roles": participant_roles,
        "contractor_signals": _analyze_contractor_signals(messages),
    }


def build_relationship_graph(
    messages: List[ParsedMessage],
    upload_id: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
) -> Dict[str, Any]:
    filtered = [m for m in messages if _in_date_range(m.ts, start_date, end_date)]
    if not filtered:
        return {
            "upload_id": upload_id,
            "nodes": [],
            "edges": [],
            "start_date": start_date,
            "end_date": end_date,
            "meta": {
                "message_count": 0,
                "participant_count": 0,
                "edge_count": 0,
                "stance_breakdown": {"동조": 0, "반대": 0, "중립": 0},
                "genealogy_root_id": "",
                "participant_roles": {},
                "contractor_signals": [],
            },
            "evidence": [],
        }

    user_ids: Dict[str, str] = {}
    node_stats: Dict[str, Dict[str, Any]] = {}

    def node_id_for(user: str) -> str:
        if user not in user_ids:
            slug = _slug_user(user)
            base = slug
            n = 1
            while slug in user_ids.values():
                n += 1
                slug = f"{base}_{n}"
            user_ids[user] = slug
            node_stats[slug] = {
                "id": slug,
                "label": user,
                "message_count": 0,
                "stance_동조": 0,
                "stance_반대": 0,
                "stance_중립": 0,
            }
        return user_ids[user]

    for m in filtered:
        nid = node_id_for(m.user)
        node_stats[nid]["message_count"] += 1
        key = f"stance_{m.stance}"
        if key in node_stats[nid]:
            node_stats[nid][key] += 1

    edge_map: Dict[Tuple[str, str], Dict[str, Any]] = {}

    def bump_edge(src: str, tgt: str, s1: str, s2: str) -> None:
        key = (src, tgt)
        if key not in edge_map:
            edge_map[key] = {
                "source": src,
                "target": tgt,
                "weight": 0,
                "weight_동조": 0,
                "weight_반대": 0,
                "weight_대립": 0,
                "edge_type": "flow",
            }
        e = edge_map[key]
        e["weight"] += 1
        if s1 == "중립" or s2 == "중립":
            return
        if s1 == s2:
            if s1 == "동조":
                e["weight_동조"] += 1
                e["edge_type"] = "동조"
            elif s1 == "반대":
                e["weight_반대"] += 1
                e["edge_type"] = "반대"
        else:
            e["weight_대립"] += 1
            e["edge_type"] = "대립"

    prev: Optional[ParsedMessage] = None
    for m in filtered:
        if prev and prev.user != m.user:
            s = node_id_for(prev.user)
            t = node_id_for(m.user)
            bump_edge(s, t, prev.stance, m.stance)
        prev = m

    nodes: List[Dict[str, Any]] = []
    for n in node_stats.values():
        counts = (n["stance_동조"], n["stance_반대"], n["stance_중립"])
        dominant = ["동조", "반대", "중립"][max(range(3), key=lambda i: counts[i])]
        if sum(counts) == 0:
            dominant = "중립"
        n["dominant_stance"] = dominant
        nodes.append(n)

    edges = list(edge_map.values())
    meta = _build_graph_meta(filtered, nodes, edges, user_ids)
    evidence = _collect_transition_evidence(filtered, user_ids, edges)
    return {
        "upload_id": upload_id,
        "nodes": nodes,
        "edges": edges,
        "start_date": start_date,
        "end_date": end_date,
        "meta": meta,
        "evidence": evidence,
    }


def save_upload(*, name: str, filename: str, content: str) -> Dict[str, Any]:
    messages = parse_messages(content)
    upload_id = str(uuid.uuid4())
    uploaded_at = datetime.utcnow().isoformat() + "Z"
    with _connect() as conn:
        _init_db(conn)
        conn.execute(
            """
            INSERT INTO conversation_uploads (id, name, filename, content, uploaded_at, message_count)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (upload_id, name, filename, content, uploaded_at, len(messages)),
        )
        conn.commit()
    return {
        "upload_id": upload_id,
        "name": name,
        "filename": filename,
        "uploaded_at": uploaded_at,
        "message_count": len(messages),
    }


def list_uploads() -> List[Dict[str, Any]]:
    with _connect() as conn:
        _init_db(conn)
        rows = conn.execute(
            """
            SELECT id, name, filename, uploaded_at, message_count
            FROM conversation_uploads
            ORDER BY uploaded_at DESC
            """
        ).fetchall()
    return [
        {
            "id": r["id"],
            "name": r["name"],
            "filename": r["filename"],
            "uploaded_at": r["uploaded_at"],
            "message_count": r["message_count"],
        }
        for r in rows
    ]


def get_relationship_graph(
    upload_id: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
) -> Dict[str, Any]:
    with _connect() as conn:
        _init_db(conn)
        row = conn.execute(
            "SELECT content FROM conversation_uploads WHERE id = ?",
            (upload_id,),
        ).fetchone()
    if not row:
        return {"error": "업로드를 찾을 수 없습니다."}
    messages = parse_messages(row["content"])
    return build_relationship_graph(messages, upload_id, start_date, end_date)
