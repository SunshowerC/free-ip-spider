import { Connection } from 'typeorm'
import { getIpFromWeb } from './spider-common'

const getIpPage = (num: number) => `https://www.kuaidaili.com/free/inha/${num}/`

const parseIpFromDoc = (doc: Document): string[] => {
  const ipTds = Array.from(doc.querySelectorAll(`#list > table > tbody > tr td:first-child`))
  const portTds = Array.from(doc.querySelectorAll(`#list > table > tbody > tr td:nth-child(2)`))

  const ipsFromElem = ipTds.map(
    (td, index) => `${td.textContent!.trim()}:${portTds[index].textContent!.trim()}`
  )
  return ipsFromElem
}

export const spiderKuai = (connection: Connection) => {
  return getIpFromWeb({
    getIpPage,
    parseIpFromDoc,
    connection,
    label: '快代理'
  })
}
