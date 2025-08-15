import React, { useState, useEffect } from 'react';
import {
    FolderIcon,
    DocumentIcon,
    PhotoIcon,
    VideoCameraIcon,
    MusicalNoteIcon,
    ArchiveBoxIcon,
    MagnifyingGlassIcon,
    CogIcon,
    ArrowUpTrayIcon,
    TrashIcon,
    EyeIcon,
    PencilIcon,
    ShareIcon,
    StarIcon,
    ClockIcon,
    ChartBarIcon,
    CloudArrowUpIcon,
    DocumentDuplicateIcon
} from '@heroicons/react/24/outline';

interface FileItem {
    id: string;
    name: string;
    type: 'folder' | 'document' | 'image' | 'video' | 'audio' | 'archive' | 'other';
    size: number;
    modified: Date;
    created: Date;
    path: string;
    tags: string[];
    favorite: boolean;
    shared: boolean;
    thumbnail?: string;
    metadata?: {
        width?: number;
        height?: number;
        duration?: number;
        format?: string;
        pages?: number;
    };
}

interface FileStats {
    totalFiles: number;
    totalSize: number;
    byType: {
        [key: string]: { count: number; size: number };
    };
    recentUploads: number;
    sharedFiles: number;
}

interface AdvancedFileManagerProps {
    onFileSelect?: (file: FileItem) => void;
    onFileUpload?: (files: File[]) => void;
    onFileDelete?: (fileId: string) => void;
}

