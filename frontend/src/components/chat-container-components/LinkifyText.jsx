// Put near other helpers in ChatContainer.jsx

// simple linkifier for http(s) links — safe (doesn't use dangerouslySetInnerHTML)
const urlRegex = /((https?:\/\/)[\w\-.~:/?#[\]@!$&'()*+,;=%]+)/gi;
function LinkifyText(text) {
  if (!text) return text;
  const parts = [];
  let lastIndex = 0;

  text.replace(urlRegex, (match, _p1, _p2, offset) => {
    // push text before match
    if (offset > lastIndex) {
      parts.push(text.slice(lastIndex, offset));
    }

    // clean trailing punctuation like . , ) ]
    const trailing = match.match(/[.,!?;:)\]]+$/);
    const clean = trailing ? match.slice(0, -trailing[0].length) : match;
    const trailingPunct = trailing ? trailing[0] : "";

    // push link node
    parts.push(
      <a
        key={offset}
        href={clean}
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:opacity-80 break-words"
      >
        {clean}
      </a>
    );

    // push trailing punctuation as plain text (if any)
    if (trailingPunct) parts.push(trailingPunct);

    lastIndex = offset + match.length;
    return match;
  });

  // push remaining text
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));

  // if no links matched, just return the plain text
  if (parts.length === 0) return text;
  return parts;
}
export default LinkifyText;