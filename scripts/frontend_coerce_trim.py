#!/usr/bin/env python3
"""frontend/src: .trim() → coerceTrimmedString + import (chatInputUtils 제외)."""
from __future__ import annotations

import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "frontend" / "src"
UTILS = ROOT / "utils" / "chatInputUtils.ts"


def import_path(from_file: Path) -> str:
    r = os.path.relpath(UTILS.with_suffix(""), from_file.parent).replace("\\", "/")
    return r if r.startswith(".") else "./" + r


def skip(p: Path) -> bool:
    s = str(p)
    return "chatInputUtils.ts" in s or "__tests__" in s


def add_import(text: str, ip: str) -> str:
    if re.search(r"import\s+[^;\n]*\bcoerceTrimmedString\b", text):
        return text
    line = f"import {{ coerceTrimmedString }} from '{ip}';\n"
    lines = text.splitlines(keepends=True)
    n = len(lines)
    i = 0
    ins = 0
    while i < n:
        s = lines[i].strip()
        if not s or s.startswith("//") or s.startswith("/*") or s.startswith("*"):
            i += 1
            continue
        if s.startswith("import "):
            while i < n:
                ins = i + 1
                cur = lines[i]
                if " from " in cur or "\tfrom " in cur:
                    if "'" in cur or '"' in cur:
                        i += 1
                        break
                i += 1
            continue
        break
    lines.insert(ins, line)
    return "".join(lines)


