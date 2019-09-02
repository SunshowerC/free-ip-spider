import request from 'request'
import { JSDOM } from 'jsdom'
import { Connection } from 'typeorm'
import { saveAvaliableIps } from '../utils/test-ip'
import { sleep } from '../utils/common'
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
  /* eslint-disable */
  while (true) {
    const curPage = getIpPage(++i)

    const ips = await new Promise<string[]|null>((resolve, reject) => {
      request.get(
        curPage,
        {
          timeout: 10000
        },
        (error, response, body) => {
          if (error) {
            logger.warn(`Error: 获取`, {
              error: error.code
            })

            resolve(null)
          }

          const doc = new JSDOM(body).window.document

          const ipsFromDom = parseIpFromDoc(doc)
          if(ipsFromDom.length === 0 ) {
            logger.error('爬取数据异常', {
              body
            })
          }
          resolve(ipsFromDom)
        }
      )
    })

    if(!ips) {
      return false;
    }

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
