import {reconstructTransliterationForWordNode} from './transliterationReconstruction';
import {XmlElementNode, xmlElementNode, XmlNode, xmlTextNode} from 'simple_xml';

type Child = XmlElementNode | string;

const clearChildren = (children: Child[]): XmlNode[] => children.map((child) => typeof child === 'string' ? xmlTextNode(child) : child);

// Helper funcs

const w = (...children: Child[]): XmlElementNode => xmlElementNode('w', {}, clearChildren(children));

const sGr = (...children: Child[]): XmlElementNode => xmlElementNode('sGr', {}, clearChildren(children));
const aGr = (...children: Child[]): XmlElementNode => xmlElementNode('aGr', {}, clearChildren(children));
const d = (...children: Child[]): XmlElementNode => xmlElementNode('d', {}, clearChildren(children));
const num = (...children: Child[]): XmlElementNode => xmlElementNode('num', {}, clearChildren(children));

const corr = (c: string): XmlElementNode<'corr'> => xmlElementNode('corr', {c});

// Elements

const del_in = xmlElementNode('del_in');
const del_fin = xmlElementNode('del_fin');

const laes_in = xmlElementNode('laes_in');
const laes_fin = xmlElementNode('laes_fin');

const ras_in = xmlElementNode('ras_in');
const ras_fin = xmlElementNode('ras_fin');

type TestData = { node: XmlElementNode, expected: string };

