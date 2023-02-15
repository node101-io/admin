const uniqueWords = new Set;

function parser(node) {
  if (node.node === 'text') {
    node.text.split(' ').forEeach(word => uniqueWords.add(word.trim()));
  } else if (node.child && Array.isArray(node.child)) {
    node.child.forEach(child => parser(child));
  }
}

module.exports = _content => {
  const content = JSON.parse(_content);

  parser(content);

  return Array.from(uniqueWords).join(' ');
}