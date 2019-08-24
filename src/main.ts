import { createConnection } from 'typeorm'
import { ormconfig } from '../config/ormconfig'
import logger from './services/logger'
import { spiderXila } from './spider-task/spider-xila'
import { spiderKuai } from './spider-task/spider-kuai'
import { spiderXici } from './spider-task/spider-xici'
import { spiderQiyun } from './spider-task/spider-qiyun'

const main = async () => {
  const connection = await createConnection(ormconfig)

  logger.info('已打开页面')

  await Promise.all([
    spiderXila(connection),
    spiderKuai(connection),
    spiderXici(connection),
    spiderQiyun(connection)
  ]).catch((e) => {
    console.log('eeeeeee', e)
  })

  logger.info('全网站爬取完毕')
}

main()
