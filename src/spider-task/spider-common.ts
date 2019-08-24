import request from 'request'
import { JSDOM } from 'jsdom'
import { Connection } from 'typeorm'
import { saveAvaliableIps } from 'src/utils/test-ip'
import { sleep } from 'src/utils/common'
import logger from '../services/logger'

export interface GetIpParams {
  getIpPage: (num: number) => string
  parseIpFromDoc: (doc: Document) => string[]
  connection: Connection
  label?: string
}

export async function getIpFromWeb({ getIpPage, parseIpFromDoc, connection, label }: GetIpParams) {
  // 自增页码
  let i = 0
  while (true) {
    const curPage = getIpPage(++i)

    const ips = await new Promise<string[]>((resolve, reject) => {
      request.get(curPage, (error, response, body) => {
        if (error) {
          logger.warn(`Error: 获取`, {
            error: error.code
          })

          reject(new Error('爬取页面错误'))
        }

        const doc = new JSDOM(body).window.document

        const ipsFromDom = parseIpFromDoc(doc)
        resolve(ipsFromDom)
      })
    })

    const avaliableLen = await saveAvaliableIps(connection, ips)

    logger.info(
      `正在爬取 ${label} 第 ${i} 页，当前页总 ip 数：${ips.length}, 有效 ip 数：${avaliableLen} `
    )
    // 有效 ip 太少，别爬了
    if (avaliableLen === 0) {
      logger.info(`爬取${label || curPage}完毕 总共 ${i} 页！！`)
      break
    }

    await sleep(1000)
  }
}
