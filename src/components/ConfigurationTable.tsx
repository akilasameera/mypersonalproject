import React, { useState, useCallback } from 'react';

interface ConfigurationTableProps {
  content: string;
  onContentChange?: (newContent: string) => void;
  isEditable?: boolean;
}

const ConfigurationTable: React.FC<ConfigurationTableProps> = ({
  content,
  onContentChange,
  isEditable = false
}) => {
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);

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

  const handleCellChange = useCallback((rowIdx: number, colIdx: number, newValue: string) => {
    if (!rows || !onContentChange) return;

    const updatedRows = rows.map((row, rIdx) =>
      rIdx === rowIdx
        ? row.map((cell, cIdx) => (cIdx === colIdx ? newValue : cell))
        : row
    );

    const newContent = updatedRows.map(row => row.join('\t')).join('\n');
    onContentChange(newContent);
  }, [rows, onContentChange]);

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
                  } ${isEditable ? 'hover:bg-blue-50 cursor-cell' : ''}`}
                  onDoubleClick={() => isEditable && setEditingCell({ row: rowIdx, col: cellIdx })}
                >
                  {editingCell?.row === rowIdx && editingCell?.col === cellIdx && isEditable ? (
                    <input
                      autoFocus
                      type="text"
                      value={cell}
                      onChange={(e) => handleCellChange(rowIdx, cellIdx, e.target.value)}
                      onBlur={() => setEditingCell(null)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setEditingCell(null);
                        if (e.key === 'Escape') setEditingCell(null);
                      }}
                      className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    cell
                  )}
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
