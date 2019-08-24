import { Connection } from 'typeorm'
import { getIpFromWeb } from './spider-common'

const getIpPage = (num) => `http://www.xiladaili.com/gaoni/${num}/`

const parseIpFromDoc = (doc: Document): string[] => {
  const tds = doc.querySelectorAll('.fl-table tr td:first-child')
  const ipsFromElem = Array.from(tds)
    .map((td) => td.textContent)
    .filter(Boolean)
  return ipsFromElem as string[]
}

export const spiderXila = (connection: Connection) => {
  return getIpFromWeb({
    getIpPage,
    parseIpFromDoc,
    connection,
    label: '西拉'
  })
}
