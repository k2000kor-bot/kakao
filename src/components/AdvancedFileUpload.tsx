import React, { useState } from 'react';

interface AdvancedFileUploadProps {
    onFileAnalyzed?: (result: any) => void;
    onFileUploaded?: (file: File) => void;
    onFileClassified?: (classification: string) => void;
}

const AdvancedFileUpload: React.FC<AdvancedFileUploadProps> = ({
    onFileAnalyzed = () => { },
    onFileUploaded = () => { },
    onFileClassified = () => { }
}) => {
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            setIsUploading(true);

            setTimeout(() => {
                const fileArray = Array.from(files);
                setUploadedFiles(prev => [...prev, ...fileArray]);

                fileArray.forEach(file => {
                    onFileUploaded(file);
                    onFileClassified('문서');
                    onFileAnalyzed({
                        filename: file.name,
                        size: file.size,
                        type: file.type
                    });
                });

                setIsUploading(false);
            }, 2000);
        }
    };

    return (
        <div className="advanced-file-upload">
            <div className="upload-header">
                <h2>📁 파일 업로드</h2>
                <p>AI 분석을 위한 파일을 업로드하세요</p>
            </div>

            <div className="upload-area">
                <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="file-input"
                    accept=".txt,.pdf,.doc,.docx,.jpg,.png"
                />
                <div className="upload-placeholder">
                    {isUploading ? (
                        <div className="uploading">
                            <div className="spinner"></div>
                            <p>업로드 중...</p>
                        </div>
                    ) : (
                        <>
                            <div className="upload-icon">📁</div>
                            <p>파일을 드래그하거나 클릭하여 업로드</p>
                            <p className="file-types">지원 형식: TXT, PDF, DOC, DOCX, JPG, PNG</p>
                        </>
                    )}
                </div>
            </div>

            {uploadedFiles.length > 0 && (
                <div className="uploaded-files">
                    <h3>업로드된 파일</h3>
                    <div className="files-list">
                        {uploadedFiles.map((file, index) => (
                            <div key={index} className="file-item">
                                <span className="file-name">{file.name}</span>
                                <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvancedFileUpload; 