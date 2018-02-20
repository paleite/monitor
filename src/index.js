/*
-r, --reset - Resets all services to hasChanged = false. Use this after you've regenerated and want to start monitoring again.
-f, --force - Force rechecking even though something has already been flagged as changed.
-q, --quiet - Don't output any messages
*/

import ora from 'ora'
import Lockfile from '@paleite/lockfile'

import args from '@/lib/args'
import db from '@/lib/db'

import * as services from '@/services'

/** @type {Boolean} */
const hasServices = !!Object.keys(services).length
if (!hasServices) {
  throw new Error("Couldn't find any services.")
}

/** @type {Lockfile} */
const lf = new Lockfile(__filename)
lf
  .lock()
  .then(() => {
    if (args.reset) {
      for (const service in services) {
        let serviceInstance
        try {
          serviceInstance = new services[service](db)
          serviceInstance.reset()
        } catch (e) {
          console.error(e)
          continue
        }
      }

      return
    }

    for (const service in services) {
      const spinner = ora({
        text: `${service}: Checking`,
        enabled: !(args.quiet || args.cron)
      }).start()

      let serviceInstance
      try {
        serviceInstance = new services[service](db)
      } catch (e) {
        spinner.fail(`${service}: ${e}`)
        continue
      }

      if (!args.force && serviceInstance.hasChanged) {
        spinner.info(`${service}: Already changed. Run with --reset to reset.`)
        continue
      }

      try {
        serviceInstance
          .check()
          .then(() => {
            if (serviceInstance.hasChanged) {
              const message = `${service}: New update!`
              if (args.cron) {
                console.log(message)
              }
              spinner.warn(message)
            } else {
              spinner.succeed(`${service}: Up to date.`)
            }
          })
          .catch(e => {
            spinner.fail(`${service}: ${e}`)
          })
      } catch (e) {
        spinner.fail(`${service}: ${e}`)
        continue
      }
    }
  })
  .then(() => {
    lf.unlock()
  })
  .catch(e => {
    console.error(e)
  })
