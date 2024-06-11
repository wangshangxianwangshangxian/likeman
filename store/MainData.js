const { get_xlsx, get_time, get_value_from_to, join_path, shuffle_array } = require("../utils/utils")
const { ENV, TASK, THREAD, TASK_MODE } = require("./constant")
const fs = require('fs')

class MainData {
	version = ''
	env       = 'dev'
	localhost = 'http://127.0.0.1:8545'
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
		//      status      : 'wait',
		//      message     : '',
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
		
		this.wallets.forEach(w => {
			this.tasks.forEach(t => {
				const info = {
					id          : Number(t.id),
					desc				: t.desc,
					func        : t.func,
					start_time  : '',
					end_time    : '',
					network     : t.network,
					chain				: t.chain || this.get_chain_random(t.network),
					status      : TASK.WAIT,
					message     : ''
				}
				w.tasks.push(info)
			})
		})

		// 随机执行
		if (this.configs.mode === TASK_MODE.RANDOM) {
			this.wallets.forEach(w => {
				shuffle_array(w.tasks)
				const temp = w.tasks.map(t => t.id)
				console.log(temp)
			})
		}
	}

	init_threads() {
		this.threads.length = 0
		new Array(this.configs.thread).fill(0).map((t, order) => {
      const info = {
        thread: order + 1,
        status: THREAD.WAIT,
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

	init_env(config = {}) {
		this.env 			 = config.env || this.env
		this.localhost = config.localhost || this.localhost
	}

	get is_prod() {
		return this.env === ENV.PROD
	}

	get_chain_random(network) {
		const arrs = this.chain_list[network] || []
		const r    = Math.floor(Math.random() * arrs.length)
		return arrs[r]
	}

	pending_thread(thread, address) {
		const target    = this.threads.find(t => t.thread === thread)
		const wallet    = this.wallets.find(w => w.address === address)
		target.status   = THREAD.PENDING
		target.wallet   = wallet
		const delay     = get_value_from_to(this.configs.thread_sleep_from, this.configs.thread_sleep_to, 2)
		const delay_d   = new Date(Date.now() + delay * 1000)
		target.deadline = get_time(delay_d)
	}

	work_thread(thread) {
		const target    = this.threads.find(t => t.thread === thread)
		target.status   = THREAD.WORK
		target.deadline = ''
	}
	
	sleep_thread(thread) {
		const target    = this.threads.find(t => t.thread === thread)
		target.status   = THREAD.SLEEP
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
		target.status   = THREAD.END
		target.wallet   = null
		target.deadline = ''
	}

	set_task_info(address, task_id, info = {}) {
		const wallet = this.wallets.find(w => w.address === address)
		const task   = this.get_task(address, task_id)
		for (let key in info) {
			task[key] = info[key]
		}
		this.save_task_log(wallet, task.id)
	}

	send_signed_transaction = async (wallet, to, abi_data, web3) => {	
		const configs     = this.configs
		const account     = wallet.address
		const private_key = wallet.private_key
	
		const estimate_gas = await web3.eth.estimateGas({ from: account, to, data: abi_data })
		const base_gas     = await web3.eth.getGasPrice()
		const priority_gas = web3.utils.toBigInt(web3.utils.toWei(get_value_from_to(configs.max_priority_fee_per_gas_from, configs.max_priority_fee_per_gas_to), 'gwei'))
		const max_eff_gas  = web3.utils.toBigInt(web3.utils.toWei(get_value_from_to(configs.max_fee_per_gas_from, configs.max_fee_per_gas_to), 'gwei'))
		const effect_gas   = base_gas + priority_gas
		
		if (effect_gas > max_eff_gas) {
			throw new Error(`基础gas ${base_gas} + 小费gas ${priority_gas} > 最大gas ${max_eff_gas}`)
		}
		
		const balance   = web3.utils.toBigInt(await web3.eth.getBalance(account))
		const total_gas = estimate_gas * effect_gas
		if (total_gas > balance) {
			throw new Error(`余额不足以支付gas费, 余额 ${balance}, gas费 ${total_gas}`)
		}
		
		const transaction = {
			from                : account,
			to                  : to,
			data                : abi_data,
			gas                 : web3.utils.toHex(estimate_gas),
			maxPriorityFeePerGas: web3.utils.toHex(priority_gas),
			maxFeePerGas        : web3.utils.toHex(max_eff_gas),
		}
		const signed_tx = await web3.eth.accounts.signTransaction(transaction, private_key)
		const receipt   = await web3.eth.sendSignedTransaction(signed_tx.rawTransaction)
		
		if (web3.utils.toNumber(receipt.status) !== 1) {
			throw new Error(receipt.message)
		}
	}

	get_task (address, task_id) {
		const wallet = this.wallets.find(w => w.address === address)
		const tasks  = wallet.tasks || []
		const task   = tasks.find(t => t.id === task_id)
		return task
	}

	// 应该写到 logger 模块的，但会出现循环引用，后续优化。
	save_task_log = (wallet, task_id, str = '') => {
		const time    = get_time()
		const task    = this.get_task(wallet.address, task_id)
		const message = [
											time,
											task.status.padEnd(7, ' '),
											task.desc,
											task.message ? `\n${task.message}\n` : '',
											str,
											'\n'
										].join('  ')
		
		const file    = join_path(`result/${this.version}/wallet/${wallet.address}.txt`)
		fs.writeFileSync(file, message, { flag: 'a+' })
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