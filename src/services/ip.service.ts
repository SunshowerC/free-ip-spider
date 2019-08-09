import { Connection } from 'typeorm'
import { IpEntity } from '../../config/entities/ip.entity'
import logger from './logger'

// 保存ip 到数据库
export const saveIps = async (connnect: Connection, ips: Partial<IpEntity>[]) => {
  // const ipEntitys = ips.map(item => new IpEntity(item))
  const now = Math.floor(Date.now() / 1000)

  const keys = ['addr', 'origin', 'createtimestamp', 'updatetimestamp']

  const valuesStr = ips
    .map((ip) => `("${ip.addr}", "${ip.origin || ''}", ${now}, ${now})`)
    .join(',')

  const saveRes = await connnect.query(`
    INSERT INTO ip_tab (
      ${keys.join(',')}
    )
    VALUES
      ${valuesStr}
    ON DUPLICATE KEY UPDATE
      addr = VALUES(addr),
      updatetimestamp = VALUES(updatetimestamp);  
  `)

  logger.info('saveIps Result', {
    result: saveRes
  })
  return saveRes
}
