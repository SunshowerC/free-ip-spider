import request from 'request'
import { Connection } from 'typeorm'
import logger from '../services/logger'
import { IpEntity } from '../../config/entities/ip.entity'
import { saveIps } from '../services/ip.service'
import { sleep } from './common'

export type TestResult = Pick<IpEntity, 'addr' | 'origin'>

const testPath = `https://icanhazip.com/`
// const testPath = `http://httpbin.org/ip`
// const testPath = `http://www.ip.cn`

// const testPath = `http://200019.ip138.com/`  // 带地区的
let count = 0
export const testIp = async (proxyAddr: string): Promise<TestResult | null> => {
  const ip = proxyAddr.startsWith('http') ? proxyAddr : `http://${proxyAddr}`

  const testResult = new Promise<TestResult | null>((resolve) => {
    request.get(
      testPath,
      {
        proxy: ip.trim(),
        timeout: 20000
      },
      (error, response, body) => {
        // console.log('bobey', body)
        if (error) {
          logger.warn(`${ip} testIp failed`, {
            error: error.code
          })
          resolve(null)
        } else {
          // `http://icanhazip.com/`
          const valid = ip.includes(body.trim())
          const logType = valid ? 'info' : 'warn'

          logger[logType](`${ip} validate result:${valid}`, {
            body: valid ? undefined : `CannotParseIP: ${body}`,
            count: valid ? ++count : count
          })
          resolve(
            valid
              ? {
                  addr: ip,
                  origin: ''
                }
              : null
          )

          // http://200019.ip138.com/
          // const matchResult = body.match(/您的IP地址是：\[(.*)\] 来自：(.*)\s/)
          // if (matchResult) {
          //   avaliable = ip.includes(matchResult[1]) ? AvaliableEnum.True : AvaliableEnum.False
          //   origin = matchResult[2]
          // }
          // logger.info(`${origin} ${ip} validate result:${avaliable}`, {
          //   body: avaliable === AvaliableEnum.False ? `CannotParseIP: ${body}` : undefined
          // })
          // return resolve({
          //   avaliable,
          //   addr: ip,
          //   origin
          // })
        }
      }
    )
  })

  const timeoutResult = new Promise<null>((resolve) => {
    sleep(60000).then(() => resolve(null))
  })

  return Promise.race([testResult, timeoutResult])
}

/**
 * 测试 ip，保存有效 ip 到数据库
 */
export const saveAvaliableIps = async (connection: Connection, ips: string[]): Promise<number> => {
  logger.info(`准备校验 ips length: ${ips.length}`, ips)
  const allValidProm = ips.map((curIp) => testIp(curIp))
  const allIpsWithAvaliable = await Promise.all(allValidProm)

  // 串行阻塞操作
  // const allIpsWithAvaliable:any[] = []
  // for(let curIp of ips) {
  //   console.log('curU', curIp)
  //   const res = await testIp(curIp)
  //   allIpsWithAvaliable.push(res)
  // }

  // 带校验结果的所有 ip
  // 有效的 ip
  const avaliableIps = allIpsWithAvaliable.filter(Boolean) as Pick<IpEntity, 'addr' | 'origin'>[]

  logger.info(`all ips: ${allIpsWithAvaliable.length}, avaliable ips: ${avaliableIps.length}`, {
    avaliableIps
  })

  if (avaliableIps.length > 0) {
    await saveIps(connection, avaliableIps)
  }

  return avaliableIps.length
}
