const { get_xlsx, get_time, get_value_from_to, join_path } = require("../utils/utils")
const { ENV, TASK } = require("./constant")
const fs = require('fs')

class MainData {
	version = ''
	env       = 'dev'
	localhost = 'http://localhost:8545'
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
		
		// 随机执行
		if (this.configs.mode === 2) {
		}
		
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

	set_task_info(address, task_id, info = {}) {
		const wallet = this.wallets.find(w => w.address === address)
		const task   = this.get_task(address, task_id)
		for (let key in info) {
			task[key] = info[key]
		}
		this.save_task_log(wallet, task.id)
	}

	send_signed_transaction = async (wallet, to, abi_data, web3) => {
		const resp = {
			code   : 0,
			message: null,
			data   : null
		}
	
		const configs     = this.configs
		const account     = wallet.address
		const private_key = wallet.private_key
	
		const estimate_gas = Number(await web3.eth.estimateGas({ from: account, to, data: abi_data }))
		const base_gas     = Number(await web3.eth.getGasPrice())
		const priority_gas = Number(web3.utils.toWei(get_value_from_to(configs.max_priority_fee_per_gas_from, configs.max_priority_fee_per_gas_to), 'gwei'))
		const max_eff_gas  = Number(web3.utils.toWei(get_value_from_to(configs.max_fee_per_gas_from, configs.max_fee_per_gas_to), 'gwei'))
		const effect_gas   = Number(base_gas) + Number(priority_gas)
		
		if (effect_gas > max_eff_gas) {
			resp.code    = 1
			resp.message = '基础gas + 小费gas > 最大gas'
			resp.data    = { base_gas, priority_gas, max_eff_gas }
			return resp
		}
		
		const balance   = Number(await web3.eth.getBalance(account))
		const total_gas = Number(estimate_gas) * Number(effect_gas)
		if (total_gas > Number(balance)) {
			resp.code    = 2
			resp.message = '余额不足以支付 gas费'
			resp.data    = { total_gas, balance }
			return resp
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
	
		if (Number(receipt.status) !== 1) {
			resp.code    = 3
			resp.message = 'web3.eth.sendSignedTransaction 请求结果不成功'
		}
		resp.data = receipt
		return resp
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