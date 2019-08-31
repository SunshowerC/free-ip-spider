import { Connection } from 'typeorm'
import { getIpFromWeb } from './spider-common'

const getIpPage = (num: number) => `https://www.xicidaili.com/nn/${num}`

const parseIpFromDoc = (doc: Document): string[] => {
  const ipTds = Array.from(doc.querySelectorAll(`#ip_list > tbody > tr td:nth-child(2)`))
  const portTds = Array.from(doc.querySelectorAll(`#ip_list > tbody > tr td:nth-child(3)`))

  const protocolTds = Array.from(doc.querySelectorAll(`#ip_list > tbody > tr td:nth-child(6)`))

  const ipsFromElem = ipTds.map((td, index) => {
    return `${protocolTds[
      index
    ].textContent!.toLocaleLowerCase()}://${td.textContent!.trim()}:${portTds[
      index
    ].textContent!.trim()}`
  })
  return ipsFromElem
}

export const spiderXici = (connection: Connection) => {
  return getIpFromWeb({
    getIpPage,
    parseIpFromDoc,
    connection,
    label: '西刺'
  })
}