// From Google Spreadsheets
const testCases: TestData[] = [
  {node: w(aGr('I-NA')), expected: '_I-NA'}, // 0 <-> Z_002
  {node: w(del_in, aGr('A-NA')), expected: '[_A-NA'},
  {node: w(aGr(del_in, 'A-NA')), expected: '_[A-NA'},
  {node: w(aGr('ME-E', del_fin)), expected: '_ME-E]'},
  {node: w(aGr('UŠ-K', del_fin, 'É-', laes_in, 'EN'), laes_fin), expected: '_UŠ-K]É-⸢EN⸣'},
  {node: w(aGr('BE-', laes_in, 'EL', laes_fin)), expected: '_BE-⸢EL⸣'}, // 5 <-> Z_007
  {node: w(aGr('I+NA')), expected: '_I+_NA'}, // TODO: failing!
  {node: w(aGr('IŠ'), corr('sic'), aGr('-TU')), expected: '_IŠsic-TU'}, // TODO: failing!
  {node: w(del_in, aGr('IN-BI'), d('ḪI.A'), '-ia-aš-ša-a', del_fin, 'n'), expected: '[_IN-BI°ḪI.A°-ia-aš-ša-a]n'},
  {node: w(aGr('ANA'), ' ', d('D'), laes_in, sGr('10'), corr('?'), laes_fin), expected: '_ANA °D°⸢10?⸣'},
  {node: w(aGr('A-DI'), ' ', sGr('EN'), aGr('-KA₄')), expected: '_A-DI EN-KA₄'}, // 10 <-> Z_012, TODO: failing!
  {node: w(aGr('A+NA'), ' ', sGr('EN'), aGr('-KA₄')), expected: '_A+_NA EN-KA₄'}, // TODO: failing!
  {node: w(aGr('AŠ-ŠUM'), ' ', sGr('DINGIR'), d('MEŠ')), expected: '_AŠ-ŠUM DINGIR°MEŠ°'},
  {node: w(aGr('QA-DU'), ' ', sGr('DINGIR'), d('MEŠ')), expected: '_QA-DU DINGIR°MEŠ°'},
  {node: w(aGr('QA-DU₄'), ' ', sGr('DINGIR'), d('MEŠ')), expected: '_QA-DU₄ DINGIR°MEŠ°'},
  {node: w(aGr('ŠA-PAL'), ' ', d('LÚ.MEŠ'), sGr('NAR')), expected: '_ŠA-PAL °LÚ.MEŠ°NAR'}, // 15 <-> Z_017
  {node: w(aGr('IŠ-TU'), ' ', num('7')), expected: '_IŠ-TU 7'},
  {node: w(aGr('A-NA'), ' ', sGr('É.GAL')), expected: '_A-NA É.GAL'},
  {node: w(aGr('I-NA'), ' ', d('GIŠ'), sGr('MA.SÁ.AB')), expected: '_I-NA °GIŠ°MA.SÁ.AB'},
  {node: w(aGr('I+NA'), ' ', d('GIŠ'), sGr('MA.SÁ.AB')), expected: '_I+_NA °GIŠ°MA.SÁ.AB'}, // TODO: failing
  {node: w(aGr('INA'), ' ', d('GIŠ'), sGr('MA.SÁ.AB')), expected: '_INA °GIŠ°MA.SÁ.AB'}, // 20 <-> Z_022
  {node: w(aGr('IT-TI BE-LÍ-KA₄')), expected: '_IT-TI _BE-LÍ-KA₄'}, // TODO: failing
  {node: w(aGr('A-NA˽ŠA-PAL'), ' ', d('GIŠ'), 'ti-im-ma-ḫi-la-aš'), expected: '_A-NA˽_ŠA-PAL °GIŠ°ti-im-ma-ḫi-la-aš'}, // TODO: failing
  {node: w(aGr('I-NA˽ŠA-PAL'), ' ', d('GIŠ'), 'ti-im-ma-ḫi-la-aš'), expected: '_I-NA˽_ŠA-PAL °GIŠ°ti-im-ma-ḫi-la-aš'}, // TODO: failing
  {node: w(aGr('I-NA˽PA-NI'), ' ', d('GIŠ'), 'ti-im-ma-ḫi-la-aš'), expected: '_I-NA˽_PA-NI °GIŠ°ti-im-ma-ḫi-la-aš'}, // TODO: failing
  {node: w(aGr('IŠ-TU˽ŠA'), ' ', sGr('LUGAL')), expected: '_IŠ-TU˽_ŠA LUGAL'}, // 25 <-> Z_027, TODO: failing
  {node: w(aGr('ŠA'), ' ', sGr('É')), expected: '_ŠA É'},
  {node: w(aGr('ŠA-A'), ' ', sGr('É')), expected: '_ŠA-A É'},
  {node: w(aGr('ŠÁ'), ' ', sGr('É')), expected: '_ŠÁ É'},
  {node: w(aGr('ŠA'), ' ', num('2'), sGr('.ÀM'), corr('!')), expected: '_ŠA 2.ÀM!'},
  {node: w(aGr('ŠA'), ' ', d('m'), 'ḫa-at-tu-ši-li'), expected: '_ŠA °m°ḫa-at-tu-ši-li'}, // 30 <-> Z_032
  {node: w(aGr('ŠA'), ' ', d('D'), 'ti-ti-', del_in, 'wa', del_fin, '-', laes_in, 'at', laes_fin, '-t', del_in, 'i'), expected: '_ŠA °D°ti-ti-[wa]-⸢at⸣-t[i'},
  {
    node: w(aGr('PA-NI'), ' ', d('D'), 'ti-ti-', del_in, 'wa', del_fin, '-', laes_in, 'at', laes_fin, '-t', del_in, 'i'),
    expected: '_PA-NI °D°ti-ti-[wa]-⸢at⸣-t[i'
  },
  {node: w('ap', corr('!'), '-pa-an'), expected: 'ap!-pa-an'},
  {node: w('pé-ra-an'), expected: 'pé-ra-an'},
  {node: w(del_in, 'ma-a-an'), expected: '[ma-a-an'}, // 35 <-> Z_037
  {node: w(del_in, 'wa-ar-nu-zi', del_fin), expected: '[wa-ar-nu-zi]'},
  {node: w('a', del_fin, 'r-ḫa'), expected: 'a]r-ḫa'},
  {node: w('d', del_fin, 'a-a-', ras_in, 'i', ras_fin), expected: 'd]a-a-*i*'},
  {node: w('lu-u', del_fin, 'k', corr('?'), '-', laes_in, 'ka', corr('?'), '-ta', laes_fin), expected: 'lu-u]k?-⸢ka?-ta⸣'},
  {node: w('z', del_fin, 'u-', laes_in, 'uz-zu', laes_fin, '-ma-k', del_in, 'i-ip'), expected: 'z]u-⸢uz-zu⸣-ma-k[i-ip'}, // 40 <-> Z_042
];

describe('textReconstruction', () =>
  test.each<TestData>(testCases)(
    '$# should reconstruct $expected correctly',
    ({node, expected}) => {
      expect(reconstructTransliterationForWordNode(node)).toEqual(expected);
    }
  )
);
