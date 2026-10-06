'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';

export interface MarkdownRendererProps {
  content: string | null | undefined;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) {
    return <p className="text-slate-400 italic text-sm">No written content for this lesson.</p>;
  }

  return (
    <div className="prose prose-slate max-w-none text-slate-800 text-sm leading-relaxed space-y-4">
      <ReactMarkdown
        components={{
          h1: ({ ...props }) => (
            <h1 className="text-2xl font-bold text-slate-900 border-b pb-2 mt-6 mb-3" {...props} />
          ),
          h2: ({ ...props }) => (
            <h2 className="text-xl font-bold text-slate-900 mt-5 mb-2" {...props} />
          ),
          h3: ({ ...props }) => (
            <h3 className="text-lg font-semibold text-slate-900 mt-4 mb-2" {...props} />
          ),
          p: ({ ...props }) => <p className="text-slate-700 leading-relaxed mb-4" {...props} />,
          ul: ({ ...props }) => (
            <ul className="list-disc list-inside space-y-1.5 pl-2 mb-4 text-slate-700" {...props} />
          ),
          ol: ({ ...props }) => (
            <ol className="list-decimal list-inside space-y-1.5 pl-2 mb-4 text-slate-700" {...props} />
          ),
          li: ({ ...props }) => <li className="text-slate-700" {...props} />,
          blockquote: ({ ...props }) => (
            <blockquote
              className="border-l-4 border-indigo-500 bg-indigo-50/50 pl-4 py-2 italic text-slate-700 rounded-r-lg my-4"
              {...props}
            />
          ),
          code: ({ className, children, ...props }) => {
            const isBlock = className?.includes('language-');
            return isBlock ? (
              <pre className="rounded-xl bg-slate-900 text-slate-100 p-4 text-xs font-mono overflow-x-auto my-4 shadow-inner">
                <code {...props}>{children}</code>
              </pre>
            ) : (
              <code
                className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono font-medium text-indigo-700"
                {...props}
              >
                {children}
              </code>
            );
          },
          a: ({ ...props }) => (
            <a
              className="text-indigo-600 font-semibold underline hover:text-indigo-800"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
