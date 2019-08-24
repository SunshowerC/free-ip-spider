import { Connection } from 'typeorm'
import { getIpFromWeb } from './spider-common'

const getIpPage = (num: number) => `http://www.qydaili.com/free/?action=china&page=${num}`

const parseIpFromDoc = (doc: Document): string[] => {
  const ipTds = Array.from(
    doc.querySelectorAll(`#content > section > div.container > table > tbody > tr td:nth-child(1)`)
  )
  const portTds = Array.from(
    doc.querySelectorAll(`#content > section > div.container > table > tbody > tr td:nth-child(2)`)
  )

  const secureTds = Array.from(
    doc.querySelectorAll(`#content > section > div.container > table > tbody > tr td:nth-child(3)`)
  )
  const ipsFromElem = ipTds
    .map((td, index) => {
      if (secureTds[index].textContent!.trim() === '高匿')
        return `http://${td.textContent!.trim()}:${portTds[index].textContent!.trim()}`

      return null
    })
    .filter(Boolean)

  return ipsFromElem as string[]
}

export const spiderQiyun = (connection: Connection) => {
  return getIpFromWeb({
    getIpPage,
    parseIpFromDoc,
    connection,
    label: '齐云'
  })
}
