const { get_xlsx, get_time, get_value_from_to, join_path } = require("../utils/utils")

class MainData {
	version = ''
	wallets = [
		// {
		// 	address: '',
		// 	private_key: '',
		// 	tasks: [
		// 		{
		// 			id          : -1,
		// 			func        : '',
		// 			dependencies: -1,
		// 			start_time  : '',
		// 			end_time    : '',
		//      result      : 'wait',
		//		  network     : '',
		//			chain		    : ''
		// 		}
		// 	]
		// }
	]

	configs = {
		thread           						 : 1,
		thread_sleep_from						 : 1,
		thread_sleep_to  						 : 1,
		task_sleep_from  						 : 1,
		task_sleep_to    						 : 1,
		mode             						 : 1,
		max_priority_fee_per_gas_from: 0,
		max_priority_fee_per_gas_to  : 0,
		max_fee_per_gas_from 				 : 50,
		max_fee_per_gas_to				   : 100
	}

	tasks = []
	threads = [
		// {
		// 	thread: '',
		// 	status: 'wait',
		// 	wallet: null
		// }
	]
	chain_list = {
		// 'Ethereum Mainnet': []
	}

	constructor() {
		console.log('main data init')
	}

	init_version(version) {
		this.version = version
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
					start_time  : '',
					end_time    : '',
					network     : t.network,
					chain				: t.chain || this.get_chain_random(t.network)
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

	init_chain_list() {
		const xlsx   = get_xlsx()
		const chains  = xlsx.chain

		this.chain_list = {}
		chains.forEach(row => {
			const { network, chain } = row
			this.chain_list[network] = this.chain_list[network] || []
			this.chain_list[network].push(chain)
		})
	}

	get_chain_random(network) {
		const arrs = this.chain_list[network] || []
		const r    = Math.floor(Math.random() * arrs.length)
		return arrs[r]
	}

	pending_thread(thread, address) {
		const target    = this.threads.find(t => t.thread === thread)
		const wallet    = this.wallets.find(w => w.address === address)
		target.status   = `pending`
		target.wallet   = wallet
		const delay     = get_value_from_to(this.configs.thread_sleep_from, this.configs.thread_sleep_to, 2)
		const delay_d   = new Date(Date.now() + delay * 1000)
		target.deadline = get_time(delay_d)
	}

	work_thread(thread) {
		const target    = this.threads.find(t => t.thread === thread)
		target.status   = 'work'
		target.deadline = ''
	}
	
	sleep_thread(thread) {
		const target    = this.threads.find(t => t.thread === thread)
		target.status   = 'sleep'
		const delay     = get_value_from_to(this.configs.task_sleep_from, this.configs.task_sleep_to, 2)
		const delay_d   = new Date(Date.now() + delay * 1000)
		target.deadline = get_time(delay_d)
		return delay
	}
	
	wait_thread(thread) {
		const target    = this.threads.find(t => t.thread === thread)
		target.status   = 'wait'
		target.wallet   = null
		target.deadline = ''
	}

	end_thread(thread) {
		const target    = this.threads.find(t => t.thread === thread)
		target.status   = 'end'
		target.wallet   = null
		target.deadline = ''
	}

	set_task_info(address, id, info = {}) {
		const wallet = this.wallets.find(w => w.address === address)
		const task   = wallet.tasks.find(t => t.id === id)
		for (let key in info) {
			task[key] = info[key]
		}
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