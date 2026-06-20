import sesothoHymnsOriginal from './hymns.json'
import zuluHymns from './hymns_zulu.json'
import xhosaHymns from './hymns_xhosa.json'
import setswanaHymns from './hymns_setswana.json'

// Keep the original hymns.json for backwards compatibility
// We map them into the same format
export const languages = {
  sesotho: {
    id: 'sesotho',
    name: 'Sesotho',
    data: sesothoHymnsOriginal
  },
  zulu: {
    id: 'zulu',
    name: 'isiZulu',
    data: zuluHymns
  },
  xhosa: {
    id: 'xhosa',
    name: 'isiXhosa',
    data: xhosaHymns
  },
  setswana: {
    id: 'setswana',
    name: 'Setswana',
    data: setswanaHymns
  }
}

export const defaultLanguage = 'sesotho'

export function getHymnsByLanguage(langId) {
  return languages[langId]?.data || languages[defaultLanguage].data
}

export function getHymnById(langId, hymnId) {
  const hymns = getHymnsByLanguage(langId)
  const index = hymns.findIndex(h => h.id === hymnId)
  return {
    hymn: index !== -1 ? hymns[index] : null,
    currentIndex: index,
    hymnsList: hymns
  }
}
