/**
 * 글쓰기 내보내기 유틸리티
 */

import { errorLogger } from './errorLogger';
import { showToast } from './toast';

export interface ExportOptions {
    format: 'txt' | 'docx' | 'pdf' | 'html' | 'markdown';
    includeMetadata?: boolean;
    includeAnalysis?: boolean;
}

export interface WritingMetadata {
    title?: string;
    author?: string;
    date?: string;
    template?: string;
    tone?: string;
    style?: string;
    wordCount?: number;
    charCount?: number;
}

class WritingExporter {
    /**
     * 텍스트 파일로 내보내기
     */
    exportToText(content: string, metadata?: WritingMetadata): string {
        let output = '';

        if (metadata) {
            if (metadata.title) output += `제목: ${metadata.title}\n`;
            if (metadata.author) output += `작성자: ${metadata.author}\n`;
            if (metadata.date) output += `작성일: ${metadata.date}\n`;
            if (metadata.template) output += `템플릿: ${metadata.template}\n`;
            if (metadata.tone) output += `어투: ${metadata.tone}\n`;
            if (metadata.style) output += `스타일: ${metadata.style}\n`;
            if (metadata.wordCount) output += `단어 수: ${metadata.wordCount}\n`;
            if (metadata.charCount) output += `글자 수: ${metadata.charCount}\n`;
            output += '\n---\n\n';
        }

        output += content;
        return output;
    }

    /**
     * HTML 파일로 내보내기
     */
    exportToHTML(content: string, metadata?: WritingMetadata): string {
        let html = '<!DOCTYPE html>\n<html lang="ko">\n<head>\n';
        html += '<meta charset="UTF-8">\n';
        html += '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n';
        html += `<title>${metadata?.title || '글쓰기'}</title>\n`;
        html += '<style>\n';
        html += 'body { font-family: "Malgun Gothic", sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }\n';
        html += '.metadata { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }\n';
        html += '.content { white-space: pre-wrap; }\n';
        html += '</style>\n';
        html += '</head>\n<body>\n';

        if (metadata) {
            html += '<div class="metadata">\n';
            if (metadata.title) html += `<h1>${metadata.title}</h1>\n`;
            if (metadata.author) html += `<p><strong>작성자:</strong> ${metadata.author}</p>\n`;
            if (metadata.date) html += `<p><strong>작성일:</strong> ${metadata.date}</p>\n`;
            if (metadata.template) html += `<p><strong>템플릿:</strong> ${metadata.template}</p>\n`;
            if (metadata.tone) html += `<p><strong>어투:</strong> ${metadata.tone}</p>\n`;
            if (metadata.style) html += `<p><strong>스타일:</strong> ${metadata.style}</p>\n`;
            if (metadata.wordCount) html += `<p><strong>단어 수:</strong> ${metadata.wordCount}</p>\n`;
            if (metadata.charCount) html += `<p><strong>글자 수:</strong> ${metadata.charCount}</p>\n`;
            html += '</div>\n';
        }

        html += `<div class="content">${this.escapeHTML(content)}</div>\n`;
        html += '</body>\n</html>';
        return html;
    }

    /**
     * Markdown 파일로 내보내기
     */
    exportToMarkdown(content: string, metadata?: WritingMetadata): string {
        let md = '';

        if (metadata) {
            if (metadata.title) md += `# ${metadata.title}\n\n`;
            if (metadata.author) md += `**작성자:** ${metadata.author}\n\n`;
            if (metadata.date) md += `**작성일:** ${metadata.date}\n\n`;
            if (metadata.template) md += `**템플릿:** ${metadata.template}\n\n`;
            if (metadata.tone) md += `**어투:** ${metadata.tone}\n\n`;
            if (metadata.style) md += `**스타일:** ${metadata.style}\n\n`;
            if (metadata.wordCount) md += `**단어 수:** ${metadata.wordCount}\n\n`;
            if (metadata.charCount) md += `**글자 수:** ${metadata.charCount}\n\n`;
            md += '---\n\n';
        }

        md += content;
        return md;
    }

    /**
     * 파일 다운로드
     */
    downloadFile(content: string, filename: string, mimeType: string = 'text/plain') {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * 내보내기 실행
     */
    export(
        content: string,
        options: ExportOptions,
        metadata?: WritingMetadata
    ) {
        let output = '';
        let filename = `writing_${new Date().toISOString().split('T')[0]}`;
        let mimeType = 'text/plain';

        switch (options.format) {
            case 'txt':
                output = this.exportToText(content, options.includeMetadata ? metadata : undefined);
                filename += '.txt';
                mimeType = 'text/plain';
                break;

            case 'html':
                output = this.exportToHTML(content, options.includeMetadata ? metadata : undefined);
                filename += '.html';
                mimeType = 'text/html';
                break;

            case 'markdown':
                output = this.exportToMarkdown(content, options.includeMetadata ? metadata : undefined);
                filename += '.md';
                mimeType = 'text/markdown';
                break;

            case 'docx':
                // DOCX는 복잡하므로 텍스트로 대체하거나 라이브러리 필요
                output = this.exportToText(content, options.includeMetadata ? metadata : undefined);
                filename += '.txt';
                mimeType = 'text/plain';
                showToast('DOCX 형식은 현재 지원되지 않습니다. 텍스트 파일로 내보냅니다.', 'info');
                break;

            case 'pdf':
                // PDF는 브라우저에서 직접 생성하기 어려우므로 HTML로 변환 후 인쇄 제안
                output = this.exportToHTML(content, options.includeMetadata ? metadata : undefined);
                filename += '.html';
                mimeType = 'text/html';
                showToast('PDF 형식은 현재 지원되지 않습니다. HTML 파일로 내보낸 후 브라우저에서 인쇄하여 PDF로 저장하세요.', 'info');
                break;

            default:
                output = this.exportToText(content, options.includeMetadata ? metadata : undefined);
                filename += '.txt';
                mimeType = 'text/plain';
        }

        this.downloadFile(output, filename, mimeType);
    }

    /**
     * HTML 이스케이프
     */
    private escapeHTML(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML.replace(/\n/g, '<br>');
    }

    /**
     * 클립보드에 복사
     */
    async copyToClipboard(content: string): Promise<boolean> {
        try {
            await navigator.clipboard.writeText(content);
            return true;
        } catch (error) {
            errorLogger.error('클립보드 복사 실패', error instanceof Error ? error : new Error(String(error)), { component: 'writingExport', action: 'copyToClipboard' });
            return false;
        }
    }

    /**
     * 프린트
     */
    print(content: string, metadata?: WritingMetadata) {
        const html = this.exportToHTML(content, metadata);
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
            }, 250);
        }
    }
}

export const writingExporter = new WritingExporter();
export default writingExporter;

