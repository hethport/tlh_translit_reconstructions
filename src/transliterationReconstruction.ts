import {hasTagName, isXmlCommentNode, isXmlElementNode, isXmlTextNode, XmlElementNode, XmlNode, XmlTextNode} from 'simple_xml';


function getAkkadogrammPreposition(children: XmlNode[]): [XmlElementNode<'aGr'>, XmlTextNode, XmlNode[]] | undefined {
  if (children.length < 2) {
    return undefined;
  }

  const [firstChild, secondChild, ...otherChildren] = children;

  if (!isXmlElementNode(firstChild) || !hasTagName(firstChild, 'aGr') || !isXmlTextNode(secondChild) || secondChild.textContent !== ' ') {
    return undefined;
  }

  return [firstChild, secondChild, otherChildren];
}

export function reconstructTransliterationForWordNode({tagName, children}: XmlElementNode): string {
  if (tagName !== 'w') {
    throw new Error('only <w/>-Tags can be reconstructed!');
  }

  if (children.length === 0) {
    return '';
  }

  const akkadogrammPreposition = getAkkadogrammPreposition(children);

  // check for akkadian preposition...?
  if (akkadogrammPreposition !== undefined) {
    const [firstChild, /* secondChild */, [thirdChild, ...otherChildren]] = akkadogrammPreposition;

    return reconstructTransliterationFromNode(firstChild) + ' ' + reconstructTransliterationFromNode(thirdChild, true) + otherChildren.map((node) => reconstructTransliterationFromNode(node)).join('');
  } else {
    const [firstChild, ...otherChildren] = children;

    return reconstructTransliterationFromNode(firstChild, true) + otherChildren.map((node) => reconstructTransliterationFromNode(node)).join('');
  }
}

function reconstructTransliterationFromNode(node: XmlNode, isFirstChild = false): string {
  if (isXmlCommentNode(node)) {
    return '';
  }

  if (isXmlTextNode(node)) {
    return node.textContent;
  }

  const innerContent = node.children.map((c) => reconstructTransliterationFromNode(c)).join('');

  switch (node.tagName) {
  case 'del_in':
    return '[';
  case 'del_fin':
    return ']';
  case 'laes_in':
    return '⸢';
  case 'laes_fin':
    return '⸣';
  case 'ras_in':
  case 'ras_fin':
    return '*';
  case 'aGr':
    return '_' + innerContent;
  case 'sGr':
    return /*(isFirstChild ? '' : '-') +*/ innerContent;
  case 'd':
    return '°' + innerContent + '°';
  case 'num':
    return innerContent;
  case 'corr':
    return node.attributes.c || '';
  case 'note':
    return `{F: ${node.attributes.c}}`;
  case 'subscr':
    return `|${node.attributes.c}`;
  default:
    throw new Error(`tagName ${node.tagName} is not yet supported!`);
  }
}
