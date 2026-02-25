// Helper function to generate two-column table rows
export const generateTableRows = (words: any[], includeAnswers: boolean): string => {
  const rows: string[] = [];
  const half = Math.ceil(words.length / 2);
  const spanOpen = '<span style="color: red;">';
  const spanClose = '</span>';
  
  for (let i = 0; i < half; i++) {
    const leftWord = words[i];
    const rightWord = words[i + half];
    
    const leftDef = includeAnswers ? (spanOpen + leftWord.definition + spanClose) : "";
    const rightDef = rightWord && includeAnswers ? (spanOpen + rightWord.definition + spanClose) : "";
    
    const leftCell = "<td style=\"border: 1px solid #000; padding: 8px 12px; width: 8%; text-align: center; font-size: 11pt;\">" + (i + 1) + "</td>" +
      "<td style=\"border: 1px solid #000; padding: 8px 12px; width: 17%; font-size: 11pt;\">" + leftWord.word + "</td>" +
      "<td style=\"border: 1px solid #000; padding: 8px 12px; width: 25%; font-size: 11pt;\">" + leftDef + "</td>";
    
    let rightCell;
    if (rightWord) {
      rightCell = "<td style=\"border: 1px solid #000; padding: 8px 12px; width: 8%; text-align: center; font-size: 11pt;\">" + (i + half + 1) + "</td>" +
        "<td style=\"border: 1px solid #000; padding: 8px 12px; width: 17%; font-size: 11pt;\">" + rightWord.word + "</td>" +
        "<td style=\"border: 1px solid #000; padding: 8px 12px; width: 25%; font-size: 11pt;\">" + rightDef + "</td>";
    } else {
      rightCell = "<td style=\"border: 1px solid #000; padding: 8px 12px; width: 8%; text-align: center; font-size: 11pt;\"></td>" +
        "<td style=\"border: 1px solid #000; padding: 8px 12px; width: 17%; font-size: 11pt;\"></td>" +
        "<td style=\"border: 1px solid #000; padding: 8px 12px; width: 25%; font-size: 11pt;\"></td>";
    }
    
    rows.push("<tr>" + leftCell + rightCell + "</tr>");
  }
  
  return rows.join("");
};
