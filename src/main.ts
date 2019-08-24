import { createConnection } from 'typeorm'
import { ormconfig } from '../config/ormconfig'
import logger from './services/logger'
import { spiderXila } from './spider-task/spider-xila'
import { spiderKuai } from './spider-task/spider-kuai'
import { spiderXici } from './spider-task/spider-xici'
import { spiderQiyun } from './spider-task/spider-qiyun'

async function main() {
  const connection = await createConnection(ormconfig)

  logger.info('已打开页面')

  await Promise.all([
    spiderXila(connection).catch((e) => logger.error('xila err', { e })),
    spiderKuai(connection).catch((e) => logger.error('kuaiPage err', { e })),
    spiderXici(connection).catch((e) => logger.error('xiciPage err', { e })),
    spiderQiyun(connection).catch((e) => logger.error('qiyunPage err', { e }))
  ]).catch((e) => {
    console.log('eeeeeee', e)
  })

  logger.info('全网站爬取完毕')
}

main()
