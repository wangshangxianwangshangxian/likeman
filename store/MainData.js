const { get_xlsx } = require("../utils/utils")

class MainData {

	wallets = [
		// {
		// 	address: '',
		// 	private_key: '',
		// 	tasks: []
		// }
	]

	configs = {
		thread: 1,
		thread_sleep_from: 1,
		thread_sleep_to: 1,
		task_sleep_from: 1,
		task_sleep_to: 1
	}

	tasks = []

	constructor() {
		console.log('main data init')
	}

	init_wallets() {
		const xlsx    = get_xlsx()
		const wallets = xlsx.wallet
		this.wallets.length = 0
		wallets.forEach(w => {
			const data = {
				address    : w.address,
				private_key: w.private_key,
				tasks      : []
			}
			this.wallets.push(data)
		})
	}
	
	init_configs() {
		const xlsx    = get_xlsx()
		const configs = xlsx.config
		configs.forEach(({key, value}) => {
			this.configs[key] = value
		})
	}

  static _instance
  static Ins() {
		if (!MainData._instance) {
			MainData._instance = new MainData()
		}
		return MainData._instance
  }
}

module.exports = MainData