def sub_all(t: str) -> str:
    """긴 패턴부터 단순 치환."""
    reps: list[tuple[str, str]] = []

    def r(a: str, b: str) -> None:
        reps.append((a, b))

    # --- chains & returns (구체적) ---
    r(
        "return question\n            .trim()\n            .replace(/\\s+/g, ' ')",
        "return coerceTrimmedString(question, '')\n            .replace(/\\s+/g, ' ')",
    )
    r(
        "return content\n      .replace(/\\s+/g, ' ').trim()\n      .toLowerCase();",
        "return coerceTrimmedString(content.replace(/\\s+/g, ' '), '')\n      .toLowerCase();",
    )
    r(
        "processedText = processedText.replace(/\\s+/g, ' ').trim();",
        "processedText = coerceTrimmedString(processedText.replace(/\\s+/g, ' '), '');",
    )

    # kakaoParser
    r("const line = lines[i].trim();", "const line = coerceTrimmedString(lines[i], '');")
    r(
        "result.roomName = line.replace(' 님과 카카오톡 대화', '').trim();",
        "result.roomName = coerceTrimmedString(line.replace(' 님과 카카오톡 대화', ''), '');",
    )
    r(
        "result.saveDate = line.replace('저장한 날짜 : ', '').trim();",
        "result.saveDate = coerceTrimmedString(line.replace('저장한 날짜 : ', ''), '');",
    )
    r(
        "const lastSentence = message.split(/[.!?]/).pop()?.trim();",
        "const lastSentence = coerceTrimmedString(message.split(/[.!?]/).pop(), '');",
    )

    # 문자열 그대로 치환
    for a, b in reps:
        t = t.replace(a, b)

    # 반복 가능한 정규 치환
    patterns = [
        (r"filter\(\s*s\s*=>\s*s\.trim\(\)\.length", r"filter(s => coerceTrimmedString(s, '').length"),
        (r"filter\(\s*s\s*=>\s*s\.trim\(\)\)", r"filter(s => coerceTrimmedString(s, ''))"),
        (r"filter\(\s*line\s*=>\s*line\.trim\(\)\)", r"filter(line => coerceTrimmedString(line, ''))"),
        (r"filter\(\s*part\s*=>\s*part\.trim\(\)\.length", r"filter(part => coerceTrimmedString(part, '').length"),
        (r"filter\(\s*word\s*=>\s*word\.trim\(\)\.length", r"filter(word => coerceTrimmedString(word, '').length"),
        (r"filter\(\s*para\s*=>\s*para\.trim\(\)\.length", r"filter(para => coerceTrimmedString(para, '').length"),
        (r"filter\(\s*p\s*=>\s*p\.trim\(\)\.length", r"filter(p => coerceTrimmedString(p, '').length"),
        (r"filter\(\s*w\s*=>\s*w\.trim\(\)\.length", r"filter(w => coerceTrimmedString(w, '').length"),
        (r"filter\(\s*cell\s*=>\s*cell\.trim\(\)", r"filter(cell => coerceTrimmedString(cell, '')"),
        (r"filter\(\s*\(line:\s*string\)\s*=>\s*line\.trim\(\)\.length", r"filter((line: string) => coerceTrimmedString(line, '').length"),
        (r"filter\(\s*\(s:\s*string\)\s*=>\s*s\.trim\(\)\.length", r"filter((s: string) => coerceTrimmedString(s, '').length"),
        (r"map\(\s*k\s*=>\s*k\.trim\(\)", r"map(k => coerceTrimmedString(k, '')"),
        (r"map\(\s*part\s*=>\s*part\.trim\(\)", r"map(part => coerceTrimmedString(part, '')"),
        (r"map\(\s*req\s*=>\s*req\.trim\(\)", r"map(req => coerceTrimmedString(req, '')"),
        (r"map\(\s*s\s*=>\s*s\.trim\(\)\s*\+", r"map(s => coerceTrimmedString(s, '') +"),
        (r"\$\{s\.trim\(\)\}", r"${coerceTrimmedString(s, '')}"),
        (r"if\s*\(\s*!text\.trim\(\)\s*\)", r"if (!coerceTrimmedString(text, ''))"),
        (r"if\s*\(\s*!message\.trim\(\)\s*\)", r"if (!coerceTrimmedString(message, ''))"),
        (r"if\s*\(\s*!searchQuery\.trim\(\)\s*\)", r"if (!coerceTrimmedString(searchQuery, ''))"),
        (r"if\s*\(\s*!inputText\.trim\(\)\s*\)", r"if (!coerceTrimmedString(inputText, ''))"),
        (r"if\s*\(\s*!generationPrompt\.trim\(\)\s*\)", r"if (!coerceTrimmedString(generationPrompt, ''))"),
        (r"if\s*\(\s*!currentMessage\.trim\(\)\s*\)", r"if (!coerceTrimmedString(currentMessage, ''))"),
        (r"if\s*\(\s*!newProjectName\.trim\(\)\s*\)", r"if (!coerceTrimmedString(newProjectName, ''))"),
        (r"if\s*\(\s*!projectName\.trim\(\)\s*\)", r"if (!coerceTrimmedString(projectName, ''))"),
        (r"if\s*\(\s*message\.trim\(\)\s*&&", r"if (coerceTrimmedString(message, '') &&"),
        (r"if\s*\(\s*testText\.trim\(\)\s*\)", r"if (coerceTrimmedString(testText, ''))"),
        (r"disabled=\{!message\.trim\(\)", r"disabled={!coerceTrimmedString(message, '')"),
        (r"disabled=\{!newProjectName\.trim\(\)", r"disabled={!coerceTrimmedString(newProjectName, '')"),
        (r"disabled=\{!inputText\.trim\(\)", r"disabled={!coerceTrimmedString(inputText, '')"),
        (r"disabled=\{!generationPrompt\.trim\(\)", r"disabled={!coerceTrimmedString(generationPrompt, '')"),
        (r"disabled=\{!currentMessage\.trim\(\)", r"disabled={!coerceTrimmedString(currentMessage, '')"),
        (r"disabled=\{loading\s*\|\|\s*!message\.trim\(\)", r"disabled={loading || !coerceTrimmedString(message, '')"),
        (r"return\s+comment\.trim\(\)\s*;", r"return coerceTrimmedString(comment, '');"),
        (r"return\s+rebuttal\.trim\(\)\s*;", r"return coerceTrimmedString(rebuttal, '');"),
        (r"return\s+result\.trim\(\)\s*;", r"return coerceTrimmedString(result, '');"),
        (r"return\s+text\.trim\(\)\s*\|\|", r"return coerceTrimmedString(text, '') ||"),
        (r"transcript\.toLowerCase\(\)\.trim\(\)", r"coerceTrimmedString(transcript.toLowerCase(), '')"),
        (r"msg\.content\.trim\(\)", r"coerceTrimmedString(msg.content, '')"),
        (r"answer\.trim\(\)\.length", r"coerceTrimmedString(answer, '').length"),
        (r"\bsegment\.trim\(\)", r"coerceTrimmedString(segment, '')"),
        (r"sentences\[i\]\.trim\(\)", r"coerceTrimmedString(sentences[i], '')"),
        (r"sentences\[sentences\.length - 1\]\.trim\(\)", r"coerceTrimmedString(sentences[sentences.length - 1], '')"),
        (r"content:\s*sentence\.trim\(\)", r"content: coerceTrimmedString(sentence, '')"),
        (r"return\s+sentence\.trim\(\)\s*;", r"return coerceTrimmedString(sentence, '');"),
        (r"match\[1\]\.trim\(\)", r"coerceTrimmedString(match[1], '')"),
        (r"issues\.push\(sentence\.trim\(\)\)", r"issues.push(coerceTrimmedString(sentence, ''))"),
        (r"editingGuideline\?\.title\?\.trim\(\)", r"coerceTrimmedString(editingGuideline?.title, '')"),
        (r"editingGuideline\?\.content\?\.trim\(\)", r"coerceTrimmedString(editingGuideline?.content, '')"),
        (r"\bnewTag\.trim\(\)", r"coerceTrimmedString(newTag, '')"),
        (r"name:\s*projectName\.trim\(\)", r"name: coerceTrimmedString(projectName, '')"),
        (r"description:\s*projectDescription\.trim\(\)", r"description: coerceTrimmedString(projectDescription, '')"),
        (r"guidelines\.filter\(g => g\.trim\(\)\)", r"guidelines.filter(g => coerceTrimmedString(g, ''))"),
        (r"projectName\.trim\(\)\.length", r"coerceTrimmedString(projectName, '').length"),
        (r"cause:\s*match\[1\]\.trim\(\)", r"cause: coerceTrimmedString(match[1], '')"),
        (
            r"effect:\s*match\[3\]\s*\?\s*match\[3\]\.trim\(\)\s*:\s*match\[2\]\.trim\(\)",
            r"effect: match[3] ? coerceTrimmedString(match[3], '') : coerceTrimmedString(match[2], '')",
        ),
        (r"currentDate\s*=\s*line\.trim\(\)", r"currentDate = coerceTrimmedString(line, '')"),
        (r"sender:\s*sender\.trim\(\)", r"sender: coerceTrimmedString(sender, '')"),
        (r"content:\s*content\.trim\(\)", r"content: coerceTrimmedString(content, '')"),
        (r"timestamp:\s*timestamp\.trim\(\)", r"timestamp: coerceTrimmedString(timestamp, '')"),
        (r"line\.substring\(timestamp\.length\)\.trim\(\)", r"coerceTrimmedString(line.substring(timestamp.length), '')"),
        (r"sender:\s*senderMatch\[1\]\.trim\(\)", r"sender: coerceTrimmedString(senderMatch[1], '')"),
        (r"if\s*\(\s*!line\.trim\(\)\s*\)\s*continue", r"if (!coerceTrimmedString(line, '')) continue"),
        (r"actionItems\.add\(match\.trim\(\)\)", r"actionItems.add(coerceTrimmedString(match, ''))"),
        (r"references\.add\(match\.trim\(\)\)", r"references.add(coerceTrimmedString(match, ''))"),
        (r"concepts\.push\(match\[1\]\.trim\(\)\)", r"concepts.push(coerceTrimmedString(match[1], ''))"),
        (r"context:\s*context\.trim\(\)", r"context: coerceTrimmedString(context, '')"),
        (r"sentence\.trim\(\)\.split", r"coerceTrimmedString(sentence, '').split"),
        (r"sentence:\s*sentence\.trim\(\)", r"sentence: coerceTrimmedString(sentence, '')"),
        (r"expandedSentences\.push\(sentence\.trim\(\)", r"expandedSentences.push(coerceTrimmedString(sentence, '')"),
        (r"clauses\.map\(clause => clause\.trim\(\)\)", r"clauses.map(clause => coerceTrimmedString(clause, ''))"),
        (r"line\.trim\(\)\s*!==\s*''", r"coerceTrimmedString(line, '') !== ''"),
        (r"content\.trim\(\)\.length\s*>\s*0", r"coerceTrimmedString(content, '').length > 0"),
        (
            r"const newKnowledge = `\$\{existingKnowledge\}\\n\$\{knowledge\.synthesizedContent\}`\.trim\(\)",
            r"const newKnowledge = coerceTrimmedString(`${existingKnowledge}\n${knowledge.synthesizedContent}`, '')",
        ),
        (r"return match \? match\[1\]\.trim\(\) : '';", r"return match ? coerceTrimmedString(match[1], '') : '';"),
        (r"\.map\(line => line\.replace\(/\^\[-•\*\]\\s\*/, ''\)\.trim\(\)\)", r".map(line => coerceTrimmedString(line.replace(/^[-•*]\\s*/, ''), ''))"),
        (r"actionItems\.push\(\.\.\.matches\.map\(match => match\.trim\(\)\)\)", r"actionItems.push(...matches.map(match => coerceTrimmedString(match, '')))"),
        (r"filter\(q => q\.trim\(\)\.length", r"filter(q => coerceTrimmedString(q, '').length"),
        (r"\.map\(q => q\.trim\(\)\s*\+\s*'\?'", r".map(q => coerceTrimmedString(q, '') + '?'"),
        (r"if\s*\(\s*cleanMessage\.trim\(\)\.length", r"if (coerceTrimmedString(cleanMessage, '').length"),
        (r"return\s+cleanMessage\.trim\(\)\s*;", r"return coerceTrimmedString(cleanMessage, '');"),
        (r"topics\[0\]\?\.trim\(\)", r"coerceTrimmedString(topics[0], '')"),
        (r"message\.split\(/에 대한\|관한\|대해서/\)\[0\]\.trim\(\)", r"coerceTrimmedString(message.split(/에 대한|관한|대해서/)[0], '')"),
    ]

    for pat, rep in patterns:
        t = re.sub(pat, rep, t)

    return t


def main() -> int:
    if not ROOT.is_dir() or not UTILS.is_file():
        print("frontend/src or chatInputUtils missing", file=sys.stderr)
        return 1

    n = 0
    for path in sorted(ROOT.rglob("*.ts")) + sorted(ROOT.rglob("*.tsx")):
        if skip(path) or path.resolve() == UTILS.resolve():
            continue
        text = path.read_text(encoding="utf-8")
        if ".trim()" not in text:
            continue
        new = sub_all(text)
        if new == text:
            continue
        new = add_import(new, import_path(path))
        path.write_text(new, encoding="utf-8")
        print(path.relative_to(ROOT))
        n += 1
    print(f"updated {n} files")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
