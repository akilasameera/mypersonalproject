import React from 'react';

interface ConfigurationTableProps {
  content: string;
}

const ConfigurationTable: React.FC<ConfigurationTableProps> = ({ content }) => {
  const parseTableContent = (text: string) => {
    const lines = text.trim().split('\n');
    if (lines.length === 0) return null;

    const rows = lines.map(line => line.split('\t').map(cell => cell.trim()));

    if (rows.length === 1 && rows[0].length === 1) {
      return null;
    }

    return rows;
  };

  const rows = parseTableContent(content);

  if (!rows || rows.length === 0) {
    return (
      <div className="text-gray-600 whitespace-pre-wrap break-words">
        {content}
      </div>
    );
  }

  const isFirstRowHeader = rows.length > 1;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300">
        <tbody>
          {rows.map((row, rowIdx) => (
            <tr key={rowIdx} className={rowIdx === 0 && isFirstRowHeader ? 'bg-blue-100' : rowIdx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
              {row.map((cell, cellIdx) => (
                <td
                  key={cellIdx}
                  className={`border border-gray-300 px-4 py-2 text-sm ${
                    rowIdx === 0 && isFirstRowHeader
                      ? 'font-semibold text-gray-900'
                      : 'text-gray-700'
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ConfigurationTable;
