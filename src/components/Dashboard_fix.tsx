// This is a temporary file with the fixed generateTableRows function

const generateTableRows = (words: any[], includeAnswers: boolean) => {
  const rows: string[] = [];
  const half = Math.ceil(words.length / 2);
  
  for (let i = 0; i < half; i++) {
    const leftWord = words[i];
    const rightWord = words[i + half];
    
    const leftDef = includeAnswers ? ("<span style=\"color: red;\">" + leftWord.definition + "</span>") : "";
    const rightDef = rightWord && includeAnswers ? ("<span style=\"color: red;\">" + rightWord.definition + "</span>") : "";
    
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
