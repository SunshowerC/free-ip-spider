import { createConnection, Connection } from 'typeorm'
import { throttle } from 'lodash'
import { ormconfig } from '../config/ormconfig'
import logger from './services/logger'
import { spiderXila } from './spider-task/spider-xila'
import { spiderKuai } from './spider-task/spider-kuai'
import { spiderXici } from './spider-task/spider-xici'
import { spiderQiyun } from './spider-task/spider-qiyun'

let connection: Connection | undefined

const main = async () => {
  // 创建一次连接即可
  connection = connection || (await createConnection(ormconfig))

  await spiderXila(connection)
  await spiderKuai(connection)
  await spiderXici(connection)
  await spiderQiyun(connection)

  logger.info('全网站爬取完毕')
}

// 避免太频繁爬数据，保持在 1 小时内只爬一次数据
const oneHour = 60 * 60 * 1000
const throttleMain = throttle(main, oneHour)

throttleMain().catch((e) => {
  console.log('eroreroerr', e)
  logger.error('未捕获异常', {
    e
  })
})
setInterval(throttleMain, 10 * 60 * 1000)