const AdvancedFileManager: React.FC<AdvancedFileManagerProps> = ({
    onFileSelect,
    onFileUpload,
    onFileDelete
}) => {
    const [files, setFiles] = useState<FileItem[]>([]);
    const [stats, setStats] = useState<FileStats>({
        totalFiles: 0,
        totalSize: 0,
        byType: {},
        recentUploads: 0,
        sharedFiles: 0
    });
    const [activeTab, setActiveTab] = useState<'files' | 'recent' | 'favorites' | 'shared' | 'stats'>('files');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
    const [currentPath, setCurrentPath] = useState('/');

    // 시뮬레이션된 파일 데이터
    useEffect(() => {
        const mockFiles: FileItem[] = [
            {
                id: '1',
                name: '프로젝트 문서',
                type: 'folder',
                size: 0,
                modified: new Date(Date.now() - 2 * 60 * 60 * 1000),
                created: new Date(Date.now() - 24 * 60 * 60 * 1000),
                path: '/프로젝트 문서',
                tags: ['프로젝트', '문서'],
                favorite: true,
                shared: false
            },
            {
                id: '2',
                name: 'presentation.pdf',
                type: 'document',
                size: 2048576,
                modified: new Date(Date.now() - 30 * 60 * 1000),
                created: new Date(Date.now() - 3 * 60 * 60 * 1000),
                path: '/presentation.pdf',
                tags: ['프레젠테이션', 'PDF'],
                favorite: false,
                shared: true,
                metadata: {
                    pages: 15,
                    format: 'PDF'
                }
            },
            {
                id: '3',
                name: 'team_photo.jpg',
                type: 'image',
                size: 1048576,
                modified: new Date(Date.now() - 1 * 60 * 60 * 1000),
                created: new Date(Date.now() - 2 * 60 * 60 * 1000),
                path: '/team_photo.jpg',
                tags: ['사진', '팀'],
                favorite: true,
                shared: false,
                thumbnail: '/thumbnails/team_photo.jpg',
                metadata: {
                    width: 1920,
                    height: 1080,
                    format: 'JPEG'
                }
            },
            {
                id: '4',
                name: 'demo_video.mp4',
                type: 'video',
                size: 52428800,
                modified: new Date(Date.now() - 15 * 60 * 1000),
                created: new Date(Date.now() - 45 * 60 * 1000),
                path: '/demo_video.mp4',
                tags: ['비디오', '데모'],
                favorite: false,
                shared: true,
                metadata: {
                    duration: 180,
                    format: 'MP4'
                }
            },
            {
                id: '5',
                name: 'background_music.mp3',
                type: 'audio',
                size: 3145728,
                modified: new Date(Date.now() - 5 * 60 * 1000),
                created: new Date(Date.now() - 1 * 60 * 60 * 1000),
                path: '/background_music.mp3',
                tags: ['음악', '배경'],
                favorite: false,
                shared: false,
                metadata: {
                    duration: 240,
                    format: 'MP3'
                }
            },
            {
                id: '6',
                name: 'project_backup.zip',
                type: 'archive',
                size: 104857600,
                modified: new Date(Date.now() - 6 * 60 * 60 * 1000),
                created: new Date(Date.now() - 6 * 60 * 60 * 1000),
                path: '/project_backup.zip',
                tags: ['백업', '압축'],
                favorite: false,
                shared: false,
                metadata: {
                    format: 'ZIP'
                }
            }
        ];

        setFiles(mockFiles);

        // 통계 계산
        const totalSize = mockFiles.reduce((acc, file) => acc + file.size, 0);
        const byType = mockFiles.reduce((acc, file) => {
            if (!acc[file.type]) {
                acc[file.type] = { count: 0, size: 0 };
            }
            acc[file.type].count++;
            acc[file.type].size += file.size;
            return acc;
        }, {} as { [key: string]: { count: number; size: number } });

        setStats({
            totalFiles: mockFiles.length,
            totalSize,
            byType,
            recentUploads: mockFiles.filter(f => f.created > new Date(Date.now() - 24 * 60 * 60 * 1000)).length,
            sharedFiles: mockFiles.filter(f => f.shared).length
        });
    }, []);

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (type: string) => {
        switch (type) {
            case 'folder': return <FolderIcon className="w-6 h-6 text-blue-500" />;
            case 'document': return <DocumentIcon className="w-6 h-6 text-red-500" />;
            case 'image': return <PhotoIcon className="w-6 h-6 text-green-500" />;
            case 'video': return <VideoCameraIcon className="w-6 h-6 text-purple-500" />;
            case 'audio': return <MusicalNoteIcon className="w-6 h-6 text-yellow-500" />;
            case 'archive': return <ArchiveBoxIcon className="w-6 h-6 text-orange-500" />;
            default: return <DocumentIcon className="w-6 h-6 text-gray-500" />;
        }
    };

    const toggleFavorite = (fileId: string) => {
        setFiles(prev =>
            prev.map(file =>
                file.id === fileId ? { ...file, favorite: !file.favorite } : file
            )
        );
    };

    const toggleSelection = (fileId: string) => {
        setSelectedFiles(prev =>
            prev.includes(fileId)
                ? prev.filter(id => id !== fileId)
                : [...prev, fileId]
        );
    };

    const deleteSelectedFiles = () => {
        setFiles(prev => prev.filter(file => !selectedFiles.includes(file.id)));
        setSelectedFiles([]);
        onFileDelete?.(selectedFiles[0]);
    };

    const filteredFiles = files.filter(file => {
        if (searchQuery) {
            return file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                file.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        }

        switch (activeTab) {
            case 'recent':
                return file.modified > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            case 'favorites':
                return file.favorite;
            case 'shared':
                return file.shared;
            default:
                return true;
        }
    });

    const renderFileGrid = () => (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredFiles.map((file) => (
                <div
                    key={file.id}
                    onClick={() => onFileSelect?.(file)}
                    className={`relative p-4 border rounded-lg cursor-pointer transition-all ${selectedFiles.includes(file.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                        }`}
                >
                    <div className="flex items-center justify-between mb-2">
                        {getFileIcon(file.type)}
                        <div className="flex space-x-1">
                            {file.favorite && <StarIcon className="w-4 h-4 text-yellow-500" />}
                            {file.shared && <ShareIcon className="w-4 h-4 text-blue-500" />}
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        <p className="text-xs text-gray-400">{file.modified.toLocaleDateString()}</p>
                    </div>

                    <div className="absolute top-2 left-2">
                        <input
                            type="checkbox"
                            checked={selectedFiles.includes(file.id)}
                            onChange={(e) => {
                                e.stopPropagation();
                                toggleSelection(file.id);
                            }}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                    </div>
                </div>
            ))}
        </div>
    );

    const renderFileList = () => (
        <div className="space-y-2">
            {filteredFiles.map((file) => (
                <div
                    key={file.id}
                    onClick={() => onFileSelect?.(file)}
                    className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-all ${selectedFiles.includes(file.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                >
                    <input
                        type="checkbox"
                        checked={selectedFiles.includes(file.id)}
                        onChange={(e) => {
                            e.stopPropagation();
                            toggleSelection(file.id);
                        }}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />

                    {getFileIcon(file.type)}

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                            {file.favorite && <StarIcon className="w-4 h-4 text-yellow-500" />}
                            {file.shared && <ShareIcon className="w-4 h-4 text-blue-500" />}
                        </div>
                        <p className="text-xs text-gray-500">{file.path}</p>
                    </div>

                    <div className="text-right">
                        <p className="text-sm text-gray-900">{formatFileSize(file.size)}</p>
                        <p className="text-xs text-gray-500">{file.modified.toLocaleDateString()}</p>
                    </div>

                    <div className="flex space-x-1">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(file.id);
                            }}
                            className="p-1 text-gray-400 hover:text-yellow-500"
                        >
                            <StarIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                // 상세보기 로직
                            }}
                            className="p-1 text-gray-400 hover:text-blue-500"
                        >
                            <EyeIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderStats = () => (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">파일 통계</h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">총 파일</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalFiles}</p>
                        </div>
                        <DocumentIcon className="w-8 h-8 text-blue-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">총 크기</p>
                            <p className="text-2xl font-bold text-gray-900">{formatFileSize(stats.totalSize)}</p>
                        </div>
                        <ChartBarIcon className="w-8 h-8 text-green-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">최근 업로드</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.recentUploads}</p>
                        </div>
                        <ClockIcon className="w-8 h-8 text-yellow-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">공유 파일</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.sharedFiles}</p>
                        </div>
                        <ShareIcon className="w-8 h-8 text-purple-500" />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg border p-6">
                <h4 className="font-medium text-gray-900 mb-4">파일 유형별 분포</h4>
                <div className="space-y-3">
                    {Object.entries(stats.byType).map(([type, data]) => (
                        <div key={type} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                {getFileIcon(type)}
                                <span className="text-sm font-medium text-gray-900">
                                    {type === 'folder' ? '폴더' :
                                        type === 'document' ? '문서' :
                                            type === 'image' ? '이미지' :
                                                type === 'video' ? '비디오' :
                                                    type === 'audio' ? '오디오' :
                                                        type === 'archive' ? '압축' : '기타'}
                                </span>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">{data.count}개</p>
                                <p className="text-xs text-gray-500">{formatFileSize(data.size)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-gray-50">
            {/* 헤더 */}
            <div className="bg-white border-b px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <FolderIcon className="w-6 h-6 text-blue-500" />
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">고급 파일 관리</h3>
                            <p className="text-sm text-gray-500">파일 및 폴더 관리 시스템</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200" title="설정">
                            <CogIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* 검색 및 도구 */}
            <div className="bg-white border-b px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                        <div className="relative flex-1 max-w-md">
                            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="파일 검색..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div className="flex space-x-2">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                                    }`}
                            >
                                <DocumentIcon className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                                    }`}
                            >
                                <DocumentDuplicateIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex space-x-2">
                        {selectedFiles.length > 0 && (
                            <button
                                onClick={deleteSelectedFiles}
                                className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center space-x-2"
                            >
                                <TrashIcon className="w-4 h-4" />
                                <span>삭제 ({selectedFiles.length})</span>
                            </button>
                        )}
                        <button className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2">
                            <ArrowUpTrayIcon className="w-4 h-4" />
                            <span>업로드</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* 탭 네비게이션 */}
            <div className="bg-white border-b">
                <nav className="flex space-x-8 px-4">
                    {[
                        { id: 'files', name: '모든 파일', icon: FolderIcon },
                        { id: 'recent', name: '최근', icon: ClockIcon },
                        { id: 'favorites', name: '즐겨찾기', icon: StarIcon },
                        { id: 'shared', name: '공유', icon: ShareIcon },
                        { id: 'stats', name: '통계', icon: ChartBarIcon }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span>{tab.name}</span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* 메인 콘텐츠 */}
            <div className="flex-1 overflow-y-auto p-4">
                {activeTab === 'stats' ? renderStats() : (
                    viewMode === 'grid' ? renderFileGrid() : renderFileList()
                )}
            </div>
        </div>
    );
};

export default AdvancedFileManager;
