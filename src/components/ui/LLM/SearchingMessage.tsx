import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, ExternalLink, Volume2 } from 'lucide-react';

interface SearchResultProps {
    result: {
        title: string;
        url: string;
        source: string;
    };
    index: number;
}

const sourceIcons = {
    '微信': 'https://www.google.com/s2/favicons?domain=weixin.com&sz=16',
    '抖音': 'https://www.google.com/s2/favicons?domain=douyin.com&sz=16',
    '必应': 'https://www.google.com/s2/favicons?domain=microsoft.com&sz=16',
    '推特': 'https://www.google.com/s2/favicons?domain=x.com&sz=16',
    'Gemini': 'https://www.google.com/s2/favicons?domain=google.com&sz=16',
};

const SearchResult: React.FC<SearchResultProps> = ({ result, index }) => (
    <motion.a
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transform: 'translateY(0)' }}
        exit={{ opacity: 0, transform: 'translateY(20px)' }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        href={`https://${result.url}`}
        target="_blank"
        rel="noreferrer"
        className="border-b border-b-gray-100 flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-100 transition-colors duration-200 rounded-lg"
    >
        <img
            alt="Favicon"
            width="16"
            height="16"
            className="flex-shrink-0 rounded-lg"
            src={`https://www.google.com/s2/favicons?domain=${result.url}&sz=16`}
        />
        <div className="flex-grow">
            <div className="text-sm text-gray-900 line-clamp-1">{result.title}</div>
            <div className="text-xs text-gray-500 mt-1 line-clamp-1">{result.url}</div>
        </div>
        <ExternalLink className="flex-shrink-0 text-gray-400 ml-2" size={16} />
    </motion.a>
);

// @ts-ignore
const ReadingSource = ({ source }) => (
    <div className="flex cursor-pointer items-center bg-gray-100 rounded-full px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-200 transition-colors">
        <img
            // @ts-ignore
            src={sourceIcons[source]}
            alt={`数据来源:${source}`}
            className="w-3 h-3 mr-2 rounded-lg"
        />
        <span>{source}</span>
    </div>
);

export default function ResearchContent() {
    const [isExpanded, setIsExpanded] = useState(true);
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(true);
    const [currentKeyword, setCurrentKeyword] = useState('');
    const [resultCount, setResultCount] = useState(0);
    const contentRef = useRef<HTMLDivElement>(null);

    const searchTerms = [
        "criteria for assessing individual health sports performance risks diseases advantages disadvantages required data",
        "health assessment criteria pros cons data needed"
    ];

    const fullSearchResults = [
        { title: '健康评估标准', url: 'ncbi.nlm.nih.gov/books/NBK539688/', source: '必应' },
        { title: '健康需求评估方法', url: 'linkedin.com/pulse/health-needs-assessment-approaches-pros-cons-jeme-adomi', source: '微信' },
        { title: '个人健康评估', url: 'degruyter.com/document/doi/10.1515/cclm-2018-1107/html', source: 'Gemini' },
        { title: '健康计划评估', url: 'academic.oup.com/heapol/article/30/7/837/825427', source: '抖音' },
        { title: '运动表现评估', url: 'ijbnpa.biomedcentral.com/articles/10.1186/1479-5868-10-98', source: '推特' },
    ];

    const sources = ['微信', '抖音', '必应', '推特', 'Gemini'];

    useEffect(() => {
        const addResult = () => {
            if (searchResults.length < fullSearchResults.length) {
                // @ts-ignore
                setSearchResults(prev => [...prev, fullSearchResults[prev.length]]);
                setResultCount(prev => prev + 1);
            } else {
                setIsSearching(false);
                setTimeout(() => setIsExpanded(false), 2200);
            }
        };

        const updateKeyword = () => {
            const keywordIndex = Math.floor(Math.random() * searchTerms.length);
            setCurrentKeyword(searchTerms[keywordIndex]);
        };

        if (isSearching) {
            const resultTimer = setTimeout(addResult, 1000);
            const keywordTimer = setInterval(updateKeyword, 1000);
            return () => {
                clearTimeout(resultTimer);
                clearInterval(keywordTimer);
            };
        }
    }, [searchResults, isSearching]);

    return (
        <div className="w-full max-w-3xl mx-auto p-4">
            <div className="space-y-6">
                <motion.div layout className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-150">
                    <div className="p-4">
                        <div
                            className="flex justify-between items-center cursor-pointer"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            <span className="text-sm text-gray-750">
                                {isSearching
                                    ? `BlurSearch 正在搜索关键词：${currentKeyword}`
                                    : `BlurSearch 已找到 ${resultCount} 个结果`}
                            </span>
                            {isExpanded ? (
                                <ChevronUp size={20} />
                            ) : (
                                <ChevronDown size={20} />
                            )}
                        </div>

                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: contentRef.current ? contentRef.current.scrollHeight : 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                                    className="overflow-hidden mt-2"
                                    ref={contentRef}
                                >
                                    <div>
                                        {searchResults.map((result, index) => (
                                            <SearchResult key={index} result={result} index={index} />
                                        ))}
                                        {!isSearching && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 0.3, delay: searchResults.length * 0.1 }}
                                                className="mt-4 flex flex-wrap gap-2 mx-2"
                                            >
                                                {sources.map((source, index) => (
                                                    <ReadingSource key={index} source={source} />
                                                ))}
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                <div className="flex justify-end">
                    <button className="text-gray-500 hover:text-gray-700">
                        <Volume2 size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
