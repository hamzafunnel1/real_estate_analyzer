import React from 'react';

const NotionFormattedResult = ({ notionResult, onBack }) => {
  if (!notionResult) {
    return (
      <div className="p-8">
        <h2>No Notion result found.</h2>
        <button onClick={onBack} className="mt-4 text-white px-4 py-2" style={{background: 'linear-gradient(90deg, #5B3DFF 0%, #00C4FF 100%)', borderRadius: '10px'}} onMouseEnter={(e) => e.target.style.background = 'linear-gradient(90deg, #4A32CC 0%, #00A3D6 100%)'} onMouseLeave={(e) => e.target.style.background = 'linear-gradient(90deg, #5B3DFF 0%, #00C4FF 100%)'}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Notion Page Created!</h2>
      {notionResult.title && (
        <h3 className="text-xl font-semibold mb-2">{notionResult.title}</h3>
      )}
      {notionResult.content && (
        <div className="mb-4 whitespace-pre-line text-gray-800">
          {notionResult.content}
        </div>
      )}
      {notionResult.url && (
        <a
          href={notionResult.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-white px-4 py-2 transition"
          style={{background: 'linear-gradient(90deg, #5B3DFF 0%, #00C4FF 100%)', borderRadius: '10px'}}
          onMouseEnter={(e) => e.target.style.background = 'linear-gradient(90deg, #4A32CC 0%, #00A3D6 100%)'}
          onMouseLeave={(e) => e.target.style.background = 'linear-gradient(90deg, #5B3DFF 0%, #00C4FF 100%)'}
        >
          View on Notion
        </a>
      )}
      {/* Show any other fields as needed */}
      <button
        onClick={onBack}
        className="mt-6 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition block"
      >
        Back
      </button>
    </div>
  );
};

export default NotionFormattedResult;
