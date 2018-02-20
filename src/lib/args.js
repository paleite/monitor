import minimist from 'minimist'
import minimistOptions from 'minimist-options'

export default minimist(
  process.argv.slice(2),
  minimistOptions({
    cron: {
      type: 'boolean',
      alias: 'c',
      default: false
    },

    reset: {
      type: 'boolean',
      alias: 'r',
      default: false
    },

    force: {
      type: 'boolean',
      alias: 'f',
      default: false
    },

    quiet: {
      type: 'boolean',
      alias: 'q',
      default: false
    }
  })
)
