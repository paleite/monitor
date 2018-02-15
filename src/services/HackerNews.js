/**
 * This is an example of how a service can be implemented
 */
// The Service-class must be imported. This contains the basis for the service.
import Service from '@/abstract/Service'

/**
 * An example implementation to get you started with the monitoring framework.
 * The classname set here will be used as the primary key (name) in the database
 * @class
 * @classdesc Monitor the top 3 posts on Hacker News
 */
export default class HackerNews extends Service {
  /**
   * This function checks if a service has updated.
   * This function must be implemented for the service to work and is required
   * to return a promise. In this example, the library Axios is used, which
   * returns a promise.
   * @returns {Promise} The promise of the service
   */
  check () {
    return this.axios
      .create({
        baseURL: 'https://hacker-news.firebaseio.com/v0',
        headers: {
          'HTTP-Accept': 'application/json'
        }
      })
      .get('/topstories.json')
      .then(res => {
        /**
         * Once you have access to your data, remove anything that you don't
         * care about and normalize the data. In this example, We're only
         * interested in the top 3 posts.
         * The service would flag this list as updated if either the values
         * changed (i.e. new posts) or the order of the values changed.
         * Other things you might want to remove are counters (e.g. likes on
         * Instagram) or dates (e.g. updated_at).
         * Preferably just keep what's important to you.
         *
         * ATTN: The database will update your data implicitly.
         */
        this.data = res.data.slice(0, 3)
      })
  }
}
