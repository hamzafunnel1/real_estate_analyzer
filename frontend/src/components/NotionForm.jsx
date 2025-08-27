// import React, { useState } from 'react';

// const NotionForm = () => {
//   const [notionUrl, setNotionUrl] = useState('');
//   const [payload, setPayload] = useState('');
//   const [responseMessage, setResponseMessage] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     let parsedPayload;
//     try {
//       parsedPayload = JSON.parse(payload);
//     } catch (err) {
//       setResponseMessage('Error: Payload must be valid JSON.');
//       return;
//     }

//     setLoading(true);
//     setResponseMessage('');

//     try {
//       const res = await fetch('/api/auth/perplexity/', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           url: notionUrl,
//           payload: parsedPayload,
//         }),
//       });

//       if (res.ok) {
//         const result = await res.json();
//         setResponseMessage(`Success: ${JSON.stringify(result)}`);
//       } else {
//         const error = await res.json();
//         setResponseMessage(`Error: ${error.error || 'Unknown error'}`);
//       }
//     } catch (error) {
//       setResponseMessage(`Error: ${error.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-lg mx-auto p-6 bg-white rounded shadow">
//       <h2 className="text-xl font-bold mb-4">Notion API Proxy</h2>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label className="block font-medium mb-1">Notion API URL:</label>
//           <input
//             type="text"
//             className="w-full border px-3 py-2 rounded"
//             value={notionUrl}
//             onChange={(e) => setNotionUrl(e.target.value)}
//             required
//             placeholder="https://api.notion.com/v1/pages"
//           />
//         </div>
//         <div>
//           <label className="block font-medium mb-1">Payload (JSON):</label>
//           <textarea
//             className="w-full border px-3 py-2 rounded"
//             value={payload}
//             onChange={(e) => setPayload(e.target.value)}
//             required
//             rows={6}
//             placeholder='{"parent": {"database_id": "..."}, ...}'
//           />
//         </div>
//         <button
//           type="submit"
//           className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//           disabled={loading}
//         >
//           {loading ? 'Sending...' : 'Send to Notion'}
//         </button>
//       </form>
//       {responseMessage && (
//         <p className="mt-4">{responseMessage}</p>
//       )}
//     </div>
//   );
// };

// export default NotionForm;
