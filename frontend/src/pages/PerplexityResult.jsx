import React from 'react';

const PerplexityResult = ({ address, result, onBack }) => {
  if (!result) return null;
  const choices = result.choices || [];
  const mainMessage = choices[0]?.message?.content || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-700">
        <button
          onClick={onBack}
          className="mb-6 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold text-white mb-4 text-center break-words">{address}</h1>
        <div className="max-h-96 overflow-y-auto bg-slate-700 rounded-xl p-6 text-white text-base whitespace-pre-line shadow-inner">
          {mainMessage}
        </div>
        {choices.length > 1 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-slate-300 mb-2">Other Choices</h2>
            <ul className="space-y-4">
              {choices.slice(1).map((choice, idx) => (
                <li key={idx} className="bg-slate-700 rounded-lg p-4 text-slate-200">
                  {choice.message?.content || ''}
                </li>
              ))}
            </ul>
          </div>
        )}
        {/* Optionally show citations or sources if present */}
        {result.search_results && result.search_results.length > 0 && (
          <div className="mt-8">
            <h3 className="text-md font-semibold text-purple-700 mb-2">Sources</h3>
            <ul className="list-disc pl-6 space-y-1 text-sm text-blue-800">
              {result.search_results.map((src, idx) => (
                <li key={idx}>
                  {src.title ? (
                    <a href={src.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-purple-700">{src.title}</a>
                  ) : src.url}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerplexityResult; 