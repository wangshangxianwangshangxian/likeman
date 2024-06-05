const { get_xlsx } = require("../utils/utils")

class MainData {

	wallets = [
		// {
		// 	address: '',
		// 	private_key: '',
		// 	tasks: [
		// 		{
		// 			id: -1,
		// 			func: '',
		// 			dependencies: -1,
		// 			start_time: '',
		// 			end_time: '',
		// 		}
		// 	]
		// }
	]

	configs = {
		thread           : 1,
		thread_sleep_from: 1,
		thread_sleep_to  : 1,
		task_sleep_from  : 1,
		task_sleep_to    : 1,
		mode             : 1
	}

	tasks = []
	threads = []

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

	init_tasks() {
		const xlsx   = get_xlsx()
		const tasks  = xlsx.task.filter(t => Number(t.exec) === 1)
		this.tasks   = tasks
		
		// 随机执行
		if (this.configs.mode === 2) {
		}
		
		this.wallets.forEach(w => {
			this.tasks.forEach(t => {
				const info = {
					id          : Number(t.id),
					func        : t.func,
					dependencies: t.dependencies || null,
					start_time  : '2024-06-05 12:58:23',
					end_time    : '',
				}
				w.tasks.push(info)
			})
		})
	}

	init_threads() {
		this.threads.length = 0
		new Array(this.configs.thread).fill(0).map((t, order) => {
      const info = {
        thread: order + 1,
        status: 'wait',
        wallet: null
      }
      this.threads.push(info)
    })
	}

	pending_thread(thread, address, delay) {
		const target  = this.threads.find(t => t.thread === thread)
		const wallet  = this.wallets.find(w => w.address === address)
		target.status = `pending ${delay}s`
		target.wallet = wallet
	}

	work_thread(thread) {
		const target  = this.threads.find(t => t.thread === thread)
		target.status = 'work'
	}
	
	wait_thread(thread) {
		const target  = this.threads.find(t => t.thread === thread)
		target.status = 'wait'
		target.wallet = null
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